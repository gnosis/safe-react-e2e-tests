const output = require('../output.json')


const errorsText = []
for (let i = 0; i < output.testResults.length; i++) {
    const testResult = output.testResults[i];
    for (let j = 0; j < testResult.assertionResults.length; j++) {
        const testCase = testResult.assertionResults[j];
        if(testCase.failureMessages.length > 0){
            errorsText.push("\\n")
            errorsText.push(JSON.stringify(` - ❌ ${testCase.fullName}`).slice(1, -1))
        }
    }
}

if(errorsText.length > 0) {
  console.log("\\n")
  console.log('Failed tests:')
  errorsText.forEach((text) => {
    console.log(text)
  })
}
