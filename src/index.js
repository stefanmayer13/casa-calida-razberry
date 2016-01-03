/**
 * @author <a href="mailto:stefanmayer13@gmail.com">Stefan Mayer</a>
 */

const logger = require('./logger');

const zwave = require('./zwave');
const processArguments = require('./utils/processArguments');

const username = processArguments.get('username');
const password = processArguments.get('password');

if (!username || !password) {
    logger.error('Please provide "username" and "password" as arguments');
}

zwave(username, password)
    .catch((e) => {
        logger.error(e);
        process.exit(1);
    });
