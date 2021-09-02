const path = require('path');
const fs = require('fs');

const directoryPath = path.join(__dirname, '/../src')

const fileNames = fs.readdirSync(directoryPath, 'utf8')


fileNames.forEach((fileName)=>{
  const data = fs.readFileSync(path.join(directoryPath, fileName), 'utf8')
  const comment = data.substring(
    data.indexOf("/*") + 2, 
    data.lastIndexOf("*/")
  );
  console.log('#### ' + fileName)
  console.log(comment)
})
