const writeFile = require('./promisify')(require('fs').writeFile)

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