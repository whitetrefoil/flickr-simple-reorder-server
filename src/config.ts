/* eslint-disable no-process-exit */

import Chalk from 'chalk'
import fs from 'fs-extra'
import meow from 'meow'
import path from 'path'
import { isErrnoException } from './utils/is-errno-exception.js'

export type ILogLevel = 'error'|'warning'|'log'
export type IEnv = 'development'|'testing'|'production'


export interface IConfig {
  port: number
  key: string
  secret: string
  callback: string
  env: IEnv
  logLevel: ILogLevel

  isDev: () => boolean
}

interface ConfigFile {
  port: number
  key: string
  secret: string
  callback: string
  env: IEnv
  logLevel: ILogLevel
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

const cli = meow(
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
    importMeta: import.meta,
    flags     : {
      help    : { alias: 'h', type: 'boolean' },
      version : { alias: 'v', type: 'boolean' },
      port    : { alias: 'p', type: 'number' },
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

async function generateConfigFile() {
  console.log(`Config file not found. Generating example config file at "${configFileLocation}".`)
  const defaultConfig = JSON.stringify({
    key     : DEFAULT_KEY,
    secret  : DEFAULT_SECRET,
    callback: DEFAULT_CALLBACK,
    env     : DEFAULT_ENV,
    logLevel: DEFAULT_LOG_LEVEL,
  }, null, 2)
  try {
    await fs.writeFile(configFileLocation, defaultConfig)
    console.log('Done generating.  Please modify the config file then run again.  Exiting...')
    process.exit(1)
  } catch (e2: unknown) {
    if (!isErrnoException(e2)) {
      throw e2
    }
    console.error(`Cannot generate example config file at "${configFileLocation}".  Exiting...`)
    process.exit(-1)
  }
}

async function readConfigFile(): Promise<ConfigFile> {
  console.log(`Reading config file from "${configFileLocation}".`)
  let configFromFile: unknown
  try {
    configFromFile = await fs.readJson(configFileLocation) as unknown
  } catch (e: unknown) {
    if (!isErrnoException(e)) {
      throw e
    }
    await generateConfigFile()
  }
  if (typeof configFromFile !== 'object') {
    return {
      port    : DEFAULT_PORT,
      key     : DEFAULT_KEY,
      secret  : DEFAULT_SECRET,
      callback: DEFAULT_CALLBACK,
      env     : DEFAULT_ENV,
      logLevel: DEFAULT_LOG_LEVEL,
    }
  }

  const { port, key, secret, callback, env, logLevel } = configFromFile as Partial<ConfigFile>

  return {
    port    : port != null && Number.isFinite(port) ? port : DEFAULT_PORT,
    key     : typeof key === 'string' ? key : DEFAULT_KEY,
    secret  : typeof secret === 'string' ? secret : DEFAULT_SECRET,
    callback: typeof callback === 'string' ? callback : DEFAULT_CALLBACK,
    env     : typeof env === 'string' && AVAILABLE_ENV.includes(env as IEnv) ? env : DEFAULT_ENV,
    logLevel: typeof logLevel === 'string' && AVAILABLE_LOG_LEVEL.includes(logLevel as ILogLevel)
      ? logLevel : DEFAULT_LOG_LEVEL,
  }
}


const configFile = await readConfigFile()

const config: IConfig = {
  port     : configFile.port ?? DEFAULT_PORT,
  key      : configFile.key ?? DEFAULT_KEY,
  secret   : configFile.secret ?? DEFAULT_SECRET,
  callback : configFile.callback ?? DEFAULT_CALLBACK,
  env      : configFile.env ?? DEFAULT_ENV,
  logLevel : configFile.logLevel ?? DEFAULT_LOG_LEVEL,
  isDev   : () => config.env === 'development',
}


process.env.NODE_ENV = config.env


export default config
