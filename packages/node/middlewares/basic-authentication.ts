import { HttpRequest } from '../http-request'
import { HttpMiddleware } from '../http-middleware'
import { HttpResponse } from '../http-response'

export interface HttpBasicAuthenticationRequest extends HttpRequest {
  auth: BasicAuthenticationUser | null
}

export interface HttpRequiredBasicAuthenticationRequest extends HttpRequest {
  auth: BasicAuthenticationUser
}

export interface BasicAuthenticationUser {
  username: string
  password: string
}

export type HttpBasicAuthenticationMiddleware = HttpMiddleware<
  HttpRequest,
  HttpResponse,
  HttpBasicAuthenticationRequest,
  HttpResponse
>

export type HttpRequiredBasicAuthenticationMiddleware = HttpMiddleware<
  HttpRequest,
  HttpResponse,
  HttpRequiredBasicAuthenticationRequest,
  HttpResponse
>

export interface BasicAuthenticationOptions {
  required: true
}

export function basicAuthentication(): HttpBasicAuthenticationMiddleware
export function basicAuthentication(options: BasicAuthenticationOptions): HttpRequiredBasicAuthenticationMiddleware
export function basicAuthentication(options?: BasicAuthenticationOptions): HttpBasicAuthenticationMiddleware {
  return (ctx) => {
    let auth: BasicAuthenticationUser | null = null

    const authorizationHeader = ctx.req.header('authorization')
    if (authorizationHeader && typeof authorizationHeader === 'string' && authorizationHeader.startsWith('Basic ')) {
      const credentials = Buffer.from(authorizationHeader.substr('Basic '.length), 'base64').toString()
      const [username, password] = credentials.split(':')
      auth = {
        username,
        password,
      }
    }

    if (options?.required && !auth) {
      return ctx.req.unauthorized({
        message: 'missing basic auth',
      })
    }

    if (auth && (!auth.password || !auth.username)) {
      return ctx.req.badRequest({
        message: 'invalid basic auth',
      })
    }

    const newReq = ctx.req as HttpBasicAuthenticationRequest
    newReq.auth = auth
    return ctx.next(newReq)
  }
}
