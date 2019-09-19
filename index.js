#!/usr/bin/env node

const fs = require('fs')
const evaluateDirectory = require('./src/evaluateDirectory')

fs.readdir(process.cwd(), { encoding: 'utf8', withFileTypes: true }, evaluateDirectory)
