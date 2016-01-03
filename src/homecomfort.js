/**
 * @author <a href="mailto:stefanmayer13@gmail.com">Stefan Mayer</a>
 */

const log = require('./logger');
const request = require('./utils/request');
const url = require('./urls').homecomfort;

const environment = require(`../config`).homecomfort;
const baseUrl = (environment.secure ? 'https' : 'http') + `://${environment.server}:${environment.port}/api/`;

module.exports = {
    check() {
        return request.get(baseUrl + url.check, {
            'Token': environment.token,
        }).then((data) => {
            if (data.statusCode !== 200) {
                log.error(`Couldn't connect to homecomfort. Code ${data.statusCode}`);
                throw new Error(`${data.statusCode} ${data.error}`);
            }
            return data.body;
        });
    },

    fullUpdate(update) {
        log.info('Full update sent');
        return request.post(baseUrl + url.fullUpdate, update, {
            'Token': environment.token,
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
        return request.post(baseUrl + url.incrementalUpdate, update, {
            'Token': environment.token,
        }).then((data) => {
            if (data.statusCode !== 200) {
                log.error(`Couldn't send incremental update. Code ${data.statusCode}`);
                throw new Error(`${data.statusCode} ${data.error}`);
            }
            return data.body;
        });
    },
};
