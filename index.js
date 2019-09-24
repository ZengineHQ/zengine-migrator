#!/usr/bin/env node

const fs = require('fs')
const program = require('commander')
const evaluateDirectory = require('./src/evaluateDirectory')

const pkg = require('./package.json')
const updateNotifier = require('update-notifier')

program
  .option('-b --branch <branch>', 'specify a branch of the legacy wrapper repo', str => `#${str}`, '#master')
  .parse(process.argv)

const { branch } = program

fs.readdir(process.cwd(), { encoding: 'utf8', withFileTypes: true }, evaluateDirectory({ branch }))

const notifier = updateNotifier({ pkg, updateCheckInterval: 1 })

notifier.notify()
