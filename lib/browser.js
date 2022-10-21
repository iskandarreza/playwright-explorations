/* eslint-disable no-console */
const fs = require('fs')
const path = require('path')
const { chromium, firefox, webkit, devices } = require('playwright')

/**
 * It watches a file for changes and deletes the cache for that file when it changes
 * @param {any} module - The module to watch for changes.
 */
function nocache(module) {
  fs.watchFile(path.resolve(module), () => {
    delete require.cache[require.resolve(module)] 
  }) 
}

const baseOptions = {
  headless: false,
  timeout: 15000
}
/**
 * If the file exists, read it, otherwise return an empty string.
 * @param {string} FILE_PATH - The path to the file you want to read.
 * @return {string} - The webpack preview js to evaluate.
 */
// const fileContent = (FILE_PATH) => fs.existsSync(FILE_PATH) ? fs.readFileSync(FILE_PATH, 'utf8') : ''

let browser, browserContext, deviceOpts, viewportNull = true
/**
 * It starts a playwright instance based on settings in the config file  
 */
const launchBrowser = async () => {
  let config

  try {
    nocache(path.resolve('config/browser.config.json'))
    config = require(path.resolve('config/browser.config.json'))
  } catch (error) {
    console.log('browser.config.json not found. Aborting browser launch. Run the \'watch\' command with the \'--create-browser-config\' flag to generate a config file.')
    return
  }

  /**
   * If the browserContext variable is not null or undefined, close it. Then, create a new browser context and
   * assign it to the browserContext variable.
   */
  const startBrowser = async () => {
    if (browserContext) {
      browserContext.close()
    }

    /**
     * Create a new browser context, and assign it to the variable browserContext.
     */
    const initBrowserContext = async () => {
      if (viewportNull) {
        browserContext = await browser.newContext({ viewport: null })
      } else {
        browserContext = await browser.newContext()
      }
    }

    switch (config.browserType) {
      case 'chromium':
        browser = await chromium.launch(baseOptions)
        deviceOpts = devices['Desktop Chrome']
        await initBrowserContext()
        break

      case 'firefox':
        browser = await firefox.launch(baseOptions)
        deviceOpts = devices['Desktop Firefox']
        await initBrowserContext()
        break

      case 'webkit':
        browser = await webkit.launch(baseOptions)
        deviceOpts = devices['Desktop Safari']
        await initBrowserContext()
        break

      default:
        try {
          const device = devices[config.browserType]
          const browserType = device.defaultBrowserType
          browser = await eval(browserType).launch(baseOptions)
          deviceOpts = device
          viewportNull = false
          await initBrowserContext()          
        } catch (error) {
          console.log(`Unknown device: ${config.browserType}`)
          console.log(error)
        }
        break
    }
  }

  try {
    await startBrowser()

    const page = await browserContext.newPage(deviceOpts)
    if (!viewportNull) {
      await page.setViewportSize(deviceOpts.viewport)
    }
    if (!config.url) {
      'Start URL not defined in browser.config.json, aborting browser launch.'
    }
    await page.goto(config.url)

    // previewVariations()
  } catch (error) {
    console.log(error)
  }
}

exports.launchBrowser = launchBrowser