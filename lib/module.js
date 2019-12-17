import path from 'path';

module.exports = function (moduleOptions) {
    this.addPlugin({
        src: path.resolve(__dirname, 'history-state-plugin.js'),
        mode: 'client'
    });
};

module.exports.meta = require('../package.json');
