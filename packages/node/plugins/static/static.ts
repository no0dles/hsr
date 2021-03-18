import { HttpPlugin } from '../../http-plugin'
import { createReadStream, readdirSync } from 'fs'
import { join } from 'path'

export interface HttpStaticRouterDirectoryOptions {
  rootDir: string
  recursive?: boolean
  exclude?: string[]
}

export function staticPlugin(options: HttpStaticRouterDirectoryOptions): HttpPlugin<{ }> {
  return (router) => {
    const entries = readFilesInDirectory(options.rootDir, options?.recursive ?? false, (options?.exclude ?? []).map(ep => join(options.rootDir, ep)), [])
    for (const entry of entries) {
      router.path(entry.relativePath).get((req, res) => {
        return res.statusCode(200).body(createReadStream(entry.absolutePath))
      })

      if (entry.filename === 'index.html') {
        router.path(entry.paths.join('/')).get((req, res) => res.statusCode(200).body(createReadStream(entry.absolutePath)))
      }
    }
    return router
  }
}

export function* readFilesInDirectory(path: string, recursive: boolean, exclude: string[], currentPath: string[]): Generator<{ paths: string[], relativePath: string, absolutePath: string, filename: string }> {
  const entries = readdirSync(path, { withFileTypes: true })
  for (const entry of entries) {
    if (exclude.some(e => join(path, entry.name) === e)) {
      continue
    }

    if (entry.isFile()) {
      yield {
        paths: currentPath,
        filename: entry.name,
        relativePath: [...currentPath, entry.name].join('/'),
        absolutePath: join(path, entry.name),
      }
    } else if (recursive) {
      for (const subEntry of readFilesInDirectory(join(path, entry.name), recursive, exclude, [...currentPath, entry.name])) {
        yield subEntry
      }
    }
  }
}
