/**
 * @author <a href="mailto:stefan@stefanmayer.me">Stefan Mayer</a>
 */

module.exports = function convert(data, controller, deviceId) {
    const date = Math.floor(Date.now() / 1000);

    const sensors = [{
        key: controller + '-' + deviceId + '-temperature',
        commandClass: '1',
        name: 'Temperature',
        title: 'Temperature',
        value: data.temperature,
        valueType: 'number',
        scale: '°C',
        lastUpdate: date,
        type: 'sensor',
    }, {
        key: controller + '-' + deviceId + '-humidity',
        commandClass: '1',
        name: 'Humidity',
        title: 'Humidity',
        value: data.humidity,
        valueType: 'number',
        scale: '%',
        lastUpdate: date,
        type: 'sensor',
    }];

    return sensors;
};
