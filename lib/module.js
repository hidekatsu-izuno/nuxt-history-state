import path from 'path';

module.exports = function (moduleOptions) {
    const options = {
        ...this.options.historyState,
        ...moduleOptions
    };

    if (this.options.router && this.options.router.scrollBehavior) {
        options.overrideDefaultScrollBehavior = false;
    } else if (options.overrideDefaultScrollBehavior == null) {
        options.overrideDefaultScrollBehavior = true;
    }

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
