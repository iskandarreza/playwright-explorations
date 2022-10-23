/* eslint-disable no-console */
const fs = require('fs')
const path = require('path')
const { chromium, firefox, webkit, devices } = require('playwright')

const configFilePath = path.resolve('config/browser.config.json')

const kebabCase = string => string
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .replace(/[\s_]+/g, '-')
        .toLowerCase()

/**
 * If the user is idle for 10 seconds, the browser will log 'browser idle' to the console.
 * @param {number} idleTime - The amount of time (in milliseconds) that the user can be inactive before the
 * function is called.
 */
 const inactivityTime = (idleTime) => {
  let time

  const resetTimer = () => {
    console.log('Inactivity timer started')

    clearTimeout(time)
    time = setTimeout(() => { 
      console.log('The clock is ticking...')
      let timeleft = 10
      const countdown = setInterval(() => {
        if (timeleft <= 0) {
          clearInterval(countdown)
          console.log('browser idle') 
        }
        console.log(10 - timeleft)
        timeleft -= 1
      }, 1000)
      
    }, idleTime)
  }

  window.onload = resetTimer
  document.onmousemove = resetTimer
  document.onkeydown = resetTimer
}

let config = fs.existsSync(configFilePath) ? require(configFilePath) : null
let baseOptions = {
  headless: false,
  timeout: 10000 // 1 minute
}

/**
 * It launches a browser, then calls another function to create a browser context
 * @param options - browser options
 */
const initBrowser = async (options) => {
  try {
    const deviceDescription = options.deviceDescription
    const device = devices[options.deviceDescription]
    const defaultBrowserType = device.defaultBrowserType
    const browser = await eval(defaultBrowserType).launch(baseOptions)

    console.log(`${deviceDescription} - {browserType: ${defaultBrowserType}}`)
    console.log(device)
    
    console.log('')

    await initBrowserContext(browser, device, options)

  } catch (error) {
    console.log(`Unknown device: ${options.deviceDescription}`)
    console.log({ error })
    return
  }
}

/**
 * If the device is mobile, create a new browser context, otherwise create a new browser context with a
 * null viewport.
 * @param browser - The browser instance
 * @param device - device emulation
 * @param options - browser options
 */
const initBrowserContext = async (browser, device, options) => {
  let browserContext
  try {
    if (device.isMobile) {
      browserContext = await browser.newContext()
    } else {
      browserContext = await browser.newContext({ viewport: null })
    }
    await initPage(browser, browserContext, device, options)
  } catch (error) {
    console.log(error)
    return
  }
}

/**
 * The function will closes the browser after a period of inactivity.
 * @param browser - The browser instance
 * @param browserContext - The browser context that the page is being opened in.
 * @param device - device emulation
 * @param viewport - { width: 1920, height: 1080 }
 */
const initPage = async (browser, browserContext, device, options) => {
  try {
    const page = await browserContext.newPage(device)
    const close = async () => {
      page.close()
      browser.close()
      console.log('Browser closed due to inactivity')
    }

    if (!device.isMobile && options.viewport) {
      page.setViewportSize(options.viewport)
    } else {
      page.setViewportSize(device.viewport)
    }

    if (!config?.startUrl) {
      'Start URL not defined in browser.config.json, aborting browser launch.'
      return
    }

    await page.goto(config.startUrl)

    if (!baseOptions.headless) {
      page.evaluate(inactivityTime, baseOptions.timeout)

      /* Waiting for the console to log 'browser idle' and then closing the browser. */
      await page.waitForEvent('console', {
        predicate: async (message) => {
          const text = message.text()
          if (text.includes('browser idle')) {
            await page.waitForTimeout(1000)
            return true
          }
          return false
        },
        timeout: 0
      })
      await close()

    } else {
      const filename = kebabCase(options.deviceDescription)
      await page.screenshot({ path: `screenshots/${filename}.png`, fullPage: true })
      console.log(`Screenshot saved at screenshots/${filename}.png`)
      await page.waitForTimeout(baseOptions.timeout)
      await close()    
    }


  } catch (error) {
    console.log(error)
    return
  }
}

/**
 * This function launches a browser, and if the user passes in options, it will use those options,
 * otherwise it will use the default options.
 * @param options - { deviceDescription: `<string>`, headless: `<boolean>`, timeout: `<number>`, viewport: { width: `<number>`, height: `<number>`}
 */
const launchBrowser = async (options) => {
  if (options.hasOwnProperty('headless')) {
    baseOptions.headless = options.headless
  }
  if (options.hasOwnProperty('timeout')) {
    baseOptions.timeout = options.timeout
  }

  try {
    await initBrowser(options)
  } catch (error) {
    console.log({ error })
    return
  }
}

exports.launchBrowser = launchBrowser