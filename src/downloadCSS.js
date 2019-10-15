const https = require('https')
const fs = require('fs')
const path = require('path')
const Mkdirp = require('mkdirp')
const { relCwd, promisify } = require('./utils')
const mkdirp = promisify(Mkdirp)
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

const files = [
  'app.min.css',
  'default-plugins.min.css'
]

module.exports = async () => {
  await mkdirp(relCwd('wrapper', 'css'))
  await mkdirp(relCwd('wrapper', 'images'))

  const imageList = {}

  for (const file of files) {
    const dl = await downloadFile(`https://orgs-platform.zenginehq.com/dest/${file}`, relCwd('wrapper', 'css', file))
      .catch(err => err instanceof Error ? err : new Error(JSON.stringify(err)))
    
    if (dl instanceof Error) {
      console.log(`Unable to download https://orgs-platform.zenginehq.com/dest/${file}. You'll need to handle this dependency manually.`)
    }

    let fileContents = await readFile(relCwd('wrapper', 'css', file), { encoding: 'utf8' })
      .catch(err => err instanceof Error ? err : new Error(JSON.stringify(err)))
      
    if (fileContents instanceof Error) {
      console.error(`Unable to read contents of ${relCwd('wrapper', 'css', file)}. Images not downloaded.`)
      continue
    }

    const urls = getURLs(fileContents)

    for (const url of urls) {
      if (!imageList[url]) {
        await downloadFile(
          `https://orgs-platform.zenginehq.com/${removeLeadingSlash(url)}`,
          relCwd('wrapper', 'images', path.basename(url))
        )
          .catch(err => console.error(`unable to download ${url}`))

        fileContents = fileContents.replace(url, `/images/${path.basename(url)}`)
        imageList[url] = true
      }
    }

    await writeFile(relCwd('wrapper', 'css', file), fileContents)
      .catch(err => console.error(`Unable to fix contents of ${file}`))
  }
}

/**
 * 
 * @param {string} contents 
 * 
 * @returns {string[]}
 */
function getURLs (contents) {
  const matches = contents.match(/url\(([^)]+)\)/g)

  return matches.map(str => str.substring(4, str.length - 1))
}

function removeLeadingSlash (url) {
  return url.startsWith('/') ? url.slice(1) : url
}

function downloadFile (url, dest) {
  return new Promise((resolve, reject) => {
    const fileWriter = fs.createWriteStream(dest, { emitClose: true })

    const request = https.get(url, response => {
      response.pipe(fileWriter)

      response.on('error', reject)
    })

    fileWriter.on('close', resolve)
  })
}