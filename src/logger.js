/**
 * @author <a href="mailto:stefan@stefanmayer.me">Stefan Mayer</a>
 */

const winston = require('winston');
module.exports = new (winston.Logger)({
    exitOnError: true,
    transports: [
        new (winston.transports.Console)({ level: 'info' }),
    ],
});
