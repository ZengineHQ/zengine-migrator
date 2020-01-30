#!/usr/bin/env node

const fs = require('fs')
const program = require('commander')

const evaluateDirectory = require('./src/evaluateDirectory')
const scaffoldPlugin = require('./src/scaffoldPlugin')

const pkg = require('./package.json')
const updateNotifier = require('update-notifier')

const notifier = updateNotifier({ pkg, updateCheckInterval: 1 })

notifier.notify()

program
  .option('-b --branch <branch>', 'specify a branch of the legacy wrapper repo', str => `#${str}`, '#master')
  .option('-u --user <user>', 'specify the github user for the legacy wrapper repo', str => `${str}/`, 'ZengineHQ/')
  .option('-i --id <id>', 'specify the id of plugin code to fetch from Zengine API', Number)
  .option('-t --token <token>', 'specify the access token for fetching plugin code')
  .option('-d --dirname <dirname>', 'specify the name of your frontend code directory')
  .parse(process.argv)

async function execute () {
  const { branch, user, id, token, dirname } = program

  if ((id && !token) || (!id && token)) {
    return console.error('\u001b[33mPassing a plugin ID must also be accompanied by an access token and vice versa.\u001b[39m')
  }

  if (id && token) {
    const scaffolded = await scaffoldPlugin(id, token, dirname)
      .catch(err => err instanceof Error ? err : new Error(JSON.stringify(err)))
    
    if (scaffolded instanceof Error) {
      return console.error(scaffolded)
    }
  }

  // handles the migration
  fs.readdir(process.cwd(), { encoding: 'utf8', withFileTypes: true }, evaluateDirectory({ branch, user }))
}

execute()
