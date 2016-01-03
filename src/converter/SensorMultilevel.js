/**
 * @author <a href="mailto:stefanmayer13@gmail.com">Stefan Mayer</a>
 */

module.exports = function convert(sensor) {
    return {
        name: sensor.sensorTypeString.value,
        value: sensor.val.value,
        scale: sensor.scaleString.value,
        valueType: 'number',
    };
};
