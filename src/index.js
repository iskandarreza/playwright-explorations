const fs = require('fs')
const path = require('path')
const { chromium, devices } = require('playwright')

/* Setting the path to the config file and the path to the configurator page. */
const configFilePath = path.join(path.resolve('config'), 'browser.config.json')
const configuratorPath = `file://${path.resolve('src/index.html')}`

/**
 * If the config file exists, read it, otherwise return an empty object.
 * @returns The config object.
 */
const readConfig = () => {
  return fs.existsSync(configFilePath) ? require(configFilePath) : { startUrl: 'about:blank', multiBrowser: ['Desktop Firefox'] }
}
const writeConfig = async (config) => {
  fs.writeFile(path.join(configFilePath), JSON.stringify(config, null, 4), (err) => {
    if (err) console.error(err)
  })
}

const init = async () => {
  const lastConfig = readConfig()
  const lastBrowser = lastConfig.multiBrowser[0] || 'Desktop Firefox'
  const browser = await chromium.launch({ headless: false, timeout: 0 })
  const browserContext = await browser.newContext({ viewport: null })
  const page = await browserContext.newPage()

  const startUrl = page.locator('#startUrl input')

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

    /* Moving the last four options to the top of the list. */
    for (let index = 0; index < 4; index++) {
      const option = browserTypeSelect.lastChild
      browserTypeSelect.insertAdjacentElement('afterbegin', option)
    }

  }, devices)
  page.locator('#browserType select').selectOption(lastBrowser)

  await startUrl.fill(lastConfig.startUrl)
  await startUrl.focus()

  /* Waiting for the console to log a message that contains the word 'submit' and has a type of
  'debug'. */
  await page.waitForEvent('console', {
    predicate: async (message) => {
      const text = message.text()
      if (text.includes('submit') && message.type() === 'debug') {
        const startUrl = await page.inputValue('#startUrl input')
        const headless = await page.isChecked('#headless input')
        const overrideViewport = await page.isChecked('#viewport input')

        const getBrowserChoices = () => {
          console.log(window.browserChoices)
          return window.browserChoices || []
        }
        const browserChoices = await page.evaluate(getBrowserChoices)

        let data = {}
        data.startUrl = startUrl
        data.multiBrowser = browserChoices
        data.headless = headless
        if (overrideViewport) {
          let value = await page.inputValue('#viewport select')
          data.viewport = {
            width: parseInt(value.split('x')[0]),
            height: parseInt(value.split('x')[1])
          }
        }
        await writeConfig(data)

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