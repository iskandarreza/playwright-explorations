/* eslint-disable no-console */
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

const { launchBrowser } = require('./lib/browser')
const { nocache } = require('./lib/browser.config')

const browserConfigFile = path.resolve('config/browser.config.json')

if (fs.existsSync(browserConfigFile)) {
  launchBrowser()

  fs.watchFile(browserConfigFile, () => {
    console.log(chalk.cyan('Configuration changed, relaunching browser'))
    launchBrowser()
  })

  nocache(browserConfigFile)
  
} else {
  console.log(chalk.yellow('Browser config not found. Aborting browser launch.'))
}