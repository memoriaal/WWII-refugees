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
    const TOKEN = await get_token()
    // const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MDc3Mzg3MDYsImV4cCI6MTcwNzkxMTUwNiwiYXVkIjoiMjE3LjE1OS4yMTMuMjEwIiwiaXNzIjoiZW1pIiwic3ViIjoiNjVjMzRhZmRiNTM0ZTJlMWQwMmVjYTM2In0.yam2S_BhoQu-ack5SCjxWMnQYB0r8GsrGFQXhpYZA5Y'

    const url = `https://${ENTU_HOST}/entity?_type.string=victim&limit=5&q=${encodeURIComponent(event.body)}`
    const options = {
      method: 'GET',
      headers: {
        'Accept-Encoding': 'deflate',
        'Authorization': `Bearer ${TOKEN}`
      }
    }

    console.log({options})
    const response = await fetch(url, options)
    const json = await response.json()
    if (Array.isArray(json) && json.length > 0) {
      return json
    } else {
      console.error('get_token: Invalid json data', json)
      return null
    }
}