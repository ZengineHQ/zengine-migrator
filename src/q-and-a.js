const readline = require("readline")

exports.ask = (question = '\u001b[32m\u03BB\u001b[39m ', {
  recursion = true,
  validator = a => 1,
  conditionDescription
} = {}) => new Promise((resolve, reject) => {
  const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
  })

  function recursivelyRespond (answer) {
    if (validator(answer)) {
      rl.close()

      return resolve(answer)
    }

    rl.question(`Expected: ${conditionDescription}\n\nPlease try again: \n\n${question}`, recursivelyRespond)
  }

  function immediateResponse (answer) {
    rl.close()

    return validator(answer) ? resolve(answer) : reject(answer)
  }

  rl.question(question, recursion ? recursivelyRespond : immediateResponse)
})
