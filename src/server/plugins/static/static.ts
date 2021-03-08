import { HttpPlugin } from '../../http-plugin'
import { readdirSync, createReadStream } from 'fs'
import { join } from 'path'

export interface HttpStaticRouter {
  directory(path: string): void
}

export function staticPlugin(): HttpPlugin<HttpStaticRouter> {
  return (router) => {
    return {
      ...router,
      directory: (path: string) => {
        const files = readdirSync(path)
        for (const file of files) {
          router.path(file).get((req) => {
            return req.ok(createReadStream(join(path, file)))
          })

          if (file === 'index.html') {
            router.get((req) => req.ok(createReadStream(join(path, file))))
          }
        }
      },
    }
  }
}
