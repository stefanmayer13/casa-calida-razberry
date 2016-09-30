/**
 * @author <a href="mailto:stefan@stefanmayer.me">Stefan Mayer</a>
 */

const merge = require('deepmerge');
const moment = require('moment');
const request = require('./utils/request');
const logger = require('./logger');
const casaCalida = require('./casaCalida');

const waterControlConverter = require('./converter/WaterControl');

function getIotData(ips) {
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
            }).then(data => waterControlConverter(data, 'iot', 'sprinkler'));
    })).then(iotData => {
        const controllerUpdates = iotData.map((data) => {
            return {name: 'iot', sensors: data.map(sensor => {
                return {
                    deviceId: 'sprinkler',
                    sensor,
                };
            })};
        });
        if (controllerUpdates.length > 0) {
            logger.info('Incremental iot update sent');
            casaCalida.incrementalUpdate(controllerUpdates).then(data => {
                const jobs = data.jobs.filter(job => job.device === 'iot-sprinkler').map(job => {
                    logger.info(`Sending ${job.type}=${job.value} to iot device`);
                    let prefix = '';
                    if (job.type === 'time') {
                        prefix = 'daily'
                    }
                    return request.get(`http://192.168.1.110/api/${prefix}?${job.type}=${job.value}`);
                });
                return Promise.all(jobs);
            });
        }
    }).catch(e => {
        logger.error(e);
    });
}

function fullIotData(ips) {
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
            const sensors = waterControlConverter(data, 'iot', 'sprinkler');
            return {
                deviceId: 'sprinkler',
                name: 'Sprinkler Control',
                deviceType: 'Sprinkler Control',
                isAwake: true,
                vendor: 'Casa-Calida',
                brandName: 'Casa-Calida',
                productName: 'Sprinkler Control',
                sensors,
            }
        })}];
        logger.info('Full iot update sent');
        return casaCalida.fullUpdate(update);
    }).catch(e => {
        logger.error(e);
    });
}

module.exports = function iot(ips) {
    return casaCalida.check()
        .then(() => {
            setInterval(getIotData.bind(null, ips), 300000);
            return fullIotData(ips);
        }).catch(e => {
            logger.error(e);
        });
};
