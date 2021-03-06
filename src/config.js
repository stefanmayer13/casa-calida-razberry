/**
 * @author <a href="mailto:stefan@stefanmayer.me">Stefan Mayer</a>
 */

module.exports = {
    setPath(newPath) {
        this.path = newPath;
    },

    getConfig() {
        if (!this.path) {
            return {
                zwave: {},
                casacalida: {},
            };
        }
        return require(this.path);
    },

    getZwaveBaseUrl() {
        const zwaveConfig = this.getConfig().zwave;
        return `${zwaveConfig.secure ? 'https' : 'http'}://${zwaveConfig.server}:${zwaveConfig.port}`;
    },

    getHcBaseUrl() {
        const hcConfig = this.getConfig().casacalida;
        return `${hcConfig.secure ? 'https' : 'http'}://${hcConfig.server}:${hcConfig.port}/api/`;
    },

    getToken() {
        return this.getConfig().casacalida.token;
    },

    getAuthentication() {
        return {
            username: this.getConfig().zwave.username,
            password: this.getConfig().zwave.password,
        };
    },
};
