/**
 * @author <a href="mailto:stefan@stefanmayer.me">Stefan Mayer</a>
 */

const merge = require('deepmerge');

module.exports = function convert(keyPrefix, commandClass, sensorType, converter, sensorsData, deviceKey) {
    const sensorKeys = Object.keys(sensorType.data);
    return sensorKeys
        .filter(converter.isValidKey)
        .map((sensorKey) => {
            const key = `${keyPrefix}-${sensorKey}`;
            let sensorDataKey = keyPrefix;
            if (!isNaN(parseInt(sensorKey, 10))) {
                sensorDataKey = key;
            }
            const sensorDataArr = sensorsData.filter(sensorData => sensorData.id.indexOf(sensorDataKey) >= 0);
            let sensorData = {};
            if (sensorDataArr.length > 0) {
                sensorData = {
                    title: sensorDataArr[0].title,
                    icon: sensorDataArr[0].icon,
                    tags: sensorDataArr[0].tags,
                };
            }
            const sensor = sensorType.data[sensorKey];
            const convertedSensor = converter.convert(sensor);
            if (!convertedSensor) {
                return null;
            }
            return merge(merge({
                key: sensorDataKey,
                commandClass,
                type: sensorType.name,
                lastUpdate: sensor.updateTime,
            }, convertedSensor), sensorData);
        }).filter(sensor => !!sensor);
};
