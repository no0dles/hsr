import { HttpPlugin } from '../../http-plugin'
import { createReadStream, readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { ModuleKind, ScriptTarget, transpileModule } from 'typescript'

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
          if (file.endsWith('.ts')) {
            router.path(file.substr(0, file.length - 3)).get(async (req) => {
              try {
                const content = readFileSync(join(path, file)).toString()
                const res = await transpileModule(content, {
                  compilerOptions: {
                    target: ScriptTarget.ES2020,
                    module: ModuleKind.ES2015,
                  },
                })

                return {
                  body: res.outputText,
                  headers: {
                    'Content-Type': 'text/javascript'
                  },
                  statusCode: 200,
                }
              } catch (e) {
                console.error(e)
                return req.badRequest()
              }
            })
          }

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
