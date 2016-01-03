/**
 * @author <a href="mailto:stefanmayer13@gmail.com">Stefan Mayer</a>
 */

const merge = require('deepmerge');

module.exports = function convert(commandClass, sensorType, converter) {
    const sensorKeys = Object.keys(sensorType.data);
    return sensorKeys
        .filter((sensorKey) => {
            return !isNaN(parseInt(sensorKey, 10));
        })
        .map((sensorKey) => {
            const sensor = sensorType.data[sensorKey];
            return merge({
                key: sensorKey,
                commandClass,
                type: sensorType.name,
                lastUpdate: sensor.updateTime,
            }, converter(sensor));
        });
};
