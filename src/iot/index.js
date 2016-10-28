/**
 * @author <a href="mailto:stefan@stefanmayer.me">Stefan Mayer</a>
 */

const merge = require('deepmerge');
const moment = require('moment');
const request = require('../utils/request');
const logger = require('../logger');
const casaCalida = require('../casaCalida');

const waterControlConverter = require('./converter/WaterControl');
const temperatureSensorConverter = require('./converter/TemperatureSensor');

const iotMapping = {
    'casa-calida-sprinkler': waterControlConverter,
    'casa-calida-temperature': temperatureSensorConverter,
};

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
                    return converter(data, 'iot', data.id).map(sensor => {
                        return {
                            deviceId: data.id,
                            sensor
                        }
                    });
                }
                return null;
            });
        }).filter(device => !!device)
    ).then(iotData => {
        const controllerUpdates = iotData.map(data => {
            return {name: 'iot', sensors: data}
        });
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
                return data.body;
            });
    })).then(deviceData => {
        const update = [{name: 'iot', devices: deviceData.map(data => {
            const converter = iotMapping[data.type];
            if (converter) {
                const sensors = converter(data, 'iot', data.id);
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

module.exports = function iot(ips, websocket) {
    setInterval(getIotData.bind(null, ips, websocket), 300000);
    return fullIotData(ips, websocket);
};
