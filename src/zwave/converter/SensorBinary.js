/**
 * @author <a href="mailto:stefan@stefanmayer.me">Stefan Mayer</a>
 */

module.exports = function convert(sensor) {
    return {
        name: sensor.sensorTypeString.value,
        value: sensor.level.value,
        valueType: 'bool',
    };
};
