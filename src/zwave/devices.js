/**
 * @author <a href="mailto:stefan@stefanmayer.me">Stefan Mayer</a>
 */

const xml2js = require('xml2js');
const parser = new xml2js.Parser();
const log = require('../logger');
const request = require('../utils/request');
const url = require('../urls').zwave;

const config = require(`../config`);

module.exports = {
    getController(state) {
        return request.get(`${config.getZwaveBaseUrl()}${url.list}0`, {
            'Cookie': state.cookie,
        }).then((data) => {
            if (data.statusCode !== 200) {
                log.error(`Couldn't get controller info. Code ${data.statusCode}`);
                throw new Error(`${data.statusCode} ${data.error}`);
            }
            return data.body;
        });
    },

    getDevicesInfo(state, controller) {
        return request.get(`${config.getZwaveBaseUrl()}${url.data.replace('${0}', controller.name)}0`, {
            'Cookie': state.cookie,
        }).then((data) => {
            if (data.statusCode !== 200) {
                log.error(`Couldn't get device info for ${controller.name}. Code ${data.statusCode}`);
                throw new Error(`${data.statusCode} ${data.error}`);
            }
            return {controller, data: data.body};
        });
    },

    getZAutomationInfo(state) {
        return request.get(`${config.getZwaveBaseUrl()}${url.devices}`, {
            'Cookie': state.cookie,
        }).then((data) => {
            if (data.statusCode !== 200) {
                log.error(`Couldn't get additional device infos. Code ${data.statusCode}`);
                throw new Error(`${data.statusCode} ${data.error}`);
            }
            return data.body.data.devices;
        });
    },

    getXml(state, file) {
        return request.get(`${config.getZwaveBaseUrl()}${url.xml}/${file}`, null, {
            'Cookie': state.cookie,
        }).then((data) => {
            if (data.statusCode !== 200) {
                log.error(`Couldn't get device xml. Code ${data.statusCode}`);
                throw new Error(`${data.statusCode} ${data.error}`);
            }

            return new Promise((resolve, reject) => {
                parser.parseString(data.text, (err, xmlObject) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve({
                        xml: file,
                        object: xmlObject,
                    });
                });
            });
        });
    },

    getIncrementalUpdate(state, controller, lastUpdate) {
        return request.get(config.getZwaveBaseUrl() + url.data.replace('${0}', controller) + lastUpdate, {
            'Cookie': state.cookie,
        }).then((data) => {
            if (data.statusCode !== 200) {
                log.error(`Couldn't get incremental update. Code ${data.statusCode}`);
                throw new Error(`${data.statusCode} ${data.error}`);
            }
            return data.body;
        });
    },
};
