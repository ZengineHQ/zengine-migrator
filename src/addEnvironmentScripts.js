const path = require('path')
const fs = require('fs')
const { relCwd, promisify } = require('./utils')
const writeFile = promisify(fs.writeFile)

module.exports = async () => {
  const mayaJSON = fs.existsSync(relCwd('..', '..', 'maya.json')) && require(relCwd('..', '..', 'maya.json'))

  const pluginName = path.basename(process.cwd())

  if (mayaJSON) {
    try {
      const packageJSON = require(relCwd('package.json'))

      const buildScript = packageJSON.scripts.build
      const startScript = packageJSON.scripts.start

      Object.keys(mayaJSON.environments).forEach(key => {
        const environment = mayaJSON.environments[key]

        packageJSON.scripts[`dev-${key}`] = `ZENGINE_ENV='${key}' ${startScript}`
        packageJSON.scripts[`build-${key}`] = `ZENGINE_ENV='${key}' ${buildScript}`

        if (environment.default) {
          packageJSON.scripts.start = `ZENGINE_ENV='${key}' ${startScript}`
          packageJSON.scripts.build = `ZENGINE_ENV='${key}' ${buildScript}`
        }
      })

      await writeFile(relCwd('package.json'), JSON.stringify(packageJSON, null, 2))
    } catch (e) {
      console.error(`malformed maya.json:`, e)
    }
  }
}