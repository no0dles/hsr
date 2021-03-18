import { HttpPlugin } from '../../http-plugin'
import { readFileSync } from 'fs'
import { CompilerOptions, ModuleKind, ScriptTarget, transpileModule } from 'typescript'
import { readFilesInDirectory } from '../static/static'
import { join } from 'path'
import { HttpRouter } from '../../http-router'
import { HttpRequest } from '../../http-request'
import { HttpResponse } from '../../http-response'

export interface TypescriptPluginOptions {
  compilerOptions?: CompilerOptions
  rootDir: string
  recursive?: boolean
  exclude?: string[]
}

export function typescriptPlugin(options: TypescriptPluginOptions): HttpPlugin<{}> {
  return (router) => {
    const entries = readFilesInDirectory(options.rootDir, options?.recursive ?? false, (options?.exclude ?? []).map(ep => join(options.rootDir, ep)), [])
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
        entry.relativePath.substr(0, entry.relativePath.length - 3) + '.js',
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
    return router
  }
}
