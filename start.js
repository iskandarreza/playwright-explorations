/* eslint-disable no-console */
const fs = require('fs')
const path = require('path')

const { launchBrowser } = require('./lib/browser')

launchBrowser()

fs.watchFile(path.resolve('config/browser.config.json'), () => {
  console.log('Configuration changed, relaunching browser')
  launchBrowser()
})
