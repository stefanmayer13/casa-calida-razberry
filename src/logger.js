/**
 * @author <a href="mailto:stefanmayer13@gmail.com">Stefan Mayer</a>
 */

const winston = require('winston');
module.exports = new (winston.Logger)({
    exitOnError: true,
    transports: [
        new (winston.transports.Console)({ level: 'info' }),
    ],
});
