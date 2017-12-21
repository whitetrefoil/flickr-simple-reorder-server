/* tslint:disable:no-console */

import Chalk     from 'chalk'
import * as fs   from 'fs-extra'
import * as _    from 'lodash'
import * as meow from 'meow'
import * as path from 'path'

export type ILogLevel = 'error'|'warning'|'log'
export type IEnv = 'development'|'testing'|'production'

interface IFlags {
  help: boolean
  version: boolean
  port: number
  key: string
  secret: string
  callback: string
  logLevel: string
  dev: boolean
  config: string
}

export interface IConfig {
  port: number
  key: string
  secret: string
  callback: string
  logLevel: ILogLevel
  env: IEnv

  isDev(): boolean
}

const DEFAULT_PORT                     = 3000
const DEFAULT_KEY                      = '5cdc0f5ec9c28202f1098f615edba5cd'
const DEFAULT_SECRET                   = 'e3b842e3b923b0fb'
const DEFAULT_CALLBACK                 = 'http://localhost:8000/#/login'
const DEFAULT_LOG_LEVEL: ILogLevel     = 'error'
const DEFAULT_ENV: IEnv                = 'production'
const AVAILABLE_LOG_LEVEL: ILogLevel[] = ['error', 'warning', 'log']
const AVAILABLE_ENV: IEnv[]            = ['production', 'testing', 'development']

const { gray, green, yellow } = Chalk

const cli = meow<IFlags>(
  `
  Options                                                     [${gray('default value')}]
    -h, --help     Show this help message then exit
    -v, --version  Show version number
    -p, --port     Port of this server                        [${yellow('3000')}]
    -k, --key      Flickr API consumer key                    [${green('"a test key"')}]
    -s, --secret   Flickr API consumer key secret             [${green('"a test secret"')}]
                   The test key will redirect to
                   http://localhost:3000
    -b, --callback The URL Flickr login page will redirect to [${green('"a test URL"')}]
    -l, --logLevel The lowest level to log                    [${green('"error"')}]
                   Can be: "error", "warning", "log"
    -d, --dev      Set environment to "development"           [${yellow('false')}]
    -c, --config   Specify the location of config file        [${green('"config.json"')}]
                   If the file isn't existing,
                   it will create a template

  Environment variables
    NODE_ENV       The running environment                    [${green('"production"')}]
                   will override "-d" option
                   Can be: "development", "production"
    DEBUG          Print debug info                           [${green('""')}]
                   Set to "*" to show all
                   https://github.com/visionmedia/debug

  Priority
    EnvVars > Options > ConfigFile > Defaults
`,
  {
    flags: {
      help    : { alias: 'h', type: 'boolean' },
      version : { alias: 'v', type: 'boolean' },
      port    : { alias: 'p' },
      key     : { alias: 'k', type: 'string' },
      secret  : { alias: 's', type: 'string' },
      callback: { alias: 'b', type: 'string' },
      logLevel: { alias: 'l', type: 'string' },
      dev     : { alias: 'd', default: false, type: 'boolean' },
      config  : { alias: 'c', default: 'config.json', type: 'string' },
    },
  },
)

const configFileLocation = path.resolve(cli.flags.config)

let configFromFile

try {
  console.log(`Reading config file from "${configFileLocation}".`)
  configFromFile = fs.readJsonSync(configFileLocation)
} catch (e) {
  if (e.code === 'ENOENT') {
    console.log(`Config file not found. Generating example config file at "${configFileLocation}".`)
    try {
      fs.copySync(path.join(__dirname, '../../config.default.json'), configFileLocation)
      console.log('Done generating.  Please modify the config file then run again.  Exiting...')
      process.exit(1)
    } catch (e2) {
      console.error(`Cannot generate example config file at "${configFileLocation}".  Exiting...`)
      process.exit(-1)
    }
  }
}

const config: IConfig = {
  port    : _.isFinite(cli.flags.port) ? cli.flags.port : (configFromFile.port || DEFAULT_PORT),
  key     : cli.flags.key || configFromFile.key || DEFAULT_KEY,
  secret  : cli.flags.secret || configFromFile.secret || DEFAULT_SECRET,
  callback: cli.flags.callback || configFromFile.callback || DEFAULT_CALLBACK,
  logLevel: null,
  env     : null,
  isDev   : () => config.env === 'development',
}

if (_.includes(AVAILABLE_LOG_LEVEL, cli.flags.logLevel)) {
  config.logLevel = cli.flags.logLevel
} else if (_.includes(AVAILABLE_LOG_LEVEL, configFromFile.logLevel)) {
  config.logLevel = configFromFile.logLevel
} else {
  config.logLevel = DEFAULT_LOG_LEVEL
}

if (_.includes(AVAILABLE_ENV, process.env.NODE_ENV)) {
  config.env = process.env.NODE_ENV as IEnv
} else if (cli.flags.dev) {
  config.env = 'development'
} else if (_.includes(AVAILABLE_ENV, configFromFile.env)) {
  config.env = configFromFile.env
} else {
  config.env = DEFAULT_ENV
}

process.env.NODE_ENV = config.env

export default config
