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
    console.log({body: event.body, qs: event.qs})
    const options = {
        hostname: ENTU_HOST,
        path: '/entity?_type.string=victim?' + event.qs,
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + await get_token(),
            'Content-Type': 'application/json'
        }
    }

    const request = https.request(options, response => {
        var body = ''

        response.on('data', function (d) {
            body += d
        })

        response.on('end', function () {
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