/**
 * @author <a href="mailto:stefanmayer13@gmail.com">Stefan Mayer</a>
 */

const cliArguments = process.argv.reduce((argObject, arg) => {
    const argument = arg.split('=');
    if (argument.length === 2) {
        argObject[argument[0]] = argument[1];
    }
    return argObject;
}, {});

module.exports = {
    get: function getArgument(argument) {
        return cliArguments[argument];
    },
};
