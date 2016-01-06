/**
 * @author <a href="mailto:stefan@stefanmayer.me">Stefan Mayer</a>
 */
const request = require('superagent'); // eslint-disable-line prefer-const
const Promise = require('bluebird');

function doRequest(method, url, data, headers) {
    return new Promise((resolve, reject) => {
        const req = request[method](url);

        if (headers) {
            const headerKeys = Object.keys(headers);
            headerKeys.forEach((key) => {
                req.set(key, headers[key]);
            });
        }

        if (data) {
            req.send(data);
        }

        req.end((err, requestedData) => {
            if (err) {
                let error;
                if (err.response) {
                    error = (new Error(`${err.response.error.method} ${err.response.error.path} ` +
                        `${err.response.error.text}`));
                } else {
                    error = err;
                }
                return reject(error);
            }
            return resolve(requestedData);
        });
    });
}

module.exports = {
    get: function get(url, headers) {
        return doRequest('get', url, null, headers);
    },

    post: function post(url, data, headers) {
        return doRequest('post', url, data, headers);
    },
};
