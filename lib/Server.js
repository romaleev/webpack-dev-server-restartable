const Utils = require('./Utils')

Utils.requireResolve('webpack')
Utils.requireResolve('webpack-dev-server')

const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const chokidar = require('chokidar')


class WebpackDevServerRestartable {

    constructor({
                    config = '',
                    watch = '',
                    stop = '',
                    verbose = true,
                    silent = false,
                    fastboot = true
                } = {}, cb) {
        this.opt = {
            config,
            verbose: verbose === true || verbose === 'true',
            silent: silent === true || silent === 'true',
            fastboot: fastboot === true || fastboot === 'true',
            watch: Array.isArray(watch) ? watch : [watch],
            stop: Array.isArray(stop) ? stop : [stop],
            onExit: cb
        }

        if (this.opt.silent) this.opt.verbose = false

        if (!config) {
            console.error(`webpack-dev-sever-restartable config option is required`)
            process.exitCode = 1
        }

        Utils.babelSupport(this.opt.config)
        this.opt.verbose && Utils.Time.to('start')
        this.opt.fastboot && Utils.fastBoot('./node_modules/.cache/module-locations-cache.json')

        this.config = this.loadConfig(this.opt.config)
    }

    loadConfig(_path) {
        const _config = require(_path)
        return _config.default || _config
    }

    start(cb) {
        const compiler = webpack(this.config)
        compiler.hooks.done.tap('WebpackDevServerRestartable', (stats) => {
            this.opt.verbose && console.log(`${':'.blue} ${'[wds + wdm]'.grey}: Time: ${Utils.Time.from('start')}`)
            setTimeout(() => cb && cb())
        })
        this.server = new WebpackDevServer(compiler, this.config.devServer)
        this.server.listen(this.config.devServer.port, 'localhost', () => {
            this.opt.verbose && console.log(`${':'.blue} ${'[wds]'.grey}: Time: ${Utils.Time.from('start')}`)
        })
    }

    restart(file) {
        if(this.progress) {
            this.restartAfter = true
            return
        }
        this.progress = true
        !this.opt.silent && console.log('\n', 'Restarting dev server...'.white.bold, file.green, '\n')
        this.opt.verbose && Utils.Time.to('start')
        this.closeInternal(() => {
            Utils.cleanCache()
            this.config = this.loadConfig(this.opt.config)
            this.start(() => {
                this.progress = false
                if(this.restartAfter) {
                    this.restartAfter = false
                    this.restart(file)
                }
            })
        })
    }

    watch() {
        return chokidar
            .watch([...this.opt.watch, ...this.opt.stop])
            .on('all', (event, changedFile) => {
                if (['change', 'unlink', 'unlinkDir'].indexOf(event) === -1) return

                if (this.opt.stop.includes(changedFile)) {
                    !this.opt.silent && console.log('\n', 'Restart me'.red, changedFile.green, '\n')
                    process.exit(0)
                } else if (this.opt.watch.includes(changedFile)) {
                    this.restart(changedFile)
                }
            })
    }

    closeInternal(_cb) {
        const waitFor = []
        this.opt.onExit && waitFor.push(Utils.promisify(this.opt.onExit))
        waitFor.push(Utils.promisify((cb) => Utils.stopBrowserSync(this.config, cb)))
        this.server && waitFor.push(Utils.promisify((cb) => this.server.close(cb)))
        if(waitFor.length === 0) return _cb()
        Promise.all(waitFor).then(_cb)
    }

    close(cb) {
        this.opt.onExit && this.opt.onExit()
        Utils.stopBrowserSync(this.config)
        this.watcher && this.watcher.close()
        this.server && this.server.close(cb)
    }

    listen(cb) {
        this.watcher = this.watch()
        this.start(cb)
    }
}

module.exports = WebpackDevServerRestartable