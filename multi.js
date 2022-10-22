/* eslint-disable no-console */
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

const { launchBrowser } = require('./lib/multi-browser')
const { nocache } = require('./lib/browser.config')

const browserConfigFile = path.resolve('config/browser.config.json')

const multiLaunch = () => {
  const config = require(browserConfigFile)
  const launchAsync = async (browserType) => {
    launchBrowser({ multiBrowser: true, browser: browserType })
  }

  if (config.multiBrowser?.length > 1) {
    config.multiBrowser.forEach(async browserType => {
      await launchAsync(browserType)
    })
  } else {
    launchBrowser()
  }
}

multiLaunch()


// if (fs.existsSync(browserConfigFile)) {
//   // launchBrowser()
//   multiLaunch()

//   fs.watchFile(browserConfigFile, () => {
//     console.log(chalk.cyan('Configuration changed, relaunching browser'))
//     // launchBrowser()
//     multiLaunch()
//   })

//   nocache(browserConfigFile)
  
// } else {
//   console.log(chalk.yellow('Browser config not found. Aborting browser launch.'))
// }