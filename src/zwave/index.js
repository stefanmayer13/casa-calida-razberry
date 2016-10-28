/**
 * @author <a href="mailto:stefan@stefanmayer.me">Stefan Mayer</a>
 */

const merge = require('deepmerge');
const logger = require('../logger');

const authentication = require('./authentication');
const devicesApi = require('./devices');
const casaCalida = require('../casaCalida');
const sensorConverter = require('./converter/Sensor');

const commandClassConverter = {
    '38': require('./converter/SwitchMultilevel'),
    '48': require('./converter/SensorBinary'),
    '49': require('./converter/SensorMultilevel'),
    '156': require('./converter/AlarmSensor'),
};

const state = {
    cookie: null,
    auth: null,
};
let controllers = [];

function getSensorData(key) {
    const data = key.split('.');
    const deviceId = data[1];
    if (data[2] === 'instances' && data[4] === 'commandClasses' && !isNaN(parseInt(data[5], 10))) {
        const commandClass = data[5];
        const sensorKey = data[7];
        const instance = data[3];
        return {
            deviceId,
            commandClass,
            sensorKey,
            instance,
        };
    }
}

function getIncrementalUpdate(websocket) {
    Promise.all(controllers.map(controller =>
        devicesApi.getIncrementalUpdate(state, controller.name, controller.lastUpdate)
            .then((data) => {
                const keys = Object.keys(data);
                controller.lastUpdate = data.updateTime;
                // logger.info(`Polling incremental update @ ${lastUpdate}. Received ${keys.length - 1} updates.`);
                if (keys.length > 1) {
                    const sensorsData = keys.map((key) => {
                        const sensorData = getSensorData(key);
                        if (!sensorData || !commandClassConverter[sensorData.commandClass]) {
                            return null;
                        }
                        const converter = commandClassConverter[sensorData.commandClass];
                        if (!converter.isValidKey(sensorData.sensorKey)) {
                            return null;
                        }
                        const deviceKey = `${controller.name}_${sensorData.deviceId}`;
                        const keyPrefix = `${deviceKey}-${sensorData.instance}-${sensorData.commandClass}-${sensorData.sensorKey}`;
                        const sensor = merge({
                            key: keyPrefix,
                            commandClass: sensorData.commandClass,
                            lastUpdate: data[key].updateTime,
                        }, converter.convert(data[key]));

                        logger.verbose(`Updated device data on device ${deviceKey}`, sensor);
                        return {
                            deviceId: deviceKey,
                            sensor,
                        };
                    }).filter((sensor) => !!sensor);
                    return {name: controller.name, sensors: sensorsData};
                }
            })
            .catch((e) => {
                logger.error(e);
                if (e.response && e.response.statusCode === 403) {
                    return authentication.login(state.auth.username, state.auth.password).then((cookie) => {
                        logger.info('Reauthenticated zwave');
                        state.cookie = cookie;
                    }).catch((error) => {
                        logger.error(error);
                        process.exit(3);
                    });
                }
            })
    )).then(data => {
        const controllerUpdates = data.filter(controller => !!controller);
        if (controllerUpdates.length > 0) {
            logger.info('Incremental zwave update sent');
            casaCalida.incrementalUpdate(websocket, controllerUpdates);
        }
    }).catch(e => {
        logger.error(e);
    });
}

function getDeviceDataForController(controller, sensorsData) {
    const data = controller.data;
    controller.controller.lastUpdate = data.updateTime;

    const keys = Object.keys(data.devices);
    logger.info(`Found ${keys.length} zwave devices`);

    const devices = keys.map((key) => {
        const instance = '0';
        const commandClasses = Object.keys(data.devices[key].instances[instance].commandClasses);
        const deviceKey = `${controller.controller.name}_${key}`;
        const sensors = commandClasses
            .filter((commandClass) => commandClassConverter[commandClass])
            .map((commandClass) => {
                const keyPrefix = `${deviceKey}-${instance}-${commandClass}`;
                const converter = commandClassConverter[commandClass];
                return sensorConverter(keyPrefix, commandClass, data.devices[key].instances[instance].commandClasses[commandClass], converter, sensorsData, deviceKey);
            });

        const flattenSensors = [].concat.apply([], sensors);

        return {
            deviceId: deviceKey,
            name: data.devices[key].data.givenName.value,
            xml: data.devices[key].data.ZDDXMLFile.value,
            deviceType: data.devices[key].data.deviceTypeString.value,
            isAwake: data.devices[key].data.isAwake.value,
            vendor: data.devices[key].data.vendorString.value,
            battery: {
                value: data.devices[key].instances[instance].commandClasses['128'] ? data.devices[key].instances[instance].commandClasses['128'].data.last.value : null,
            },
            protocol: 'zwave',
            sensors: flattenSensors,
        };
    });

    const xmlRequest = devices.filter((device) => !!device.xml)
        .map((device) => devicesApi.getXml(state, device.xml));

    return Promise.all(xmlRequest)
        .then((xmlData) => xmlData.map((doc) => {
            const description = doc.object.ZWaveDevice.deviceDescription[0].description[0].lang.reduce((prev, descr) => {
                prev[descr.$['xml:lang']] = descr._;
                return prev;
            }, {});
            return {
                xml: doc.xml,
                brandName: doc.object.ZWaveDevice.deviceDescription[0].brandName[0],
                productName: doc.object.ZWaveDevice.deviceDescription[0].productName[0],
                battery: {
                    type: doc.object.ZWaveDevice.deviceDescription[0].batteryType[0],
                    count: doc.object.ZWaveDevice.deviceDescription[0].batteryCount[0],
                },
                description,
                deviceImage: doc.object.ZWaveDevice.resourceLinks[0].deviceImage[0].$.url,
            };
        }))
        .then((deviceDates) => devices.map((device) => {
                const xmlData = deviceDates.filter((xmlDeviceData) => device.xml === xmlDeviceData.xml);
                if (xmlData.length > 0) {
                    return merge(device, xmlData[0]);
                }
                return device;
            })
        ).then(devices => ({name: controller.controller.name, devices}));
}

module.exports = {
    init(username, password, websocket) {
        logger.info(`Zwave started`);
        state.auth = {
            username,
            password,
        };
        return authentication.login(username, password)
            .then((result) => {
                logger.info('Connected to zwave');
                state.cookie = result.split(';')[0];
                return devicesApi.getController(state);
            }).then((results) => {
                controllers = results.map(controller => {
                    return {
                        name: controller,
                        lastUpdate: 0,
                    };
                });
                return Promise.all(controllers.map(controller => devicesApi.getDevicesInfo(state, controller)));
            }).then((data) =>
                devicesApi.getZAutomationInfo(state).then((sensors) => {
                    const sensorsData = sensors.map(sensor => ({
                        id: sensor.id,
                        title: sensor.metrics.title,
                        icon: sensor.metrics.icon,
                        tags: sensor.tags.join(','),
                    }));
                    return Promise.all(data.map(controller => getDeviceDataForController(controller, sensorsData)));
                })
            ).then((devices) => {
                logger.info('Full zwave update sent');
                setInterval(getIncrementalUpdate.bind(null, websocket), 5000);
                return casaCalida.fullUpdate(websocket, devices);
            });
    },

    action(id, value) {
        return devicesApi.sendCommand(state, id, value).catch((e) => {
            logger.error(e);
        })
    }
};