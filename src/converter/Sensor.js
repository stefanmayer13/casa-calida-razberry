/**
 * @author <a href="mailto:stefan@stefanmayer.me">Stefan Mayer</a>
 */

const merge = require('deepmerge');

module.exports = function convert(keyPrefix, commandClass, sensorType, converter) {
    const sensorKeys = Object.keys(sensorType.data);
    return sensorKeys
        .filter((sensorKey) => !isNaN(parseInt(sensorKey, 10)))
        .map((sensorKey) => {
            const sensor = sensorType.data[sensorKey];
            return merge({
                key: keyPrefix + '-' + sensorKey,
                commandClass,
                type: sensorType.name,
                lastUpdate: sensor.updateTime,
            }, converter(sensor));
        });
};
