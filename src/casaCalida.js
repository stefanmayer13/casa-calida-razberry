/**
 * @author <a href="mailto:stefan@stefanmayer.me">Stefan Mayer</a>
 */

const log = require('./logger');
const request = require('./utils/request');
const url = require('./urls').casacalida;

const config = require(`./config`);

module.exports = {
    check() {
        return request.get(config.getHcBaseUrl() + url.check, {
            'Token': config.getToken(),
        }).then((data) => {
            if (data.statusCode !== 200) {
                log.error(`Couldn't connect to casacalida. Code ${data.statusCode}`);
                throw new Error(`${data.statusCode} ${data.error}`);
            }
            return data.body;
        });
    },

    fullUpdate(update) {
        log.info('Full update sent');
        return request.post(config.getHcBaseUrl() + url.fullUpdate, update, {
            'Token': config.getToken(),
        }).then((data) => {
            if (data.statusCode !== 200) {
                log.error(`Couldn't send full update. Code ${data.statusCode}`);
                throw new Error(`${data.statusCode} ${data.error}`);
            }
            return data.body;
        });
    },

    incrementalUpdate(update) {
        log.info('Incremental update sent');
        return request.post(config.getHcBaseUrl() + url.incrementalUpdate, update, {
            'Token': config.getToken(),
        }).then((data) => {
            if (data.statusCode !== 200) {
                log.error(`Couldn't send incremental update. Code ${data.statusCode}`);
                throw new Error(`${data.statusCode} ${data.error}`);
            }
            return data.body;
        });
    },
};
