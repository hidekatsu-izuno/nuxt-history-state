import path from 'path';

module.exports = function (moduleOptions) {
    const options = {
        ...this.options.historyState,
        ...moduleOptions
    };

    this.addPlugin({
        src: path.resolve(__dirname, 'plugin.server.js'),
        fileName: 'history-state.server.js',
        mode: 'server',
        options
    });

    this.addPlugin({
        src: path.resolve(__dirname, 'plugin.client.js'),
        fileName: 'history-state.client.js',
        mode: 'client',
        options
    });
};

module.exports.meta = require('../package.json');
