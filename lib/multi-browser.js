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
const launchBrowser = async (options) => {
  let config = require(path.resolve('config/browser.config.json'))

  if (options?.multiBrowser) {
    try {
      config.browserType = options.browser
      viewportNull = false
    } catch (error) {
      console.log(error)
    }

  } else {
    try {
      if (config.multiBrowser.length !== 0) {
        config.browserType = config.multiBrowser.shift()
      } else {
        console.log('No browser choice was found in the configuration file. Please run `yarn run configure` again and add a browser choice.')
      }
    } catch (error) {
      console.log('browser.config.json not found. Aborting browser launch. Please run `yarn run configure` to generate a config file.')
      return
    }
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

    try {
      const device = devices[config.browserType]
      const browserType = device.defaultBrowserType
      console.log(`${config.browserType} - {browserType: ${browserType}}`)
      console.log('')

      browser = await eval(browserType).launch(baseOptions)
      deviceOpts = device
      viewportNull = false
      await initBrowserContext()
    } catch (error) {
      console.log(`Unknown device: ${config.browserType}`)
      console.log(error)
      return
    }
  }

  try {
    await startBrowser()

    const page = await browserContext.newPage(deviceOpts)
    if (!viewportNull) {
      await page.setViewportSize(deviceOpts.viewport)
    }
    if (!config.startUrl) {
      'Start URL not defined in browser.config.json, aborting browser launch.'
      return
    }
    await page.goto(config.startUrl)

  } catch (error) {
    console.log(error)
  }
}

exports.launchBrowser = launchBrowser