#!/usr/bin/env node

const fs = require('fs')
const program = require('commander')
const evaluateDirectory = require('./src/evaluateDirectory')

program
  .option('-b --branch <branch>', 'specify a branch of the legacy wrapper repo', str => `#${str}`, '#master')
  .parse(process.argv)

const { branch } = program

fs.readdir(process.cwd(), { encoding: 'utf8', withFileTypes: true }, evaluateDirectory({ branch }))
