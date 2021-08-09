const output = require('../output.json')
const testResults = []

for (let i = 0; i < output.testResults.length; i++) {
    const testResult = output.testResults[i];
    for (let j = 0; j < testResult.assertionResults.length; j++) {
        const testCase = testResult.assertionResults[j];
        if(testCase.failureMessages.length > 0){
            testResults.push({
                title: testCase.fullName,
                errors: testCase.failureMessages
            })
        }
    }
}

console.log(JSON.stringify(testResults))