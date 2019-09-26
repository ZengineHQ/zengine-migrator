const degit = require('degit')

const REPO = 'legacy-plugin-wrapper'

module.exports = async (user, branch) => {
  const degitter = degit(`${user}${REPO}${branch}`, { force: true })

  degitter.on('info', info => info.code === 'SUCCESS' && console.log(info.message))

  const cloned = await degitter.clone(process.cwd())
    .catch(err => err instanceof Error ? err : new Error(JSON.stringify(err)))
    
  if (cloned instanceof Error) {
    return console.error(`Error running degit on ${user}${REPO}${branch}: `, cloned)
  }

  return 'Success!'
}