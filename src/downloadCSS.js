const https = require('https')
const fs = require('fs')
const Mkdirp = require('mkdirp')
const { relCwd, promisify } = require('./utils')
const mkdirp = promisify(Mkdirp)

const files = [
  'app.min.css',
  'default-plugins.min.css'
]

module.exports = async () => {
  await mkdirp(relCwd('wrapper', 'css'))

  for (const file of files) {
    const dl = await downloadFile(file).catch(err => err instanceof Error ? err : new Error(JSON.stringify(err)))
    
    if (dl instanceof Error) {
      console.log(`Unable to download https://platform.zenginehq.com/dest/${file}. You'll need to handle this dependency manually.`)
    }
  }
}

function downloadFile (filename) {
  return new Promise((resolve, reject) => {
    const fileWriter = fs.createWriteStream(relCwd('wrapper', 'css', filename), { emitClose: true })

    const request = https.get(`https://platform.zenginehq.com/dest/${filename}`, response => {
      response.pipe(fileWriter)

      response.on('error', reject)
    })

    fileWriter.on('close', resolve)
  })
}