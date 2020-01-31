const path = require('path')
const fs = require('fs')

const Mkdirp = require('mkdirp')
const fetch = require('node-fetch')

const { ask } = require('./q-and-a')
const { promisify } = require('./utils')

const mkdirp = promisify(Mkdirp)
const writeFile = promisify(fs.writeFile)

module.exports = async (id, token, dirname) => {
  let frontendDir = dirname

  if (!frontendDir) {
    frontendDir = await ask('Name your frontend code directory:\n./plugins/', {
      conditionDescription: 'only alphanumeric and dashes',
      validator: a => a.match(/^[A-Za-z0-9-]*$/)
    })
  }

  await mkdirp(path.resolve(`./plugins/${frontendDir}/src`)).catch(err => console.error('Error creating directory:', err))

  const plugin = await getPlugin(id, token)

  if (!plugin) {
    throw new Error('Check the parameters you passed and try again.')
  }

  for (const ext of ['js', 'html', 'css']) {
    // convert file to wgn?
    // const text = wgnConverter(plugin[ext])

    await writeFile(
      path.resolve(`./plugins/${frontendDir}/src/plugin.${ext}`),
      plugin[ext]
    )
  }

  await Promise.all([
    createMayaJSON('maya.json', frontendDir, plugin),
    createMayaJSON('maya.example.json', frontendDir, plugin),
    createGitignore(),
    createReadMe(plugin.name)
  ])

  process.chdir(path.resolve(`./plugins/${frontendDir}`))
}

async function getPlugin(id, token) {
  const res = await fetch(`https://api.zenginehq.com/v1/plugins/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!res.ok) {
    console.error(
      'Unable to fetch plugin:',
      JSON.stringify(await res.json().catch(e => 'bummer.'), null, 2)
    )

    return null
  }

  const { data = null } = (await res.json().catch(e => null) || {})

  return data
}

function createMayaJSON (filename, dir, { id, namespace, route }) {
  return writeFile(path.resolve(`./${filename}`), JSON.stringify({
    environments: ['prod', 'stage', 'dev'].reduce((envs, env) => ({
      ...envs,
      [env]: {
        access_token: '{{ access token }}',
        plugins: {
          [dir]: {
            id,
            namespace,
            route,
            version: 2
          }
        },
        default: env === 'dev' ? true : undefined
      }
    }), {})
  }, null, 2))
}

function createGitignore () {
  return writeFile(
    path.resolve('./.gitignore'),
    'maya.json\nmaya_build/*\n.DS_Store\nnode_modules\nplugins/.DS_Store\n.vscode'
  )
}

function createReadMe (name) {
  return writeFile(
    path.resolve('./README.md'),
    `# ${name}`
  )
}
