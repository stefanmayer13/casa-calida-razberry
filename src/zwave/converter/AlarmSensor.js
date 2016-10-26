/**
 * @author <a href="mailto:stefan@stefanmayer.me">Stefan Mayer</a>
 */

module.exports = {
    isValidKey(key) {
        return !isNaN(parseInt(key, 10));
    },

    convert(sensor) {
        return {
            name: sensor.typeString.value,
            value: sensor.sensorState.value,
            valueType: sensor.sensorState.type,
            deviceType: 'sensor',
        };
    },
};
