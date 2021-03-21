import { HttpPlugin } from '../hsr-node/server/http-plugin'
import { readFilesInDirectory } from '../hsr-node/plugins/static/static'
import { join } from 'path'
import { readFileSync } from 'fs'
import { ModuleKind, ScriptTarget, transpileModule } from 'typescript'
import { TypescriptPluginOptions } from './typescript-plugin-options'

export function typescriptPlugin(options: TypescriptPluginOptions): HttpPlugin<{}> {
  return (router) => {
    const entries = readFilesInDirectory(
      options.rootDir,
      options?.recursive ?? false,
      (options?.exclude ?? []).map((ep) => join(options.rootDir, ep)),
      [],
    )
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
      if (entry.relativePath.endsWith('index.ts')) {
        const parts = entry.relativePath.split('/')
        router
          .path(entry.relativePath.substr(0, entry.relativePath.length - 'index.ts'.length))
          .get(async (req, res) => {
            return res.statusCode(301).header('location', parts[parts.length - 2] + '/index')
          })
      }

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
