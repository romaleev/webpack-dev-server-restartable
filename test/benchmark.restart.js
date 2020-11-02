const TestUtils = require('./TestUtils')
const changeFile = TestUtils.changeFile
const ExecWait = TestUtils.ExecWait
const display = TestUtils.display
const seriesAwait = TestUtils.seriesAwait

const webpackConfig = process.env.webpackConfig || 'test/webpack.config.sample.js'
const serverConfig = process.env.serverConfig || 'test/server.sample.js'

const nodemon = `nodemon -q --watch ${webpackConfig} --watch ${serverConfig} --exec 'webpack-dev-server --config ${webpackConfig}'`
const wdsr = `./index.js --watch ${webpackConfig} --watch ${serverConfig} --config ../${webpackConfig}`

console.log('RESTART benchmark of "nodemon" vs "wds-restartable"'.bold)
console.log(`   For every command single execution and 5 file changes + restarts:`)
console.log(`   nodemon = "${nodemon.bold}"`)
console.log(`   wds-restartable = "${wdsr.bold}"`)

;(async () => {
    let initialTiming

    const nodemonChild = new ExecWait(nodemon)
    await nodemonChild.exec()
    await nodemonChild.wait()

    await seriesAwait('warmup nodemon & wds', () => changeFile(serverConfig), 5, () => nodemonChild.wait())
    display('nodemon & wds', initialTiming = await seriesAwait('nodemon & wds', () => changeFile(serverConfig), 5, () => nodemonChild.wait()))
    nodemonChild.stop()

    const wdsrChild = new ExecWait(wdsr)
    await wdsrChild.exec()
    await wdsrChild.wait()
    await seriesAwait('warmup wds-restartable', () => changeFile(serverConfig), 5, () => wdsrChild.wait())
    display('wds-restartable', await seriesAwait('wds-restartable', () => changeFile(serverConfig), 5, () => wdsrChild.wait()), initialTiming)
    wdsrChild.stop()

})()
