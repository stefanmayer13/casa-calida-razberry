#!/usr/bin/env node
/**
 * @author <a href="mailto:stefan@stefanmayer.me">Stefan Mayer</a>
 */

const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const config = require('./config');
const CasaCalida = require('./CasaCalida');
const zwave = require('./zwave');
const iot = require('./iot');
const processArguments = require('./utils/processArguments');

const configPath = processArguments.get('config');

if (!configPath) {
    logger.error('Please provide "config" as arguments to point to your config file. See README for more infos.');
    process.exit(1);
}

const absoluteConfigPath = path.resolve(configPath);
try {
    const stats = fs.lstatSync(absoluteConfigPath);

    if (stats.isDirectory()) {
        throw new Error('config is a directory');
    }
} catch (e) {
    logger.error(`Couldn't find provided config file ${absoluteConfigPath}`);
    process.exit(2);
}

config.setPath(absoluteConfigPath);
const auth = config.getAuthentication();

CasaCalida.connect().then((websocket) =>
    Promise.all([
        zwave.init(auth.username, auth.password, websocket),
        iot(config.getIotIps(), websocket)
    ])
).catch((e) => {
    logger.error(e);
    process.exit(3);
});
