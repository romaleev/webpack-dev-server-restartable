# webpack-dev-server-restartable

Restartable [webpack-dev-server](https://www.npmjs.com/package/webpack-dev-server)

Adds to `webpack-dev-server` ability to automatically restart when webpack config or server file changes. 

Restarts x10 times faster than command line alternative `nodemon + webpack-dev-server`

Powered by Node.js require cache clean.

Requires peer dependencies of `webpack` and `webpack-dev-server` 

`webpack-dev-server` options should be in `devServer` field of webpack config.

### Command line examples
```
webpack-dev-server-restartable --watch test/server.sample.js --watch test/webpack.config.sample.js --config test/webpack.config.sample.js
```

Which is alternative to:
```
nodemon --watch test/webpack.config.sample.js --watch test/server.sample.js --exec 'webpack-dev-server --config test/webpack.config.sample.js'
```

### Options

Name | Type | Default | Description 
--- | --- | --- | ---
**`config`** | `{String}` |  | Webpack config which includes `devServer` options and passed to `webpack-dev-server`
**`watch`** | `{String}` |  | Path which if is monitored for changes - restarts `webpack-dev-server` 
**`stop`** | `{String}` |  | Path which if is monitored for changes - stops `webpack-dev-server`
**`verbose`** | `{Boolean}` | true | Enables verbose logging for `webpack-dev-server-restartable`, like [wds] and [wds + wdm] timings
**`silent`** | `{Boolean}` | false | Supress all logs from `webpack-dev-server-restartable`, including restarting notifications
**`fastboot`** | `{Boolean}` | true | Enables [fast-boot](https://www.npmjs.com/package/fast-boot) `_resolveFilename` cache

### Consistency

Because `webpack-dev-sever` restarts without full process reload there might be plugins that need invalidation.

In order to achieve this you can add optional function `devServer.onExit`

`browser-sync-webpack-plugin` is invalidated by default.

```
const config = {
    // ...
    devServer: {
        // ...
        onExit: () => { /* invalidate, like browserSync.cleanup() */  }
    }
    // ...
} 
``` 

### Node.js example

```
    const server = new WebpackDevServerRestartable({ config, watch, stop, verbose, silent, fastboot })
    server.listen()
```

### Benchmark

You can run start and restart speed benchmarks locally:

```
   npm run test
```

### Benchmark Options

Name | Type | Default | Description 
--- | --- | --- | ---
**`webpackConfig`** | `{String}` |  | Webpack config which includes `devServer` options and passed to `webpack-dev-server`
**`serverConfig`** | `{String}` |  | Server config which is required in `devServer.after` option
**`verbose`** | `{Boolean}` | false | Enables verbose logging

Example

```
   verbose=true webpackConfig=test/webpack.config.sample.js serverConfig=test/server.sample.js npm run test
```

All `NODE_ENV` variables also applies to `webpack-dev-server` itself.