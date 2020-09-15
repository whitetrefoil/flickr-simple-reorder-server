/* eslint-disable node/no-process-exit,no-process-exit */

import Chalk            from 'chalk'
import log, { error }   from 'fancy-log'
import fs               from 'fs-extra'
import meow, { Result } from 'meow'
import path             from 'path'

export type ILogLevel = 'error'|'warning'|'log'
export type IEnv = 'development'|'testing'|'production'

interface IFlags {
  help: boolean
  version: boolean
  port?: number
  key?: string
  secret?: string
  callback?: string
  logLevel?: string
  dev?: boolean
  config: string
}

type IMeowResult = Result<EmptyObject>&{ flags: IFlags }

export interface IConfig {
  port: number
  key: string
  secret: string
  callback: string
  logLevel: ILogLevel
  env: IEnv

  isDev: () => boolean
}

interface IConfigFile {
  port?: unknown
  key?: unknown
  secret?: unknown
  callback?: unknown
  logLevel?: unknown
  env?: IEnv
}

const DEFAULT_PORT = 3000
const DEFAULT_KEY = '5cdc0f5ec9c28202f1098f615edba5cd'
const DEFAULT_SECRET = 'e3b842e3b923b0fb'
const DEFAULT_CALLBACK = 'http://localhost:8000/#/login'
const DEFAULT_LOG_LEVEL: ILogLevel = 'error'
const DEFAULT_ENV: IEnv = 'production'
const AVAILABLE_LOG_LEVEL: ILogLevel[] = ['error', 'warning', 'log']
const AVAILABLE_ENV: IEnv[] = ['production', 'testing', 'development']

const { gray, green, yellow } = Chalk

const cli: IMeowResult = meow(
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
      help    : { alias: 'h', type: 'boolean', default: false },
      version : { alias: 'v', type: 'boolean', default: false },
      port    : { alias: 'p', type: 'number' },
      key     : { alias: 'k', type: 'string' },
      secret  : { alias: 's', type: 'string' },
      callback: { alias: 'b', type: 'string' },
      logLevel: { alias: 'l', type: 'string' },
      dev     : { alias: 'd', type: 'boolean', default: false },
      config  : { alias: 'c', type: 'string', default: 'config.json' },
    },
  },
)

const configFileLocation = path.resolve(cli.flags.config)

let configFromFile!: IConfigFile

try {
  log(`Reading config file from "${configFileLocation}".`)
  configFromFile = fs.readJsonSync(configFileLocation) as IConfigFile
} catch (e: unknown) {
  if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
    log(`Config file not found. Generating example config file at "${configFileLocation}".`)
    try {
      fs.copySync(path.join(__dirname, '../../config.default.json'), configFileLocation)
      log('Done generating.  Please modify the config file then run again.  Exiting...')
      process.exit(1)
    } catch (e2: unknown) {
      error(`Cannot generate example config file at "${configFileLocation}".  Exiting...`)
      process.exit(-1)
    }
  }
}

function defaultChain<T>(values: unknown[], defaultVal: T, validator?: (val: unknown) => boolean): T {
  return values.find(value => value != null && (validator == null || validator(value))) as T|undefined ?? defaultVal
}

function isAvailableEnv(env: string|nil): env is IEnv {
  return AVAILABLE_ENV.includes(env as IEnv)
}

const env = isAvailableEnv(process.env.NODE_ENV) ? process.env.NODE_ENV
  : cli.flags.dev === true ? 'development'
    : isAvailableEnv(configFromFile?.env) ? configFromFile.env
      : DEFAULT_ENV

const config: IConfig = {
  port    : defaultChain([cli.flags.port, configFromFile?.port], DEFAULT_PORT, Number.isFinite),
  key     : defaultChain([cli.flags.key, configFromFile?.key], DEFAULT_KEY),
  secret  : defaultChain([cli.flags.secret, configFromFile?.secret], DEFAULT_SECRET),
  callback: defaultChain([cli.flags.callback, configFromFile?.callback], DEFAULT_CALLBACK),
  logLevel: defaultChain(
    [cli.flags.logLevel, configFromFile?.logLevel],
    DEFAULT_LOG_LEVEL,
    val => AVAILABLE_LOG_LEVEL.includes(val as ILogLevel),
  ),
  env,
  isDev   : () => config.env === 'development',
}

process.env.NODE_ENV = config.env

export default config
