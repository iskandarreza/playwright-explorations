/* eslint-disable no-console */
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

/**
 * It watches a file for changes and deletes the cache for that file when it changes
 * @param {any} module - The module to watch for changes.
 */
 function nocache(module) {
  fs.watchFile(path.resolve(module), () => {
    delete require.cache[require.resolve(module)] 
  }) 
}

const createBrowserConfig = () => {
  const destination = path.join(path.resolve('./config'))

  let browserConfig = {
    url: 'google.com',
    browserType: 'chromium'
  }

  fs.writeFile(path.join(destination, 'browser.config.json'), JSON.stringify(browserConfig, null, 4), (err) => {
    if (err) console.error(err) 
  })

  console.log(chalk.cyan(`browser.config.json created at ${destination}`))
}
  
exports.createBrowserConfig = createBrowserConfig
exports.nocache = nocache