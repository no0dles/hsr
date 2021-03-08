import { HttpMiddleware } from './http-middleware'
import { HttpHandler } from './http-handler'
import { HttpMethod } from '../browser/http-method'
import { HttpRequest } from './http-request'
import { HttpResponse } from './http-response'
import { HttpMiddlewareContextImpl } from './http-middleware-context-impl'

export type PathSegment = { path: string; type: 'path' } | { param: string; type: 'param' }

interface HttpTreeNode {
  childNodes: { [key: string]: HttpTreeNode }
  paramNode: { node: HttpTreeNode; name: string } | null
  middlewares: HttpMiddleware<any, any, any, any>[]
  handlers: {
    [key: string]: HttpHandler<any, any, any>
  }
}

function newNode(): HttpTreeNode {
  return {
    childNodes: {},
    middlewares: [],
    handlers: {},
    paramNode: null,
  }
}

export class HttpTree {
  private rootNode: HttpTreeNode = newNode()

  register(
    segments: PathSegment[],
    method: HttpMethod,
    handler: HttpHandler<any, any, any>,
    middlewares: HttpMiddleware<any, any, any, any>[]
  ) {
    let currentNode = this.rootNode
    for (const segment of segments) {
      let nextNode = newNode()
      if (segment.type === 'path') {
        if (currentNode.childNodes[segment.path]) {
          nextNode = currentNode.childNodes[segment.path]
        } else {
          currentNode.childNodes[segment.path] = nextNode
        }
      } else {
        currentNode.paramNode = { node: nextNode, name: segment.param } // TODO check
      }
      currentNode = nextNode
    }
    currentNode.middlewares = middlewares
    currentNode.handlers[method] = handler // TODO check
  }

  private handleMiddlewares(
    depth: number,
    node: HttpTreeNode,
    currentRequest: HttpRequest,
    params: any
  ): Promise<HttpResponse> {
    return new Promise<HttpResponse>(async (resolve, reject) => {
      if (depth < node.middlewares.length) {
        try {
          const result = await node.middlewares[depth](
            new HttpMiddlewareContextImpl(currentRequest, (nextReq) => {
              return this.handleMiddlewares(depth + 1, node, nextReq, params)
            })
          )
          resolve(result)
        } catch (e) {
          reject(e)
        }
      } else {
        const handler = node.handlers[currentRequest.method]
        if (!handler) {
          resolve({
            statusCode: 404,
          })
        } else {
          resolve(handler(currentRequest, params))
        }
      }
    })
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    let currentNode = this.rootNode
    const params: any = {}
    for (const path of request.paths) {
      if (currentNode.childNodes[path]) {
        currentNode = currentNode.childNodes[path]
      } else if (currentNode.paramNode) {
        params[currentNode.paramNode.name] = path
        currentNode = currentNode.paramNode.node
      } else {
        return {
          statusCode: 404,
        }
      }
    }

    try {
      return this.handleMiddlewares(0, currentNode, request, params)
    } catch (e) {
      console.error(e)
      return {
        statusCode: 500,
      }
    }
  }
}
