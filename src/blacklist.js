const fs = require('fs')
const path = require('path')
const promisify = require('./promisify')
const { cache } = require('./cache')
const appendFile = promisify(fs.appendFile)
const deleteFile = promisify(fs.unlink)
const writeFile = promisify(fs.writeFile)

module.exports = {
  blacklistDirs: {
    'wrapper': 1,
    'vendor': 1
  },
  blacklistFiles: {
    'package.json': 1,
    '.gitignore': 1
  },
  blacklistHandlers: {
    async 'package.json' (contents) {
      const packagePath = path.resolve(process.cwd(), 'package.json')
      const movedPackagePath = path.resolve(process.cwd(), 'moved-package.json')

      if (fs.existsSync(packagePath) && cache['package.json']) {
        const strippedWrapperPackage = strip(
          require(packagePath),
          ['name', 'version', 'private', 'repository', 'author', 'license', 'bugs', 'homepage', 'description']
        )
        const newPackageJSON = mergePackageJSONs(JSON.parse(cache['package.json']), strippedWrapperPackage)

        const written = await writeFile(packagePath, JSON.stringify(newPackageJSON, null, 2))
          .catch(err => err instanceof Error ? err : new Error(JSON.stringify(err)))
          
        if (written instanceof Error) {
          throw written
        }

        const originalpath = path.resolve(process.cwd(), 'moved-package.json')

        if (fs.existsSync(originalpath)) {
          const deleted = await deleteFile(originalpath)
            .catch(err => err instanceof Error ? err : new Error(JSON.stringify(err)))

          if (deleted instanceof Error) {
            throw deleted
          }

          return 'Success!'
        }
      }
    },
    async '.gitignore' (contents) {
      const gitignorePath = path.resolve(process.cwd(), '.gitignore')

      if (fs.existsSync(gitignorePath) && contents) {
        const appended = await appendFile(gitignorePath, `\n\n# Original File:\n\n${contents}`)
          .catch(err => err instanceof Error ? err : new Error(JSON.stringify(err)))
          
        if (appended instanceof Error) {
          throw appended
        }

        const originalpath = path.resolve(process.cwd(), 'moved-.gitignore')

        if (fs.existsSync(originalpath)) {
          const deleted = await deleteFile(originalpath)
            .catch(err => err instanceof Error ? err : new Error(JSON.stringify(err)))
            
          if (deleted instanceof Error) {
            throw deleted
          }

          return 'Success!'
        }
      }
    }
  }
}

function mergePackageJSONs(originalPackage, wrapperPackage) {
  const [uniqueKeysObject, sharedKeys] = separateKeys(originalPackage, wrapperPackage)

  for (const key of sharedKeys) {
    if (isValidObject(originalPackage[key]) && isValidObject(wrapperPackage[key])) {
      uniqueKeysObject[key] = mergePackageJSONs(originalPackage[key], wrapperPackage[key])
    } else {
      uniqueKeysObject[key] = wrapperPackage[key]
      uniqueKeysObject[`original-${key}`] = originalPackage[key]
    }
  }

  return uniqueKeysObject
}

/**
 * Separate Top-level Keys of 2 objects into a mapping of unique keys with their values and a list of all shared keys
 * 
 * @param {{ [key: string]: any }} first package.json object
 * @param {{ [key: string]: any }} second package.json object
 * 
 * @returns {[{ [key: string]: any }, string[]]} [mapOfUniqueKeysAndTheirValues, listOfSharedKeys]
 */
function separateKeys (first, second) {
  const sharedKeys = []
  const isUnique = Object.keys(first).reduce((map, key) => ({ ...map, [key]: true }), {})

  for (const key of Object.keys(second)) {
    if (isUnique[key]) {
      delete isUnique[key]

      sharedKeys.push(key)
    } else {
      isUnique[key] = true
    }
  }

  const uniqueMap = Object.keys(isUnique).reduce((map, key) => ({ ...map, [key]: first[key] || second[key] }), {})

  return [uniqueMap, sharedKeys]
}

function isValidObject (obj) {
  return obj != null && typeof obj === 'object' && !Array.isArray(obj)
}

function strip (obj, keys) {
  const newObj = { ...obj }

  keys.forEach(key => {
    delete newObj[key]
  })

  return newObj
}
