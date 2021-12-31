import { HttpMiddleware } from './http-middleware'
import { HttpHandler } from './http-handler'
import { HttpRequest } from './http-request'
import { HttpResponse } from './http-response'
import { HttpMiddlewareContextImpl } from './http-middleware-context-impl'
import { HttpMethod } from '@no0dles/hsr-browser'

export type PathSegment = { path: string; type: 'path' } | { param: string; type: 'param' } | { type: 'wildcard' }

interface HttpTreeNode {
  childNodes: { [key: string]: HttpTreeNode }
  paramNode: { node: HttpTreeNode; name: string } | null
  wildcardNode: HttpTreeNode | null
  middlewares: HttpMiddleware<any, any, any, any>[]
  handlers: {
    [key: string]: HttpHandler<any, any, any>
  }
}

function newNode(): HttpTreeNode {
  return {
    childNodes: {},
    middlewares: [],
    wildcardNode: null,
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
      } else if (segment.type === 'param') {
        currentNode.paramNode = { node: nextNode, name: segment.param } // TODO check already assigned
        // TODO warn if wildcard node is set
      } else if (segment.type === 'wildcard') {
        currentNode.wildcardNode = nextNode // TODO check if already assigned
        // TODO warn if param node is set
      }
      currentNode = nextNode
    }
    currentNode.middlewares = middlewares
    currentNode.handlers[method] = handler // TODO check already assigned
  }

  private handleMiddlewares(
    depth: number,
    node: HttpTreeNode,
    currentRequest: HttpRequest,
    currentResponse: HttpResponse,
    params: any
  ): Promise<HttpResponse> {
    return new Promise<HttpResponse>(async (resolve, reject) => {
      if (depth < node.middlewares.length) {
        try {
          const result = await node.middlewares[depth](
            new HttpMiddlewareContextImpl(currentRequest, currentResponse, (nextReq, nextRes) => {
              return this.handleMiddlewares(depth + 1, node, nextReq, nextRes, params)
            })
          )
          resolve(result)
        } catch (e) {
          reject(e)
        }
      } else {
        const handler = node.handlers[currentRequest.method]
        if (!handler) {
          resolve(currentResponse.statusCode(404))
        } else {
          resolve(handler(currentRequest, currentResponse, params))
        }
      }
    })
  }

  async handle(request: HttpRequest, response: HttpResponse): Promise<HttpResponse> {
    let currentNode = this.rootNode
    const params: any = {}
    for (const path of request.paths) {
      if (currentNode.childNodes[path]) {
        currentNode = currentNode.childNodes[path]
      } else if (currentNode.paramNode) {
        params[currentNode.paramNode.name] = path
        currentNode = currentNode.paramNode.node
      } else if (currentNode.wildcardNode) {
        currentNode = currentNode.wildcardNode
        break
      } else {
        return response.statusCode(404)
      }
    }

    try {
      return this.handleMiddlewares(0, currentNode, request, response, params)
    } catch (e) {
      console.error(e)
      return response.statusCode(500)
    }
  }
}
