#!/usr/bin/env node

'use strict'

process.title = 'node webpack-dev-server-restartable'

const minimist = require('minimist')
const Utils = require('./lib/Utils')
const WebpackDevServerRestartable = require('./lib/Server')

const { config, watch, stop, verbose, silent, fastboot } = minimist(process.argv)

const server = new WebpackDevServerRestartable({ config, watch, stop, verbose, silent, fastboot })

server.listen()

Utils.onExit(() => {
    server.close(() => process.exit(0))
})