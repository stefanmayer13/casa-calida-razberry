/**
 * @author <a href="mailto:stefan@stefanmayer.me">Stefan Mayer</a>
 */

const WebSocket = require('ws');
const log = require('./logger');
const request = require('./utils/request');
const url = require('./urls').casacalida;
const config = require('./config');

const CasaCalida = {
    connect() {
        return new Promise((resolve, reject) => {
            const socket = new WebSocket(`${config.getCasaClidaWebsocketBaseUrl()}/iot/`);
            socket.onmessage = (e) => {
                const data = JSON.parse(e.data);
                console.log(data); //TODO remove
                if (data.type === 'login') {
                    log.info(`Logged in at CasaCalida with user ${data.user}`);
                    resolve(socket);
                }
            };
            socket.onopen = () => {
                socket.send(JSON.stringify({
                    type: 'login',
                    token: config.getToken()
                }));
            };
            socket.onclose = () => {
                log.info(`Connection to casacalida closed`);
                throw new Error('CasaCalida connection closed');
            };
            socket.onerror = (e) => {
                log.error(`Couldn't connect to casacalida. ${e}`);
                reject(e);
            };
        });
    },

    fullUpdate(socket, update) {
        if (!socket) {
            throw new Error('Not connected to CasaCalida')
        }

        socket.send(JSON.stringify({
            type: 'fullupdate',
            data: update
        }));
    },

    incrementalUpdate(socket, update) {
        if (!socket) {
            throw new Error('Not connected to CasaCalida')
        }

        socket.send(JSON.stringify({
            type: 'update',
            data: update
        }));
    }
};

module.exports = CasaCalida;
