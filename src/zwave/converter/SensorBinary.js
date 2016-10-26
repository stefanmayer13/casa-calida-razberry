/**
 * @author <a href="mailto:stefan@stefanmayer.me">Stefan Mayer</a>
 */

module.exports = {
    isValidKey(key) {
        return !isNaN(parseInt(key, 10));
    },

    convert(sensor) {
        return {
            name: sensor.sensorTypeString.value,
            value: sensor.level.value,
            valueType: sensor.level.type,
            deviceType: 'sensor',
        };
    },
};
