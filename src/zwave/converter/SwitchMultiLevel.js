/**
 * @author <a href="mailto:stefan@stefanmayer.me">Stefan Mayer</a>
 */

module.exports = {
    isValidKey(key) {
        return key === 'level';
    },

    convert(sensor) {
        if (sensor.value === null) {
            return null;
        }
        return {
            name: '',
            value: sensor.value,
            valueType: sensor.type,
            deviceType: 'actuator',
        };
    },
};
