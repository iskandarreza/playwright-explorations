const fs = require('fs')
const path = require('path')
const { chromium, devices } = require('playwright')

/* Setting the path to the config file and the path to the configurator page. */
const configFilePath = path.join(path.resolve('./config'), 'browser.config.json')
const configuratorPath = `file://${path.resolve('experiments/launch-multiple-browsers/index.html')}`

/**
 * If the config file exists, read it, otherwise return an empty object.
 * @returns The config object.
 */
const readConfig = () => {
  return fs.existsSync(configFilePath) ? require(configFilePath) : {}
}
const writeConfig = (config) => {
  fs.writeFile(path.join(configFilePath), JSON.stringify(config, null, 4), (err) => {
    if (err) console.error(err)
  })
}

const init = async () => {
  const lastConfig = readConfig()
  const browser = await chromium.launch({ headless: false, timeout: 0 })
  const browserContext = await browser.newContext({ viewport: null })
  const page = await browserContext.newPage()

  const startUrl = page.locator('#startUrl input')
  const variations = page.locator('#variations input')
  const browserType = page.locator('#browserType select')

  await page.goto(configuratorPath)

  /* Adding the options to the select element. */
  await page.evaluate((options) => {
    const browserTypeSelect = document.querySelector('#browserType select')
    Object.keys(options).forEach((key) => {
      const opt = document.createElement('option')
      opt.textContent = key
      opt.value = key
      browserTypeSelect.appendChild(opt)
    })

  }, devices)

  /* Filling the form with the values from the config file. */
  await startUrl.fill(lastConfig?.startUrl)
  if (lastConfig?.variations?.length > 0) {
    let varStr = ''
    lastConfig.variations.forEach((v) => {
      varStr += `${v.trim()}, `
    })
    await variations.fill(varStr.slice(0, -2))
  }
  await browserType.selectOption(lastConfig?.browserType)

  await startUrl.focus()

  /* Waiting for the console to log a message that contains the word 'submit' and has a type of
  'debug'. */
  await page.waitForEvent('console', {
    predicate: async (message) => {
      const text = message.text()
      if (text.includes('submit') && message.type() === 'debug') {
        const startUrl = await page.inputValue('#startUrl input')
        const variations = await page.inputValue('#variations input')
        const browserType = await page.inputValue('#browserType select')

        const getBrowsers = () => {
          return window.browsers || []
        }
        const multiBrowser = await page.evaluate(getBrowsers)

        let data = {}
        data.startUrl = startUrl
        data.variations = variations.split(',').map((v) => { return v.trim() })
        data.browserType = browserType
        data.multiBrowser = multiBrowser
        writeConfig(data)

        await page.waitForTimeout(1000)
        return true
      }
      return false
    },
    timeout: 0
  })

  await browser.close()
}

init()