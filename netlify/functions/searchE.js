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
    // const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MDc3NjEwNzYsImV4cCI6MTcwNzkzMzg3NiwiYXVkIjoiMjE3LjE1OS4yMTMuMjEwIiwiaXNzIjoiZW1pIiwic3ViIjoiNjVjMzRhZmQ0ODk1MzEzMjRmZjhhNzk0In0.rNvRY336rjR5EMp5dzhJ2QJayb3KP5akl-ckKdzkbrE'

    const url = `https://${ENTU_HOST}/entity?_type.string=repisPerson&limit=5&q=${encodeURIComponent(qs)}`
    const options = {
        method: 'GET',
        headers: {
            'Accept-Encoding': 'deflate',
            'Authorization': `Bearer ${TOKEN}`
        }
    }

    console.log({options, url})
    const response = await fetch(url, options)
    const json = await response.json()
    if (Array.isArray(json.entities) && json.entities.length > 0) {
        console.log({result: 200, hits: json.entities.length, query: qs})
        callback(null, {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            hits: {count:json.entities.length, total: json.count, skip: json.skip, pageSize: json.limit},
            body: json
        })
    } else if (Array.isArray(json.entities) && json.entities.length === 0) {
        console.log({result: 404, hits: 0, query: qs})
        callback(null, {
            statusCode: 404,
            headers: { 'Content-Type': 'application/json' },
            hits: {count:0, total: json.count, skip: json.skip, pageSize: json.limit},
            body: json
        })
    } else {
        console.error('get_token: Invalid json data', json)
        callback(null, {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: body,
            error: 'Invalid json data'
        })
    }
}