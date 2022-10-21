const fs = require('fs')
const path = require('path')
const { chromium } = require('playwright')

/** Just a test to retrieve formdata */

/**
 * It opens a browser, navigates to a local html file, waits for a console.log event, then closes the
 * browser.
 */
const init = async () => {
  const browser = await chromium.launch({ headless: false, timeout: 15000 })
  const browserContext = await browser.newContext({ viewport: null })
  const page = await browserContext.newPage()

  await page.goto(`file://${path.resolve('experiments/formdata-retrieval/index.html')}`)

  await page.waitForEvent('console', {
    predicate: async (message) => {
      const text = message.text()
      if (text.includes('byebye') && message.type() === 'debug') {
        const fname = await page.inputValue('#fname')
        const lname = await page.inputValue('#lname')

        let data = {}
        data.fname = fname
        data.lname = lname

        console.log(data)

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