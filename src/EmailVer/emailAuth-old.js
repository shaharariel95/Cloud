const http = require('http')
const {verEmail} = require("./Auth")

// const host = process.env.HOST || '0.0.0.0'
const port = process.env.PORT || 3030

const server = http.createServer((req, res) => {
    if (req.method === 'POST') {
        return handlePostReq(req, res)
    }
})


function handlePostReq(req, res) {
    const size = parseInt(req.headers['content-length'], 10)
    const buffer = Buffer.allocUnsafe(size)
    let pos = 0
    let logEr
    req
        .on('data', (chunk) => {
            const offset = pos + chunk.length
            if (offset > size) {
                reject(413, 'Too Large', res)
                return
            }
            // verify email
            logEr = verEmail(chunk)
            console.log(logEr)
            chunk.copy(buffer, pos)
            pos = offset
        })
        .on('end', () => {
            if (pos !== size) {
                reject(400, 'Bad Request', res)
                return
            }
            const data = JSON.parse(buffer.toString())
            console.log('User Posted: ', data)
            res.setHeader('Content-Type', 'application/json;charset=utf-8');
            console.log(logEr)
            res.end('You Posted: ' + JSON.stringify(data))
        })
}

server.listen(port, () => {
    console.log(`Server listening on port ${port}`)
});