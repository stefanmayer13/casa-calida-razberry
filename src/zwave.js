/**
 * @author <a href="mailto:stefan@stefanmayer.me">Stefan Mayer</a>
 */

const merge = require('deepmerge');
const logger = require('./logger');

const authentication = require('./authentication');
const devicesApi = require('./devices');
const casaCalida = require('./casaCalida');
const sensorConverter = require('./converter/Sensor');

const commandClassConverter = {
    '48': require('./converter/SensorBinary'),
    '49': require('./converter/SensorMultilevel'),
    '156': require('./converter/AlarmSensor'),
};

const state = {
    cookie: null,
    auth: null,
};
let lastUpdate = 0;

function getSensorData(key) {
    const data = key.split('.');
    const deviceId = data[1];
    if (data[2] === 'instances' && data[4] === 'commandClasses' && !isNaN(parseInt(data[5], 10))) {
        const commandClass = data[5];
        const sensorKey = data[7];
        return {
            deviceId,
            commandClass,
            sensorKey,
        };
    }
}

function getIncrementalUpdate() {
    devicesApi.getIncrementalUpdate(state, lastUpdate)
        .then((data) => {
            const keys = Object.keys(data);
            lastUpdate = data.updateTime;
            // logger.info(`Polling incremental update @ ${lastUpdate}. Received ${keys.length - 1} updates.`);
            if (keys.length > 1) {
                const sensorsData = keys.map((key) => {
                    const sensorData = getSensorData(key);
                    if (!sensorData || !commandClassConverter[sensorData.commandClass]) {
                        return null;
                    }
                    const converter = commandClassConverter[sensorData.commandClass];
                    const sensor = merge({
                        key: sensorData.sensorKey,
                        commandClass: sensorData.commandClass,
                        lastUpdate: data[key].updateTime,
                    }, converter(data[key]));

                    logger.info(`Updated device data on device ${sensorData.deviceId}`, sensor);
                    return {
                        deviceId: sensorData.deviceId,
                        sensor,
                    };
                }).filter((sensor) => !!sensor);
                return casaCalida.incrementalUpdate(sensorsData);
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
        });
}

module.exports = function zwave(username, password) {
    logger.info(`Zwave started`);
    state.auth = {
        username,
        password,
    };
    return Promise.all([
        casaCalida.check(),
        authentication.login(username, password),
    ]).then((results) => {
        logger.info('Connected to casa-calida and zwave');
        state.cookie = results[1].split(';')[0];
        return devicesApi.getDevicesInfo(state);
    }).then((data) => {
        lastUpdate = data.updateTime;
        setInterval(getIncrementalUpdate, 5000);

        const keys = Object.keys(data.devices);
        logger.info(`Found ${keys.length} zwave devices`);

        const devices = keys.map((key) => {
            const commandClasses = Object.keys(data.devices[key].instances['0'].commandClasses);
            const sensors = commandClasses
                .filter((commandClass) => commandClassConverter[commandClass])
                .map((commandClass) => {
                    const converter = commandClassConverter[commandClass];
                    return sensorConverter(commandClass, data.devices[key].instances['0'].commandClasses[commandClass], converter);
                });

            const flattenSensors = [].concat.apply([], sensors);

            return {
                deviceId: key,
                name: data.devices[key].data.givenName.value,
                xml: data.devices[key].data.ZDDXMLFile.value,
                deviceType: data.devices[key].data.deviceTypeString.value,
                isAwake: data.devices[key].data.isAwake.value,
                vendor: data.devices[key].data.vendorString.value,
                battery: {
                    value: data.devices[key].instances['0'].commandClasses['128'] ? data.devices[key].instances['0'].commandClasses['128'].data.last.value : null,
                },
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
            );
    }).then((devices) => casaCalida.fullUpdate(devices));
};
