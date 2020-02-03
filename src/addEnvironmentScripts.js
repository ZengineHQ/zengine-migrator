const path = require('path')
const fs = require('fs')
const { relCwd, promisify } = require('./utils')
const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)

module.exports = async () => {
  const mayaJSON = fs.existsSync(relCwd('..', '..', 'maya.json')) && require(relCwd('..', '..', 'maya.json'))

  const pluginName = path.basename(process.cwd())

  if (mayaJSON) {
    try {
      const packageJSON = JSON.parse(await readFile(relCwd('package.json'), { encoding: 'utf8' }))

      const buildScript = packageJSON.scripts.build
      const startScript = packageJSON.scripts.start

      Object.keys(mayaJSON.environments).forEach(key => {
        const environment = mayaJSON.environments[key]

        packageJSON.scripts[`dev-${key}`] = `rm -rf dist; ZENGINE_ENV='${key}' ${startScript}`
        packageJSON.scripts[`build-${key}`] = `rm -rf dist .cache; ZENGINE_ENV='${key}' ${buildScript}`

        if (environment.default) {
          packageJSON.scripts.start = `rm -rf dist; ${startScript}`
          packageJSON.scripts.build = `rm -rf dist .cache; ${buildScript}`
        }
      })

      await writeFile(relCwd('package.json'), JSON.stringify(packageJSON, null, 2))
    } catch (e) {
      console.error(`malformed maya.json:`, e)
    }
  }
}