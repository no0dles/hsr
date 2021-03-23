import { HttpRequest } from './http-request'
import { HttpHandler } from './http-handler'
import { HttpMiddleware } from './http-middleware'
import { HttpResponse } from './http-response'
import { HttpRouter } from './http-router'
import { HttpPlugin } from './http-plugin'
import { HttpTree, PathSegment } from './http-tree'

export class HttpRouterImpl implements HttpRouter<any, any, any> {
  constructor(
    private tree: HttpTree,
    private pathSegments: PathSegment[],
    private middlewares: HttpMiddleware<any, any, any, any>[]
  ) {}

  use<TNewReq extends HttpRequest, TNewRes>(
    middlewareOrPath: HttpMiddleware<any, any, any, any>
  ): HttpRouter<TNewReq, TNewRes, any> {
    return new HttpRouterImpl(this.tree, [...this.pathSegments], [...this.middlewares, middlewareOrPath])
  }

  private getPathSegment(path: string) {
    const paths: PathSegment[] = path
      .split('/')
      .filter((s) => !!s)
      .map((s) => ({ path: s, type: 'path' }))
    return [...this.pathSegments, ...paths]
  }

  wildcard(): HttpRouter<any, any, any> {
    return new HttpRouterImpl(
      this.tree,
      [
        ...this.pathSegments,
        {
          type: 'wildcard',
        },
      ],
      [...this.middlewares]
    )
  }

  param<K>(name: keyof K): HttpRouter<any, any, any> {
    return new HttpRouterImpl(
      this.tree,
      [
        ...this.pathSegments,
        {
          param: name.toString(),
          type: 'param',
        },
      ],
      [...this.middlewares]
    )
  }

  path(path: string): HttpRouter<any, any, any> {
    const segments = this.getPathSegment(path)
    if (segments.length === 0) {
      return this
    }
    return new HttpRouterImpl(this.tree, segments, [...this.middlewares])
  }

  delete(handler: HttpHandler<any, any, any>): void {
    this.tree.register(this.pathSegments, 'DELETE', handler, this.middlewares)
  }

  get(handler: HttpHandler<any, any, any>): void {
    this.tree.register(this.pathSegments, 'GET', handler, this.middlewares)
  }

  options(handler: HttpHandler<any, any, any>): void {
    this.tree.register(this.pathSegments, 'OPTIONS', handler, this.middlewares)
  }

  post(handler: HttpHandler<any, any, any>): void {
    this.tree.register(this.pathSegments, 'POST', handler, this.middlewares)
  }

  put(handler: HttpHandler<any, any, any>): void {
    this.tree.register(this.pathSegments, 'PUT', handler, this.middlewares)
  }

  async handle(request: HttpRequest, response: HttpResponse): Promise<HttpResponse> {
    return this.tree.handle(request, response)
  }

  plugin<TRouter>(plugin: HttpPlugin<TRouter>): TRouter & HttpRouter<any, any, any> {
    return plugin(this) as any
  }
}
