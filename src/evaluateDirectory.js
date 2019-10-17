const fs = require('fs')
const path = require('path')
const { promisify } = require('./utils')
const readFile = promisify(fs.readFile)
const { cacheFile, cache, moveCachedFile } = require('./cache')
const { blacklistDirs, blacklistFiles, blacklistHandlers } = require('./blacklist')
const runDegit = require('./runDegit')
const downloadCSS = require('./downloadCSS')
const stringReplacer = require('./stringReplacer')

/**
 * @callback directoryHandler
 * 
 * @param {Error | null} err
 * @param {fs.Dirent[]} entities
 * 
 * @returns {Promise<void>}
 */

/**
 * @param {{ branch: string, user: string }}
 * 
 * @returns {directoryHandler}
 */
module.exports = ({ branch, user }) => async (err, entities) => {
  if (err) {
    return console.error(err)
  }

  for (const entity of entities) {
    // don't care about symlinks at top level, and ignoring them avoids weird readfile errors
    if (entity.isSymbolicLink()) continue

    if ([
      'maya.json',
      'maya.default.json',
      'maya.example.json',
      'maya_build',
      'backend',
      'firebase',
      'plugins',
      '.legacy-output',
      '.cache',
      'dist'
    ].includes(entity.name)) {
      return console.error(`It appears you may be running this in the wrong directory. Aborting because "./${entity.name}" was found. If this is the right directory, rename "./${entity.name}" and try again.`)
    }

    if (blacklistFiles[entity.name]) {
      const contents = await readFile(path.resolve(process.cwd(), entity.name), { encoding: 'utf8' })
        .catch(err => err instanceof Error ? err : new Error(JSON.stringify(err)))

      if (contents instanceof Error) {
        return console.error(`Aborting due to readfile error in "./${entity.name}": `, contents)
      }

      cacheFile(entity.name, contents)
    }

    if (blacklistDirs[entity.name]) {
      return console.error(
        `Aborting due to existing "./${entity.name}/" directory. Please rename this directory and try again.`
      )
    }

    if (entity.name === 'src' && entity.isDirectory()) {
      stringReplacer('src')
    }
  }

  for (const filename of Object.keys(cache)) {
    const success = await moveCachedFile(filename)
      .catch(err => err instanceof Error ? err : new Error(JSON.stringify(err)))
      
    if (success instanceof Error) {
      return console.error(`Aborting due to writefile error with ${filename} => moved-${filename}: `, success)
    }
  }

  const clonedSuccessfully = await runDegit(user, branch)

  if (!clonedSuccessfully) {
    return console.error(`Unable to clone repository. Aborted.`)
  }

  for (const filename of Object.keys(cache)) {
    if (typeof blacklistHandlers[filename] === 'function') {
      const successfulMove = await blacklistHandlers[filename](cache[filename])
        .catch(err => err instanceof Error ? err : new Error(JSON.stringify(err)))
        
      if (successfulMove instanceof Error || !successfulMove) {
        console.error(`Unable to merge ${filename} files. Information may have been lost.`)
      }
    }
  }

  await downloadCSS()

  console.log('Complete!')
}