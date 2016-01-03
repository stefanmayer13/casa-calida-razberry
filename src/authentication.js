/**
 * @author <a href="mailto:stefanmayer13@gmail.com">Stefan Mayer</a>
 */

const log = require('./logger');
const request = require('./utils/request');
const url = require('./urls').zwave;

const environment = require(`../config`).zwave;
const baseUrl = (environment.secure ? 'https' : 'http') + `://${environment.server}:${environment.port}`;

module.exports = {
    login: function login(username, password, rememeberMe = false) {
        return request.post(baseUrl + url.login, {
            login: username,
            password,
            keepme: rememeberMe,
        }).then((data) => {
            return data.res.headers['set-cookie'][0];
        }).catch((e) => {
            log.error('Login not successful');
            throw e;
        });
    },
};
