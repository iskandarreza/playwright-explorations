/* eslint-disable no-console */
const fs = require('fs')
const path = require('path')

/**
 * It creates a JSON file with the name `browser.config.json` in the `config` directory.
 * 
 * The JSON file contains two properties: `url` and `browserType`.
 * 
 * The `url` property is set to `google.com` by default.
 * 
 * The `browserType` property is set to `chromium` by default.
 * 
 * The function also has a TODO comment.
 * 
 * The TODO comment is for adding CLI options to the function.
 * 
 * The CLI options would allow the user to set the `url` and `browserType` properties.
 * 
 * The CLI options would be `--start-url` and `--browser-type`.
 */
const createBrowserConfig = () => {
  const destination = path.join(path.resolve('./config'))

  /**
   * `paramValue` returns the value of a parameter passed to a function
   * @param {string} param - the parameter to be checked
   * @returns {string} The value of the parameter.
   */
  const paramValue = (param) => {
    /**
     * It returns the index of the flag that matches the parameter.
     * @param {string} param - The parameter you want to check for.
     * @return {string} - the array index
     */
    const index = (param) => flags.findIndex((v) => v.includes(param))
    if (index(param) !== -1) {
      const value = flags[index(param)].split(/=(.*)/s)[1]
      if (value) {
        return value
      } else {
        return param
      }
    } else {
      return false
    }
  }

  let browserConfig = {
    url: 'google.com',
    browserType: 'chromium'
  }

  // TODO: CLI option for this 
  //   if (paramValue('--start-url')) {
  //     browserConfig.url = paramValue('--start-url')
  //   }
  //   if (paramValue('--browser-type')) {
  //     browserConfig.browserType = paramValue('--browser-type')
  //   }

  fs.writeFile(path.join(destination, 'browser.config.json'), JSON.stringify(browserConfig, null, 4), (err) => {
    if (err) console.error(err) 
  })

  console.log((`browser.config.json created at ${destination}`))
}
  
exports.createBrowserConfig = createBrowserConfig