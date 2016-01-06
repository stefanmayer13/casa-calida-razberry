/**
 * @author <a href="mailto:stefan@stefanmayer.me">Stefan Mayer</a>
 */

module.exports = function convert(sensor) {
    return {
        name: sensor.typeString.value,
        value: sensor.sensorState.value,
        valueType: 'number',
    };
};
