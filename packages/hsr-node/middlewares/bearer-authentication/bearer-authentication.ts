import { HttpRequest } from '../../server/http-request'
import { HttpMiddleware } from '../../server/http-middleware'
import { HttpResponse } from '../../server/http-response'

export interface BearerAuthentication<TPayload> {
  header: {
    alg: string
    typ: 'JWT'
    kid?: string
  }
  payload: TPayload
  signature: string
}

export interface BearerTokenPayload {
  sub: string | undefined | null
  iss: string | undefined | null
  aud: string | string[] | undefined | null
  scope: string | string[] | undefined | null
  jti: string | undefined | null
  iat: number | undefined | null
  exp: number | undefined | null
  nbf: number | undefined | null
}

export interface HttpBearerAuthenticationRequest<TPayload> extends HttpRequest {
  auth: BearerAuthentication<TPayload> | null
}

export interface HttpRequiredBearerAuthenticationRequest<TPayload> extends HttpRequest {
  auth: BearerAuthentication<TPayload>
}

export type HttpBearerAuthenticationMiddleware<TPayload> = HttpMiddleware<
  HttpRequest,
  HttpResponse,
  HttpBearerAuthenticationRequest<TPayload>,
  HttpResponse
>
export type HttpRequiredBearerAuthenticationMiddleware<TPayload> = HttpMiddleware<
  HttpRequest,
  HttpResponse,
  HttpRequiredBearerAuthenticationRequest<TPayload>,
  HttpResponse
>

export interface BearerAuthenticationOptions {
  required: true
}

export function bearerAuthentication<TPayload = BearerTokenPayload>(): HttpBearerAuthenticationMiddleware<TPayload>
export function bearerAuthentication<TPayload = BearerTokenPayload>(
  options: BearerAuthenticationOptions
): HttpRequiredBearerAuthenticationMiddleware<TPayload>
export function bearerAuthentication<TPayload = BearerTokenPayload>(
  options?: BearerAuthenticationOptions
): HttpBearerAuthenticationMiddleware<TPayload> {
  return async (ctx) => {
    const authorizationHeader = ctx.req.header('authorization')
    let auth: BearerAuthentication<TPayload> | null = null
    if (authorizationHeader && typeof authorizationHeader === 'string' && authorizationHeader.startsWith('Bearer ')) {
      const token = authorizationHeader.substr('Bearer '.length)
      const tokenParts = token.split('.')

      if (tokenParts.length !== 3) {
        return ctx.res.statusCode(400).json({ message: 'invalid header format' })
      }

      try {
        auth = {
          header: JSON.parse(Buffer.from(tokenParts[0], 'base64').toString()),
          payload: JSON.parse(Buffer.from(tokenParts[1], 'base64').toString()),
          signature: tokenParts[2],
        }
      } catch (e) {
        return ctx.res.statusCode(400).json({ message: 'invalid header' })
      }
    }

    if (options?.required && !auth) {
      return ctx.res.statusCode(401).json({
        message: 'missing bearer auth',
      })
    }

    const newReq = ctx.req as HttpBearerAuthenticationRequest<TPayload>
    newReq.auth = auth
    return ctx.next(newReq, ctx.res)
  }
}
