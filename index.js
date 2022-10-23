const fs = require('fs')
const path = require('path')
const { launchBrowser } = require('./lib/launch-browser')

const browserConfigFile = path.resolve('config/browser.config.json')

const init = () => {
  if (!fs.existsSync(browserConfigFile)) {
    console.error(`Configuration file does not exist. Please run 'yarn run configure' to create one.`)
    return
  }

  try {
    const config = require(browserConfigFile)
    const launchAsync = async (item) => {
      await launchBrowser({ deviceDescription: item, viewport: config.viewport, headless: config.headless, timeout: 10000, })
    }
    
    if (config?.multiBrowser?.length === 0) {
      console.log('No browser choice was found in the configuration file. Please run `yarn run configure` again and add a browser choice.')
      return
    } else {
      console.log(`Queued: ${config.multiBrowser}`)
      config.multiBrowser.forEach(async item => {
        console.log(`Launching ${item}`)
        await launchAsync(item)
      })
    }

  } catch (error) {
    console.log({ error })
    return
  }
}

init()