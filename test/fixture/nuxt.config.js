const path = require('path');

module.exports = {
    mode: 'spa',
    rootDir: __dirname,
    render: {
      resourceHints: false
    },
    modules: [
        { handler: require('../../') }
    ]
}