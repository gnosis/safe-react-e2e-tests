import https from 'https'

const SUCCESS_MESSAGE = 'All safe apps seems to be working fine'
const WARNING_MESSAGE = 'Heads up! there are some safe apps not loading properly:'

const groupByDescription = (apps) =>
  apps.reduce((acc, { title, description }) => {
    if (acc[description]) {
      acc[description] = `${acc[description]},${title}`
    } else {
      acc[description] = title
    }

    return acc
  }, {})

const getFormattedText = (apps) => {
  let text = ''

  Object.keys(apps).forEach((description) => {
    text = `${text} - *${description}*: ${apps[description]}\n`
  })

  return text
}

export async function sendSlackMessage(url, apps) {
  const formattedText = getFormattedText(groupByDescription(apps))
  const data = {
    text: apps.length ? `${WARNING_MESSAGE}\n${formattedText}` : SUCCESS_MESSAGE,
  }
  const dataString = JSON.stringify(data)
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': dataString.length,
    },
    timeout: 1000,
  }

  console.log('Test Results (forwarded to slack):', formattedText)

  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      if (res.statusCode < 200 || res.statusCode > 299) {
        return reject(new Error(`HTTP status code ${res.statusCode}`))
      }

      const body = []
      res.on('data', (chunk) => body.push(chunk))
      res.on('end', () => {
        resolve(formattedText)
      })
    })

    req.on('error', (err) => {
      reject(err)
    })

    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Request time out'))
    })

    req.write(dataString)
    req.end()
  })
}
