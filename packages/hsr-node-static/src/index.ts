import {createReadStream, readdirSync, stat} from 'fs';
import {join, extname} from 'path';
import * as db from 'mime-db';
import {HttpRequest} from '@no0dles/hsr-node';
import {HttpHandler} from '@no0dles/hsr-node';
import {HttpPlugin} from '@no0dles/hsr-node';
import {HttpResponse} from '@no0dles/hsr-node';

export interface HttpStaticRouterDirectoryOptions {
  rootDir: string;
  recursive?: boolean;
  indexFallback?: boolean;
  exclude?: string[];
  cacheControl?: number;
}

const mimeTypeByExtension: { [key: string]: string } = {};

for (const key of Object.keys(db)) {
  const extensions = db[key].extensions;
  if (extensions) {
    for (const extension of extensions) {
      mimeTypeByExtension[extension] = key;
    }
  }
}

export function staticPlugin(options: HttpStaticRouterDirectoryOptions): HttpPlugin<{}> {
  return (router) => {
    const entries = readFilesInDirectory(
      options.rootDir,
      options?.recursive ?? false,
      (options?.exclude ?? []).map((ep) => join(options.rootDir, ep)),
      [],
    );

    for (const entry of entries) {
      const mimeType = getExtension(entry.filename, 'application/octet-stream');
      const handler: HttpHandler<HttpRequest, HttpResponse, {}> = (req, res) => {
        return new Promise<HttpResponse>((resolve, reject) => {

          stat(entry.absolutePath, (err, stats) => {
            if (err) {
              reject(err);
            } else {
              const result = res
                .statusCode(200)
                .header('Content-Type', mimeType)
                .header('Content-Length', stats.size.toString())
                .body(createReadStream(entry.absolutePath));

              if (options.cacheControl !== null && options.cacheControl !== undefined) {
                resolve(result.header('Cache-Control', `max-age=${options.cacheControl}`));
              } else {
                resolve(result);
              }
            }
          });
        });
      };

      router.path(entry.relativePath).get(handler);
      if (entry.filename === 'index.html') {
        if (options.indexFallback) {
          router.wildcard().get(handler);
        }
        router.path(entry.paths.join('/')).get(handler);
      }
    }
    return router;
  };
}

function getExtension(fileName: string, defaultMime: string): string {
  const extension = extname(fileName);
  if (!extension) {
    return defaultMime;
  }
  return mimeTypeByExtension[extension.substr(1)] ?? defaultMime;
}

export function* readFilesInDirectory(
  path: string,
  recursive: boolean,
  exclude: string[],
  currentPath: string[],
): Generator<{ paths: string[]; relativePath: string; absolutePath: string; filename: string }> {
  const entries = readdirSync(path, {withFileTypes: true});
  for (const entry of entries) {
    if (exclude.some((e) => join(path, entry.name) === e)) {
      continue;
    }

    if (entry.isFile()) {
      yield {
        paths: currentPath,
        filename: entry.name,
        relativePath: [...currentPath, entry.name].join('/'),
        absolutePath: join(path, entry.name),
      };
    } else if (recursive && entry.isDirectory()) {
      for (const subEntry of readFilesInDirectory(join(path, entry.name), recursive, exclude, [
        ...currentPath,
        entry.name,
      ])) {
        yield subEntry;
      }
    }
  }
}
