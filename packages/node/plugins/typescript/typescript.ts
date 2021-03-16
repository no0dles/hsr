import { HttpPlugin } from '../../http-plugin'
import { readFileSync } from 'fs'
import { CompilerOptions, ModuleKind, ScriptTarget, transpileModule } from 'typescript'
import { readFilesInDirectory } from '../static/static'

export interface HttpTypescriptRouter {
  compileDirectory(path: string): void
}

export interface TypescriptPluginOptions {
  compilerOptions?: CompilerOptions
  recursive?: boolean
}

export function typescriptPlugin(options?: TypescriptPluginOptions): HttpPlugin<HttpTypescriptRouter> {
  return (router) => {
    return {
      ...router,
      compileDirectory: (path: string) => {
        const entries = readFilesInDirectory(path, options?.recursive ?? false, [])
        for (const entry of entries) {
          if (!entry.filename.endsWith('.ts')) {
            continue
          }

          const content = readFileSync(entry.absolutePath).toString()
          const transpileResult = transpileModule(content, {
            compilerOptions: options?.compilerOptions ?? {
              target: ScriptTarget.ES2020,
              module: ModuleKind.ES2015,
            },
          })
          const requestPaths = [
            entry.relativePath,
            entry.relativePath.substr(0, entry.relativePath.length - 3),
          ]

          for (const requestPath of requestPaths) {
            router.path(requestPath).get(async (req, res) => {
              try {
                return res.statusCode(200).header('Content-Type', 'text/javascript').body(transpileResult.outputText)
              } catch (e) {
                console.error(e)
                return res.statusCode(400)
              }
            })
          }
        }
      },
    }
  }
}
