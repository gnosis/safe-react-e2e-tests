const path = require('path');
const fs = require('fs');

const directoryPath = path.join(__dirname, '/../src')

const fileNames = fs.readdirSync(directoryPath, 'utf8')


function addStr(str, index, stringToAdd){
  return str.substring(0, index) + stringToAdd + str.substring(index, str.length);
}

fileNames.forEach((fileName)=>{
  const data = fs.readFileSync(path.join(directoryPath, fileName), 'utf8')
  let comment = data.substring(
    data.indexOf("/*") + 2, 
    data.lastIndexOf("*/")
  );
  let lineCount = 1
  while (comment.indexOf('--') > 0) {
    comment = addStr(comment, comment.indexOf('--')-2, `\\\n${lineCount}.`)
    comment = comment.replace('--', '')
    lineCount ++
  }
  console.log('#### ' + fileName)
  console.log(comment)
})
