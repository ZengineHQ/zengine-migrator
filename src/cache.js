const fs = require('fs')
const { promisify } = require('./utils')
const writeFile = promisify(fs.writeFile)

const cache = {}

const cacheFile = (name, contents) => {
  cache[name] = contents
}

const moveCachedFile = name => {
  return writeFile(`moved-${name}`, cache[name])
}

module.exports = {
  cache,
  cacheFile,
  moveCachedFile
}