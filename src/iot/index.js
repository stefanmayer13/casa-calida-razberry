/**
 * @author <a href="mailto:stefan@stefanmayer.me">Stefan Mayer</a>
 */

const moment = require('moment');
const request = require('../utils/request');
const logger = require('../logger');
const casaCalida = require('../CasaCalida');

const waterControlConverter = require('./converter/WaterControl');
const temperatureSensorConverter = require('./converter/TemperatureSensor');

const iotMapping = {
    'casa-calida-sprinkler': waterControlConverter,
    'casa-calida-temperature-outside': waterControlConverter,
    'casa-calida-temperature': temperatureSensorConverter,
};

const actuatorMapping = {};

function getIotData(ips, websocket) {
    logger.verbose('Getting data from iot devices');
    return Promise.all(ips.map(ip => {
        logger.verbose(`Connecting to iot device http://${ip}/api/`);
        return request.get(`http://${ip}/api/`)
            .then(data => {
                if (data.statusCode !== 200) {
                    logger.error(`Couldn't get iot device info from ${ip}. Code ${data.statusCode}`);
                    throw new Error(`${data.statusCode} ${data.error}`);
                }
                return data.body;
            }).then(data => {
                const converter = iotMapping[data.type];
                if (converter) {
                    return converter(data, 'iot', data.id).map(sensor => ({
                        deviceId: data.id,
                        sensor
                    }));
                }
                return null;
            });
        }).filter(device => !!device)
    ).then(iotData => {
        const controllerUpdates = iotData.map(data => ({
            name: 'iot',
            sensors: data
        }));
        if (controllerUpdates.length > 0) {
            logger.info('Incremental iot update sent');
            casaCalida.incrementalUpdate(websocket, controllerUpdates);
        }
    }).catch(e => {
        logger.error(e);
    });
}

function fullIotData(ips, websocket) {
   return Promise.all(ips.map(ip => {
        logger.verbose(`Getting data for iot device http://${ip}/api/`);
        return request.get(`http://${ip}/api/`)
            .then((data) => {
                if (data.statusCode !== 200) {
                    logger.error(`Couldn't get iot data from ${ip}. Code ${data.statusCode}`);
                    throw new Error(`${data.statusCode} ${data.error}`);
                }
                actuatorMapping[data.body.id] = {ip};
                return data.body;
            }).catch((e) => {
                logger.error(e);
                return null;
            });
    })).then(deviceData => {
        const update = [{name: 'iot', devices: deviceData.filter(data => !!data)
          .map(data => {
            const converter = iotMapping[data.type];
            if (converter) {
                const sensors = converter(data, 'iot', data.id);
                actuatorMapping[data.id].actuators = sensors
                    .filter(sensor => sensor.deviceType === 'actuator')
                    .map(actuator => actuator.key);
                return {
                    deviceId: data.id,
                    name: data.name,
                    deviceType: data.type,
                    isAwake: true,
                    vendor: 'Casa-Calida',
                    brandName: 'Casa-Calida',
                    productName: data.name,
                    protocol: 'iot',
                    sensors,
                }
            }
            return null;
        }).filter(device => !!device)}];
        logger.info('Full iot update sent');
        return casaCalida.fullUpdate(websocket, update);
    }).catch(e => {
        logger.error(e);
    });
}

function action(id, value) {
    const deviceId = id.substring(4, id.indexOf('-', 4));
    const ip = actuatorMapping[deviceId].ip
    return request.get(`http://${ip}/${value}`).then((data) => {
        if (data.statusCode !== 200) {
            log.error(`Couldn't send command ${value} to ${id}. Code ${data.statusCode}`);
            throw new Error(`${data.statusCode} ${data.error}`);
        }
        return data.body;
    });
}

module.exports = function iot(ips, websocket) {
    setInterval(getIotData.bind(null, ips, websocket), 300000);
    return fullIotData(ips, websocket)
        .then((data) => {
            casaCalida.register('iot', {action});
            return data;
        });
};
