import { createServer, Server } from 'http'
import { HttpRequestImpl } from './http-request-impl'
import { HttpRouter } from './http-router'
import { Readable } from 'stream'
import { HttpResponseImpl } from './http-response-impl'

export function getServer(app: HttpRouter<any, any, any>): Server {
  return createServer(async (req, res) => {
    try {
      const request = new HttpRequestImpl(req)
      const baseResponse = new HttpResponseImpl()
      const response = await app.handle(request, baseResponse)
      res.writeHead(response.statusCode(), response.headers())
      const body = response.body()
      if (body) {
        if (body instanceof Readable) {
          await new Promise<void>((resolve, reject) => {
            body
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
          res.write(body)
        }
      }
      res.end()
    } catch (e) {
      console.error(e)
      res.writeHead(500)
      res.end()
    }
  })
}
