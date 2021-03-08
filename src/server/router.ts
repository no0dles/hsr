import { HttpRouterImpl } from './http-router-impl'
import { HttpRequest } from './http-request'
import { HttpResponse } from './http-response'
import { HttpRouter } from './http-router'
import { HttpTree } from './http-tree'

export function router(): HttpRouter<HttpRequest, HttpResponse, {}> {
  return new HttpRouterImpl(new HttpTree(), [], [])
}
