require('colors')
const path = require('path')

const TimeData = {}
const Time = {
    ms: (hrtime) => hrtime[0]*1000 + Math.round(hrtime[1]/1000000),
    to: (tag) => {
        TimeData[tag] = process.hrtime() // Date.now()
        TimeData[tag+ '1'] = Date.now()
    },
    from: (tag, format = '') => {
        if(!TimeData[tag]) return `no tag '${tag}' found`
        if(format === 'ms') return Time.ms(process.hrtime(TimeData[tag]))
        return `${(Time.ms(process.hrtime(TimeData[tag]))/*Date.now() - TimeData[tag]*/).toString().bold.white}ms`
    }
}

const babelSupport = (CONFIG_PATH) => {
    if(process.argv0 === 'node' && CONFIG_PATH.includes('babel')) {
        requireResolve('@babel/core')
        requireResolve('@babel/register')
        require('@babel/register')
    }
}

const cleanCache = () => {
    Object.keys(require.cache).forEach(id =>
        !id.includes('node_modules') &&
        Reflect.deleteProperty(require.cache, id))
}

const fastBoot = (_path) => require('fast-boot').start({
    cacheFile: path.join(process.cwd(), _path),
})

const requireResolve = (_package) => {
    try {
        require.resolve(_package)
    } catch (err) {
        console.error(`Please install '${_package}'`)
        console.error(`-> When using npm: npm i -D ${_package}`)
        console.error(`-> When using yarn: yarn add -D ${_package}`)
        process.exitCode = 1
    }
}

const stopBrowserSync = (config, cb) => {
    const browserSyncPlugin = config.plugins && config.plugins.find((plugin) => plugin.constructor.name === 'BrowserSyncPlugin')
    if(browserSyncPlugin && browserSyncPlugin.browserSync) {
        browserSyncPlugin.browserSync.cleanup(() => cb && cb())
    } else cb && cb()
}

const promisify = (fn) => new Promise((resolve) => fn(() => resolve()))

const onExit = (cb) => {
    ;[
        'SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM',
    ].forEach(sig =>
        process.on(sig, () => typeof sig === 'string' && cb()),
    )
}

module.exports = {
    babelSupport,
    cleanCache,
    fastBoot,
    requireResolve,
    stopBrowserSync,
    onExit,
    promisify,
    Time
}