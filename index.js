const fs = require('fs')
const path = require('path')
const { launchBrowser } = require('./lib/multi-browser')

const browserConfigFile = path.resolve('config/browser.config.json')

const multiLaunch = () => {
  if (!fs.existsSync(browserConfigFile)) {
    console.error(`Configuration file does not exist. Please run 'yarn run configure' to create one.`)
    return
  }
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