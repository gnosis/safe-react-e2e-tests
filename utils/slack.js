import https from 'https'

export async function sendSlackMessage(url, apps) {
  const groupByDescription = apps.reduce((acc, { title, description }) => {
    if (acc[description]) {
      acc[description] = `${acc[description]},${title}`
    } else {
      acc[description] = title
    }

    return acc
  }, {})

  let formattedText = ''

  Object.keys(groupByDescription).forEach((description) => {
    formattedText = `${formattedText} - *${description}*: ${groupByDescription[description]}\n`
  })

  const data = {
    channel: '#test-incomming-webhooks',
    username: 'Safe Apps  Bot',
    text: apps.length
      ? `Heads up! there are some safe apps not loading properly:\n${formattedText}`
      : 'All safe apps seems to be working fine',
    icon_emoji: apps.length ? ':cry' : ':ghost',
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

  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      if (res.statusCode < 200 || res.statusCode > 299) {
        return reject(new Error(`HTTP status code ${res.statusCode}`))
      }

      const body = []
      res.on('data', (chunk) => body.push(chunk))
      res.on('end', () => {
        const resString = Buffer.concat(body).toString()
        resolve(resString)
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
