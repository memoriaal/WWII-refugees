const https = require('https')


exports.handler = (event, context, callback) => {
    const options = {
        hostname: 'd3869450b84047e98abb54ff625681cc.eu-central-1.aws.cloud.es.io',
        port: 9243,
        path: '/emem_persons/_search',
        method: 'GET',
        headers: {
            'Authorization': 'Basic cmVhZGVyODpyZWFkb25seQo=',
            'Content-Type': 'application/json'
        }
    }

    const request = https.request(options, response => {
        var body = ''

        response.on('data', function (d) {
            body += d
        })

        response.on('end', function () {
            console.log('response', body)
            callback(null, {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: body
            })
        })

        response.on('error', function (e) {
            console.log('error', e, 'body', body)
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
