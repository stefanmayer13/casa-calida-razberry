/**
 * @author <a href="mailto:stefan@stefanmayer.me">Stefan Mayer</a>
 */

module.exports = {
    zwave: {
        login: '/ZAutomation/api/v1/login',
        list: '/ZWave/list/',
        data: '/ZWave.${0}/Data/',
        devices: '/ZAutomation/api/v1/devices',
        xml: '/ZDDX',
    },
    casacalida: {
        check: 'v1/check/',
        fullUpdate: 'v1/fullupdate/',
        incrementalUpdate: 'v1/incrementalupdate/',
    },
};
