const output = require('../output.json')

/*const errors = output.testResults.map((testResults) => {
    testResults.map((result)=>{
        if(result.failureMessages.length > 0){
            console.log(`Test: ${result.title}`)
            result.failureMessages.map((messages)=> {
                console.log(messages)
            })
        }
    })
    console.log(JSON.stringify(results))
})*/


console.log('List of errors')