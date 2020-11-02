const path = require('path')
const fs = require('fs')

const node_modules = path.join(__dirname, '../node_modules')

// Mock for big webpack config
fs.readdirSync(node_modules).forEach(function(file) {
    const index = path.join(node_modules, file, 'index.js')
    if(fs.existsSync(index)) require(index)
})

module.exports = {
    mode: 'development',
    target: 'node',
    entry: './node_modules/yargs/yargs.js',
    output: {
        publicPath: '/',
        path: path.resolve(__dirname, 'dist'),
        filename: 'yargs.bundle.js'
    },
    devServer: {
        publicPath: '/',
        compress: true,
        port: 9000,
        stats: 'none',
        after: (app) => {
            app.get('/url', require('./server.sample'))
            //app.use(require('./server.sample'))
        }
    }
}