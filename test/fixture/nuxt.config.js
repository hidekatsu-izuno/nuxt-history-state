const path = require('path')

module.exports = {
    mode: 'spa',
    dev: true,
    rootDir: path.resolve(__dirname, '../..'),
    buildDir: path.resolve(__dirname, '.nuxt'),
    srcDir: __dirname,
    render: {
        resourceHints: false
    },
    modules: [
        {
            handler: require('../..')
        }
    ]
}