const program = require('commander')

program
  .command('init')
  .action(() => {
    console.log('initializing!')
    console.log(process.cwd())
  })