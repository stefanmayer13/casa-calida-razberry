/**
 * @author <a href="mailto:stefanmayer13@gmail.com">Stefan Mayer</a>
 */

module.exports = function convert(sensor) {
    return {
        name: sensor.typeString.value,
        value: sensor.sensorState.value,
        valueType: 'number',
    };
};
