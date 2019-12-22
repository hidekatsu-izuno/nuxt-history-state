import path from 'path';

module.exports = function (moduleOptions) {
    const options = {
        ...this.options.historyState,
        ...moduleOptions
    };

    this.addPlugin({
        src: path.resolve(__dirname, 'plugin.js'),
        fileName: 'history-state.js',
        mode: 'client',
        ssr: false,
        options
    });
};

module.exports.meta = require('../package.json');
