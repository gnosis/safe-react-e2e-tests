const path = require('path');
const fs = require('fs');

const directoryPath = path.join(__dirname, '/../src')

const fileNames = fs.readdirSync(directoryPath, 'utf8')

const commentStart = 'console.log(\''
const commentEnd = '\')'
fileNames.forEach((fileName)=>{
  const data = fs.readFileSync(path.join(directoryPath, fileName), 'utf8')
  let fileText = data
  let lineCount = 0
  let logIndex = fileText.indexOf(commentStart)
  let logEnding = fileText.indexOf(commentEnd, logIndex)
  while (logIndex > 0) {
    let comment = fileText.substr(logIndex, logEnding-logIndex+commentEnd.length)
    fileText = fileText.replace(comment, '')
    logIndex = fileText.indexOf(commentStart)
    logEnding = fileText.indexOf(commentEnd, logIndex)
    comment = comment.replace(commentStart, '').replace(commentEnd, '')
    if(lineCount > 0){
      console.log(`${lineCount}. ${comment}  `)
    } else {
      console.log(`#### [${comment}](./../src/${fileName})`)
    }
    lineCount ++
  }
  console.log('  ')
})
