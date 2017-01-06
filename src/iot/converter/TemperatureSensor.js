/**
 * @author <a href="mailto:stefan@stefanmayer.me">Stefan Mayer</a>
 */

module.exports = function convert(data, controller, deviceId) {
    const date = Math.floor(Date.now() / 1000);

    if (!data.temperature && data.humidity) {
        return [];
    }

    const sensors = [{
        key: `${controller}-${deviceId}-temperature`,
        commandClass: '1',
        name: 'Temperature',
        title: 'Temperature',
        value: parseFloat(data.temperature, 10),
        valueType: 'number',
        scale: '°C',
        lastUpdate: date,
        deviceType: 'sensor',
    }, {
        key: `${controller}-${deviceId}-humidity`,
        commandClass: '1',
        name: 'Humidity',
        title: 'Humidity',
        value: parseFloat(data.humidity, 10),
        valueType: 'number',
        scale: '%',
        lastUpdate: date,
        deviceType: 'sensor',
    }];

    return sensors;
};
