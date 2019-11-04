const { existsSync: exists, writeFile: wf } = require('fs')
const { relCwd, promisify } = require('./utils')
const writeFile = promisify(wf)

module.exports = async () => {
  for (const file of ['maya.json', 'maya.default.json', 'maya.example.json']) {
    const mayaPath = relCwd('..', '..', file)

    if (exists(mayaPath)) {
      const { environments } = require(mayaPath)

      if (!environments) continue

      Object.keys(environments).forEach(env => {
        Object.keys(environments[env].plugins).forEach(pluginName => {
          if (typeof environments[env].plugins[pluginName].namespace === 'string') {
            environments[env].plugins[pluginName].namespace = kebabCase(environments[env].plugins[pluginName].namespace)
          }
        })
      })

      await writeFile(mayaPath, JSON.stringify({ environments }, null, 2))
        .catch(err => console.error(`Error while migrating namespace of ${mayaPath}:\n\n`, err))
    }
  }
}

function kebabCase (str) {
  return str.match(/[A-Z]{2,}(?=[A-Z][a-z0-9]*|\b)|[A-Z]?[a-z0-9]*|[A-Z]|[0-9]+/g)
    .filter(Boolean)
    .map(x => x.toLowerCase())
    .join('-')
}
