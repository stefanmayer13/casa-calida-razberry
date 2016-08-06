const moment = require('moment');
const request = require('./utils/request');
const logger = require('./logger');
const casaCalida = require('./casaCalida');

function getIotData(ips) {
    logger.verbose('Getting data from iot devices');
    return Promise.all(ips.map(ip => {
        logger.verbose(`Connecting to iot device http://${ip}/api/`);
        return request.get(`http://${ip}/api/`)
            .then((data) => {
                if (data.statusCode !== 200) {
                    log.error(`Couldn't get iot device info from ${ip}. Code ${data.statusCode}`);
                    throw new Error(`${data.statusCode} ${data.error}`);
                }
                return data.body;
            });
    })).then(data => {
        console.log(data);
    }).catch(e => {
        logger.error(e);
    });
}

function setIotTime(ips) {
    const date = moment().format('YYYY-MM-DD');
    const hour = moment().format('HH');
    const minute = moment().format('mm');

    return Promise.all(ips.map(ip => {
        logger.verbose(`Setting time on iot device http://${ip}/api/`);
        console.log(`http://${ip}/api/time?date=${date}&time=${hour}%3A${minute}`);
        return request.get(`http://${ip}/api/time?date=${date}&time=${hour}%3A${minute}`)
            .then((data) => {
                if (data.statusCode !== 200) {
                    log.error(`Couldn't set iot device time at ${ip}. Code ${data.statusCode}`);
                    throw new Error(`${data.statusCode} ${data.error}`);
                }
                return data.body;
            });
    })).catch(e => {
        logger.error(e);
    });
}

module.exports = function iot(ips) {
    return casaCalida.check()
        .then(() => {
            setIotTime(ips).then(getIotData.bind(null, ips));
            setInterval(getIotData.bind(null, ips), 120000);
            setInterval(setIotTime.bind(null, ips), 3600000);
        }).catch(e => {
            logger.error(e);
        });
};
