/**
 * @author <a href="mailto:stefan@stefanmayer.me">Stefan Mayer</a>
 */
const moment = require('moment');

module.exports = function convert(data, controller, deviceId) {
    const date = Math.floor(Date.now() / 1000);

    const sensors = [{
        key: `${controller}-${deviceId}-water-status`,
        commandClass: '1',
        name: 'Water Valve Status',
        title: 'Water Valve Status',
        value: data.active ? 'True' : 'False',
        valueType: 'bool',
        lastUpdate: date,
        deviceType: 'actuator',
    }, {
        key: `${controller}-${deviceId}-outside-temperature`,
        commandClass: '1',
        name: 'Outside Temperature',
        title: 'Outside Temperature',
        value: data.temperature,
        valueType: 'number',
        scale: '°C',
        lastUpdate: date,
        deviceType: 'sensor',
    }/*, {
        key: `${controller}-${deviceId}-water-schedule`,
        commandClass: '2',
        name: 'Sprinkler Schedule',
        title: 'Sprinkler Schedule',
        value: data.dailyTime,
        valueType: 'time',
        lastUpdate: date,
        deviceType: 'actuator',
    }, {
        key: `${controller}-${deviceId}-schedule-active`,
        commandClass: '1',
        name: 'Sprinkler Schedule Active',
        title: 'Sprinkler Schedule Active',
        value: data.scheduleActive ? 'True': 'False',
        valueType: 'bool',
        lastUpdate: date,
        deviceType: 'actuator',
    }, {
        key: `${controller}-${deviceId}-schedule-skip`,
        commandClass: '1',
        name: 'Sprinkler Schedule Skip',
        title: 'Sprinkler Schedule Skip',
        value: data.scheduleSkip ? 'True': 'False',
        valueType: 'bool',
        lastUpdate: date,
        deviceType: 'actuator',
    }*/];

    const lastRun = moment(data.lastRun, 'HH:mm:ss');
    if (lastRun.isValid()) {
        sensors.push({
            key: `${controller}-${deviceId}-water-last`,
            commandClass: '0',
            name: 'Water Valve Last Open',
            title: 'Water Valve Last Open',
            value: lastRun.unix(),
            valueType: 'datetime',
            lastUpdate: date,
            deviceType: 'sensor',
        });
    }

    return sensors;
};
