import { createServer as createHttpServer, RequestListener, Server as httpServer } from 'http'
import { createServer as createHttpsServer, Server as httpsServer, ServerOptions } from 'https'
import { HttpRequestImpl } from './http-request-impl'
import { HttpRouter } from './http-router'
import { Readable } from 'stream'
import { HttpResponseImpl } from './http-response-impl'

export function listenHttp(app: HttpRouter<any, any, any>, port?: number): Promise<httpServer> {
  const server = createHttpServer(getRequestListener(app))
  return new Promise<httpServer>((resolve, reject) => {
    server.on('error', (err) => reject(err))
    server.listen(port ?? 0, () => {
      resolve(server)
    })
  })
}

export function listenHttps(
  app: HttpRouter<any, any, any>,
  options: ServerOptions,
  port?: number
): Promise<httpsServer> {
  const server = createHttpsServer(options, getRequestListener(app))
  return new Promise<httpsServer>((resolve, reject) => {
    server.on('error', (err) => reject(err))
    server.listen(port ?? 0, () => {
      resolve(server)
    })
  })
}

export function getRequestListener(app: HttpRouter<any, any, any>): RequestListener {
  return async (req, res) => {
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
  }
}
