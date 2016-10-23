/**
 * @author <a href="mailto:stefan@stefanmayer.me">Stefan Mayer</a>
 */

module.exports = function convert(sensor) {
    return {
        name: sensor.sensorTypeString.value,
        value: sensor.val.value,
        scale: sensor.scaleString.value,
        valueType: 'number',
    };
};
