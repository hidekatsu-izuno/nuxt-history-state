import path from 'path';

module.exports = function (moduleOptions) {
    this.addPlugin({
        src: path.resolve(__dirname, 'state/plugin.client.js'),
        mode: 'client'
    });
};

module.exports.meta = require('./package.json');
