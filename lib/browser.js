/* eslint-disable no-console */
const fs = require('fs')
const path = require('path')
const { chromium, firefox, webkit, devices } = require('playwright')

const baseOptions = {
  headless: false,
  timeout: 15000
}
/**
 * If the file exists, read it, otherwise return an empty string.
 * @param {string} FILE_PATH - The path to the file you want to read.
 * @return {string} - The webpack preview js to evaluate.
 */

let browser, browserContext, deviceOpts, viewportNull = true
/**
 * It starts a playwright instance based on settings in the config file  
 */
const launchBrowser = async () => {
  let config

  try {
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
      case 'Chromium':
        browser = await chromium.launch(baseOptions)
        deviceOpts = devices['Desktop Chrome']
        await initBrowserContext()
        break

      case 'Firefox':
        browser = await firefox.launch(baseOptions)
        deviceOpts = devices['Desktop Firefox']
        await initBrowserContext()
        break

      case 'Webkit':
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
    await page.goto(config.startUrl)

  } catch (error) {
    console.log(error)
  }
}

exports.launchBrowser = launchBrowser