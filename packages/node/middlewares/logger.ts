import { HttpRequest } from '../http-request'
import { HttpMiddleware } from '../http-middleware'
import { HttpResponse } from '../http-response'

export type LogType = 'debug' | 'info' | 'warn' | 'error'

export interface Log {
  date: Date
  type: LogType
  message: string
}

export interface HttpLoggerRequest extends HttpRequest {
  log(type: LogType, message: string): void
}

export type HttpBodyMiddleware = HttpMiddleware<HttpRequest, HttpResponse, HttpLoggerRequest, HttpResponse>

export function logger(): HttpBodyMiddleware {
  return async (ctx) => {
    const message = `${new Date().toISOString()}: ${ctx.req.method} ${ctx.req.url}`
    const logs: Log[] = []

    const newReq = ctx.req as HttpLoggerRequest
    newReq.log = (type: LogType, message: string) => {
      logs.push({ type, message, date: new Date() })
    }
    console.time(message)
    const res = await ctx.next(newReq, ctx.res)
    console.timeEnd(message)
    for (const log of logs) {
      console.log(`${log.date.toISOString()}  ${log.type}: ${log.message}`)
    }

    return res
  }
}
