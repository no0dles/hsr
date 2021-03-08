import { createServer, Server } from 'http'
import { HttpRequestImpl } from './http-request-impl'
import { HttpRouter } from './http-router'
import { Readable } from 'stream'

export function getServer(app: HttpRouter<any, any, any>): Server {
  return createServer(async (req, res) => {
    try {
      const request = new HttpRequestImpl(req)
      const response = await app.handle(request)
      res.writeHead(response.statusCode, response.headers)
      if (response.body) {
        if (response.body instanceof Readable) {
          const stream = response.body
          await new Promise<void>((resolve, reject) => {
            stream
              .on('data', (chunk) => {
                res.write(chunk)
              })
              .on('end', () => {
                resolve()
              })
              .on('error', (err) => {
                reject(err)
              })
          })
        } else {
          res.write(response.body)
        }
      }
      res.end()
    } catch (e) {
      console.error(e)
      res.writeHead(500)
    }
  })
}
