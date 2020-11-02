const TestUtils = require('./TestUtils')
const execOnce = TestUtils.execOnce
const display = TestUtils.display
const series = TestUtils.series

const webpackConfig = process.env.webpackConfig || 'test/webpack.config.sample.js'

const wds = `webpack-dev-server --config ${webpackConfig}`
const nodemon = `nodemon -q --exec 'webpack-dev-server --config ${webpackConfig}'`
const wdsr = `./index.js --config ../${webpackConfig}`

console.log('START benchmark of "wds" vs "nodemon & wds" vs "wds-restartable"'.bold)
console.log(`   For every command 5 executions:`)
console.log(`   wds = "${wds.bold}"`)
console.log(`   nodemon = "${nodemon.bold}"`)
console.log(`   wds-restartable = "${wdsr.bold}"`)

;(async () => {
    let initialTiming
    await series('warmup', () => execOnce(wds), 5)
    display('wds', initialTiming = await series('wds', () => execOnce(wds), 5))
    display('nodemon & wds', await series('nodemon & wds', () => execOnce(nodemon), 5), initialTiming)
    display('wds-restartable', await series('wds-restartable', () => execOnce(wdsr), 5), initialTiming)
})()
