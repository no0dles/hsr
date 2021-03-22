import { HttpPlugin } from '../hsr-node/server/http-plugin'
import { createReadStream, readdirSync } from 'fs'
import { join, extname } from 'path'
import * as db from 'mime-db'

export interface HttpStaticRouterDirectoryOptions {
  rootDir: string
  recursive?: boolean
  exclude?: string[]
}

const mimeTypeByExtension: { [key: string]: string } = {}

for (const key of Object.keys(db)) {
  const extensions = db[key].extensions
  if (extensions) {
    for (const extension of extensions) {
      mimeTypeByExtension[extension] = key
    }
  }
}

export function staticPlugin(options: HttpStaticRouterDirectoryOptions): HttpPlugin<{}> {
  return (router) => {
    const entries = readFilesInDirectory(
      options.rootDir,
      options?.recursive ?? false,
      (options?.exclude ?? []).map((ep) => join(options.rootDir, ep)),
      []
    )

    for (const entry of entries) {
      const mimeType = getExtension(entry.filename, 'application/octet-stream')
      router.path(entry.relativePath).get((req, res) => {
        return res.statusCode(200).header('content-type', mimeType).body(createReadStream(entry.absolutePath))
      })

      if (entry.filename === 'index.html') {
        router
          .path(entry.paths.join('/'))
          .get((req, res) =>
            res.statusCode(200).header('content-type', mimeType).body(createReadStream(entry.absolutePath))
          )
      }
    }
    return router
  }
}

function getExtension(fileName: string, defaultMime: string): string {
  const extension = extname(fileName)
  if (!extension) {
    return defaultMime
  }
  return mimeTypeByExtension[extension.substr(1)] ?? defaultMime
}

export function* readFilesInDirectory(
  path: string,
  recursive: boolean,
  exclude: string[],
  currentPath: string[]
): Generator<{ paths: string[]; relativePath: string; absolutePath: string; filename: string }> {
  const entries = readdirSync(path, { withFileTypes: true })
  for (const entry of entries) {
    if (exclude.some((e) => join(path, entry.name) === e)) {
      continue
    }

    if (entry.isFile()) {
      yield {
        paths: currentPath,
        filename: entry.name,
        relativePath: [...currentPath, entry.name].join('/'),
        absolutePath: join(path, entry.name),
      }
    } else if (recursive && entry.isDirectory()) {
      for (const subEntry of readFilesInDirectory(join(path, entry.name), recursive, exclude, [
        ...currentPath,
        entry.name,
      ])) {
        yield subEntry
      }
    }
  }
}
