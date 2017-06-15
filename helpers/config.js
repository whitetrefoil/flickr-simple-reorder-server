/* eslint no-console:off,no-process-exit:off */

/**
 * @typedef {object} IConfig
 * @property {string} key
 * @property {string} secret
 * @property {("error"|"warning"|"log")} logLevel
 * @property {("development"|"production")} env
 * @property {isDevFunc} isDev
 */

/**
 * @function isDevFunc
 * @returns {boolean}
 */

'use strict'

const chalk = require('chalk')
const fs    = require('fs-extra')
const _     = require('lodash')
const meow  = require('meow')
const path  = require('path')

const DEFAULT_KEY         = '5cdc0f5ec9c28202f1098f615edba5cd'
const DEFAULT_SECRET      = 'e3b842e3b923b0fb'
const DEFAULT_LOG_LEVEL   = 'error'
const DEFAULT_ENV         = 'production'
const AVAILABLE_LOG_LEVEL = ['error', 'warning', 'log']
const AVAILABLE_ENV       = ['production', 'development']

const cli = meow(`
  Options                                               [${chalk.gray('default value')}]
    -k, --key      Flickr API consumer key              [${chalk.green('"a test key"')}]
    -s, --secret   Flickr API consumer key secret       [${chalk.green('"a test secret"')}]
                   The test key will redirect to
                   http://localhost:3000
    -l, --logLevel The lowest level to log              [${chalk.green('"error"')}]
                   Can be: "error", "warning", "log"
    -d, --dev      Set environment to "development"     [${chalk.yellow('false')}]
    -c, --config   Specify the location of config file  [${chalk.green('"config.json"')}]
                   If the file isn't existing,
                   it will create a template
    
  Environment variables
    NODE_ENV       The running environment              [${chalk.green('"production"')}]
                   will override "-d" option
                   Can be: "development", "production"
    DEBUG          Print debug info                     [${chalk.green('""')}]
                   Set to "*" to show all
                   https://github.com/visionmedia/debug
                   
  Priority
    EnvVars > Options > ConfigFile > Defaults
`, {
  alias  : {
    k: 'key',
    s: 'secret',
    l: 'logLevel',
    d: 'dev',
    c: 'config',
  },
  string : ['key', 'secret', 'logLevel', 'config'],
  boolean: ['dev'],
  default: {
    d: false,
    c: 'config.json',
  },
})

const configFileLocation = path.resolve(cli.flags.config)

let configFromFile

try {
  console.log(`Reading config file from "${configFileLocation}".`)
  configFromFile = fs.readJsonSync(configFileLocation)
} catch (e) {
  if (e.code === 'ENOENT') {
    console.log(`Config file not found. Generating example config file at "${configFileLocation}".`)
    try {
      fs.copySync(path.join(__dirname, '../config.default.json'), configFileLocation)
      console.log('Done generating.  Please modify the config file then run again.  Exiting...')
      process.exit(1)
    } catch (e2) {
      console.error(`Cannot generate example config file at "${configFileLocation}".  Exiting...`)
      process.exit(-1)
    }
  }
}

/**
 * @type {IConfig}
 */
const config = {
  key   : cli.flags.key || configFromFile.key || DEFAULT_KEY,
  secret: cli.flags.secret || configFromFile.secret || DEFAULT_SECRET,
  isDev : () => config.env === 'development',
}

if (_.includes(AVAILABLE_LOG_LEVEL, cli.flags.logLevel)) {
  config.logLevel = cli.flags.logLevel
} else if (_.includes(AVAILABLE_LOG_LEVEL, configFromFile.logLevel)) {
  config.logLevel = configFromFile.logLevel
} else {
  config.logLevel = DEFAULT_LOG_LEVEL
}

if (_.includes(AVAILABLE_ENV, process.env.NODE_ENV)) {
  config.env = process.env.NODE_ENV
} else if (_.includes(AVAILABLE_ENV, cli.flags.env)) {
  config.env = cli.flags.env
} else if (_.includes(AVAILABLE_ENV, configFromFile.logLevel)) {
  config.env = configFromFile.env
} else {
  config.env = DEFAULT_ENV
}


module.exports = config
