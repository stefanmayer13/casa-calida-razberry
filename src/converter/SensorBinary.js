/**
 * @author <a href="mailto:stefanmayer13@gmail.com">Stefan Mayer</a>
 */

module.exports = function convert(sensor) {
    return {
        name: sensor.sensorTypeString.value,
        value: sensor.level.value,
        valueType: 'bool',
    };
};
