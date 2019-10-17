const fs = require('fs')
const path = require('path')
const { promisify, relCwd } = require('./utils')
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const readdir = promisify(fs.readdir)

const stringReplacer = async (...segments) => {
  /**
   * @type {fs.Dirent[]} entities
   */
  const entities = await readdir(relCwd(...segments), { withFileTypes: true })
    .catch(err => err instanceof Error ? err : new Error(JSON.stringify(err)))

  if (entities instanceof Error) {
    console.error('unable to read from src directory')
  }

  for (const entity of entities) {
    if (entity.isSymbolicLink()) {
      continue
    }

    if (entity.isDirectory()) {
      stringReplacer(...segments.concat([entity.name]))
    }

    if (entity.isFile() && path.extname(entity.name) === '.js') {
      const filePath = relCwd(...segments.concat([entity.name]))

      const contents = await readFile(filePath, { encoding: 'utf8' })
        .catch(err => err instanceof Error ? err : new Error(JSON.stringify(err)))

      if (contents instanceof Error) {
        continue
      }

      const updatedContents = contents
        .replace(/\$window/g, 'znWindow')
        .replace(/\$scope\.pluginName/g, 'plugin.namespace')
        .replace(/\$scope\.\$parent\.pluginName/g, 'plugin.namespace')

      await writeFile(filePath, updatedContents).catch(err => console.error(`error migrating ${entity.name}`, err))
    }
  }
}

module.exports = stringReplacer
