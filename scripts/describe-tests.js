const path = require('path');
const fs = require('fs');

const rootDirectoryPath = path.join(__dirname, '/../src')

const commentStart = 'console.log(\''
const commentEnd = '\')'

const getCommentsFromFile = (filePath, fileName) => {
  const data = fs.readFileSync(path.join(filePath, fileName), 'utf8')
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
      console.log(`${lineCount}. ${comment}`)
    } else {
      console.log(`#### [${comment}](./../${path.relative('.', filePath)}/${fileName})`)
    }
    lineCount ++
  }
  console.log('')
}

const checkFilesForComments = (filePath) => {
  const files = fs.readdirSync(filePath, { encoding: 'utf8', withFileTypes: true })

  files.sort().forEach((file) => {
    if (!file.isDirectory()) {
      getCommentsFromFile(filePath, file.name)
    } else {
      checkFilesForComments(path.join(filePath, file.name))
    }
  })
}

checkFilesForComments(rootDirectoryPath)