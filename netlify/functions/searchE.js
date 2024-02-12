const https = require('https')

const ENTU_HOST      = process.env.ENTU_HOST      || 'api.entu.app'
const ENTU_AUTH_PATH = process.env.ENTU_AUTH_PATH || '/auth?account=emi'
const ENTU_RO_KEY    = 'reader'

const get_token = async () => {
    const url = `https://${ENTU_HOST}${ENTU_AUTH_PATH}`
    const options = {
      method: 'GET',
      headers: {
        'Accept-Encoding': 'deflate',
        'Authorization': `Bearer ${ENTU_RO_KEY}`
      }
    }
    const response = await fetch(url, options)
    const json = await response.json()
    if (Array.isArray(json) && json.length > 0) {
      if (json[0].token) {
        return json[0].token
      } else {
        console.error('no token in json data')
        return null
      }
    } else {
      console.error('get_token: Invalid json data')
      return null
    }
}

exports.handler = async (event, context, callback) => {
    const qs = event.body
    console.log({qs})
    // const TOKEN = await get_token()
    const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MDc3Mzg3MDYsImV4cCI6MTcwNzkxMTUwNiwiYXVkIjoiMjE3LjE1OS4yMTMuMjEwIiwiaXNzIjoiZW1pIiwic3ViIjoiNjVjMzRhZmRiNTM0ZTJlMWQwMmVjYTM2In0.yam2S_BhoQu-ack5SCjxWMnQYB0r8GsrGFQXhpYZA5Y'
    const options = {
        hostname: ENTU_HOST,
        path: '/entity?_type.string=victim?q=' + event.body,
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json'
        }
    }
    console.log({options})
    const request = https.request(options, response => {
        var body = ''

        response.on('data', function (d) {
            body += d
        })

        response.on('end', function () {
            console.log({body})
            callback(null, {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: body
            })
        })
    })

    request.on('error', function () {
        callback(null, {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: body
        })
    })

    request.write(event.body)
    request.end()
}