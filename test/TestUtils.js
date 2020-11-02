const fs = require('fs')
const util = require('util')
const path = require('path')
const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)
const EventEmitter = require('events')
const spawn = require('child_process').spawn
const Time = require('../lib/Utils').Time

class ExecWait {
    constructor (cmd) {
        this.compileEmitter = new EventEmitter()
        this.cmd = cmd
    }
    async exec() {
        this.stop()
        this.child = await exec(this.cmd, this.compileEmitter)
    }
    wait () {
        return new Promise((resolve) => this.compileEmitter.once('compiled', (timing) => resolve(timing)))
    }
    stop () {
        this.child && this.child.kill()
    }
}

const changeFile = async (file) => {
    const _path = path.join(process.cwd(), file)
    let data = await readFile(_path, 'utf8')
    // console.log(0, data)
    data = (data.slice(-1) === ';') ? data.slice(0, -1) : data.concat(';')
    // console.log(0, data)
    await writeFile(_path, data)
}

const exec = (cmd, cb_ev) => {
    const _cmd = cmd.match(/(?:[^\s']+|'[^']*')+/g).map(item => item.replace(/\'/g, ''))
    const child = spawn(_cmd[0], _cmd.slice(1), {
        cwd: process.cwd(),
    })
    child.stderr.on('data', (data) => console.log('err', data.toString()))
    child.stdout.on('data', (data) => {
        process.env.verbose && console.log(data.toString())
        if(data.toString().includes('Compiled')) {
            if(cb_ev instanceof EventEmitter) {
                cb_ev.emit('compiled')
            } else if(typeof cb_ev === 'function') {
                cb_ev()
            }
        }
    })
    return child
}

const execOnce = (cmd) => new Promise((resolve) => {
    Time.to('start')
    const child = exec(cmd, () => {
        child.kill()
        resolve(Time.from('start', 'ms'))
    })
})

const series = async (name, action, count) => {
    const timings = []
    for (let i = 0; i < count; i++) {
        const timing = await action()
        timings.push(timing)
        process.stdout.write(`${name.bold} ${i+1}/${count} ${timing.toString().yellow}\r`)
    }
    process.stdout.write('                                 \r')
    return timings
}

const seriesAwait = async (name, action, count, awaitCompile) => {
    const timings = []
    for (let i = 0; i < count; i++) {
        await action()
        Time.to('start')
        await awaitCompile()
        const timing = Time.from('start', 'ms')
        timings.push(timing)
        process.stdout.write(`${name.bold} ${i+1}/${count} ${timing.toString().yellow}\r`)
    }
    process.stdout.write('                                 \r')
    return timings
}

const average = arr => Math.round(arr.reduce( ( p, c ) => p + c, 0 ) / arr.length)
const display = (name, runs, prev) => {
    const avg = average(runs)
    if(prev) {
        const diff = Math.round(avg / average(prev) * 100) - 100
        console.log(name.bold, avg.toString().yellow.bold, runs, `${diff > 0 ? '+' : ''}${diff}%`.red.bold)
    } else console.log(name.bold, avg.toString().yellow.bold, runs)
}

module.exports = {
    changeFile,
    exec,
    execOnce,
    ExecWait,
    display,
    series,
    seriesAwait
}
