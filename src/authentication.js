/**
 * @author <a href="mailto:stefanmayer13@gmail.com">Stefan Mayer</a>
 */

const log = require('./logger');
const request = require('./utils/request');
const url = require('./urls').zwave;

const config = require(`./config`);

module.exports = {
    login: function login(username, password, rememeberMe = false) {
        return request.post(config.getZwaveBaseUrl() + url.login, {
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
