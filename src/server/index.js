/**
 * @author <a href="mailto:stefan@stefanmayer.me">Stefan Mayer</a>
 */
const Hapi = require('hapi');
const logger = require('../logger');
const casaCalida = require('../CasaCalida');
const knowIds = [];

const waterControlConverter = require('../iot/converter/WaterControl');
const temperatureSensorConverter = require('../iot/converter/TemperatureSensor');

const iotMapping = {
    'casa-calida-temperature-battery': temperatureSensorConverter,
};

module.exports = function server(websocket) {
    const server = new Hapi.Server();
    server.connection({
        host: '0.0.0.0',
        port: 8001
    });

    server.route({
        method: 'GET',
        path:'/',
        handler: (request, reply) => {
            console.log(new Date());
            console.log(request.query);
            const data = request.query;
            if (knowIds.indexOf(data.id) !== -1) {
                const update = [{
                    name: 'iot',
                    sensors: iotMapping[data.type](data, 'iot', data.id).map(sensor => ({
                        deviceId: data.id,
                        sensor
                    })),
                }];
                casaCalida.incrementalUpdate(websocket, update);
            } else {
                const update = [{
                    name: 'iot',
                    devices: [{
                        deviceId: data.id,
                        name: data.name,
                        deviceType: data.type,
                        isAwake: true,
                        vendor: 'Casa-Calida',
                        brandName: 'Casa-Calida',
                        productName: data.name,
                        protocol: 'iot',
                        sensors: iotMapping[data.type](data, 'iot', data.id),
                    }]
                }];
                casaCalida.fullUpdate(websocket, update);
                knowIds.push(data.id);
            }
            return reply();
        },
    });

    return new Promise((resolve, reject) => {
        server.start((err) => {
            if (err) {
                logger.err(err);
                reject(err);
            }
            logger.info(`Server running at: ${server.info.uri}`);
        });
    });
};
