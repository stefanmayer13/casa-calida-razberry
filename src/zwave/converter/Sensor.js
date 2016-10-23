/**
 * @author <a href="mailto:stefan@stefanmayer.me">Stefan Mayer</a>
 */

const merge = require('deepmerge');

module.exports = function convert(keyPrefix, commandClass, sensorType, converter, sensorsData) {
    const sensorKeys = Object.keys(sensorType.data);
    return sensorKeys
        .filter((sensorKey) => !isNaN(parseInt(sensorKey, 10)))
        .map((sensorKey) => {
            const key = `${keyPrefix}-${sensorKey}`;
            const sensorDataArr = sensorsData.filter(sensorData => sensorData.id.indexOf(key) >= 0);
            let sensorData = {};
            if (sensorDataArr.length > 0) {
                sensorData = {
                    title: sensorDataArr[0].title,
                    icon: sensorDataArr[0].icon,
                    tags: sensorDataArr[0].tags,
                };
            }
            const sensor = sensorType.data[sensorKey];
            return merge(merge({
                key,
                commandClass,
                type: sensorType.name,
                lastUpdate: sensor.updateTime,
            }, converter(sensor)), sensorData);
        });
};
