import { HttpPlugin } from '../../http-plugin'
import { createReadStream, readdirSync } from 'fs'
import { join } from 'path'

export interface HttpStaticRouter {
  directory(path: string, options?: HttpStaticRouterDirectoryOptions): void
}

export interface HttpStaticRouterDirectoryOptions {
  recursive: boolean
}

export function staticPlugin(): HttpPlugin<HttpStaticRouter> {
  return (router) => {
    return {
      ...router,
      directory: (path: string, options?: HttpStaticRouterDirectoryOptions) => {
        const entries = readFilesInDirectory(path, options?.recursive ?? false, [])
        for (const entry of entries) {
          router.path(entry.relativePath).get((req, res) => {
            return res.statusCode(200).body(createReadStream(entry.absolutePath))
          })

          if (entry.filename === 'index.html') {
            router.path(entry.paths.join('/')).get((req, res) => res.statusCode(200).body(createReadStream(entry.absolutePath)))
          }
        }
      },
    }
  }
}

export function* readFilesInDirectory(path: string, recursive: boolean, currentPath: string[]): Generator<{ paths: string[], relativePath: string, absolutePath: string, filename: string }> {
  const entries = readdirSync(path, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.isFile()) {
      yield {
        paths: currentPath,
        filename: entry.name,
        relativePath: [...currentPath, entry.name].join('/'),
        absolutePath: join(path, entry.name),
      }
    } else if (recursive) {
      for (const subEntry of readFilesInDirectory(join(path, entry.name), recursive, [...currentPath, entry.name])) {
        yield subEntry
      }
    }
  }
}
