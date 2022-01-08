import {createReadStream, readdirSync, readFile, stat} from 'fs';
import {join, extname} from 'path';
import * as db from 'mime-db';
import {HttpRequest} from '@no0dles/hsr-node';
import {HttpHandler} from '@no0dles/hsr-node';
import {HttpPlugin} from '@no0dles/hsr-node';
import {HttpResponse} from '@no0dles/hsr-node';
import {HttpMiddleware} from '@no0dles/hsr-node/dist/esm';
import {brotliCompress} from 'zlib';

export interface HttpStaticRouterDirectoryOptions {
  rootDir: string;
  recursive?: boolean;
  indexFallback?: boolean;
  exclude?: string[];
  cacheControl?: number;
  optimize?: boolean;
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

interface CacheEntry {
  mimeType: string;
  contentLength: number;
  body: Buffer;
  brotliContentLength: number;
  brotliBody: Buffer;
}

function optimizedHandler(entry: FileEntry, options: HttpStaticRouterDirectoryOptions): HttpHandler<HttpRequest, HttpResponse, {}> {
  const mimeType = getExtension(entry.filename, 'application/octet-stream');
  const cachePromise = new Promise<CacheEntry>((resolve, reject) => {
    readFile(entry.absolutePath, (err, body) => {
      if (err) {
        reject(err);
      } else {
        brotliCompress(body, (err, brotliBody) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              mimeType,
              body,
              contentLength: body.length,
              brotliBody,
              brotliContentLength: brotliBody.length,
            });
          }
        });
      }
    });
  });

  return async (req, res) => {
    const cache = await cachePromise;

    const acceptBrotli = req.hasHeaderValue('accept-encoding', 'br');
    if (acceptBrotli) {
      return res
        .statusCode(200)
        .header('Content-Type', cache.mimeType)
        .header('Content-Length', cache.brotliContentLength.toString())
        .header('Content-Encoding', 'br')
        .body(cache.brotliBody);
    } else {
      return res
        .statusCode(200)
        .header('Content-Type', cache.mimeType)
        .header('Content-Length', cache.contentLength.toString())
        .body(cache.body);
    }
  };
}

function getDynamicHandler(entry: FileEntry, options: HttpStaticRouterDirectoryOptions): HttpHandler<HttpRequest, HttpResponse, {}> {
  const mimeType = getExtension(entry.filename, 'application/octet-stream');
  return (req, res) => {
    return new Promise<HttpResponse>((resolve, reject) => {
      stat(entry.absolutePath, (err, stats) => {
        if (err) {
          reject(err);
        } else {
          resolve(res
            .statusCode(200)
            .header('Content-Type', mimeType)
            .header('Content-Length', stats.size.toString())
            .body(createReadStream(entry.absolutePath)));
        }
      });
    });
  };
}

const cacheControlMiddleware: (cacheControl: number) => HttpMiddleware<HttpRequest, HttpResponse, HttpRequest, HttpResponse> = cacheControl => async (ctx) => {
  const res = await ctx.next(ctx.req, ctx.res);
  if (!res.header('Cache-Control')) {
    res.header('Cache-Control', `max-age=${cacheControl}`);
  }
  return res;
};

export function staticPlugin(options: HttpStaticRouterDirectoryOptions): HttpPlugin<{}> {
  return (router) => {
    const cacheRouter = options.cacheControl !== undefined && options.cacheControl !== null ? router.use(cacheControlMiddleware(options.cacheControl)) : router;

    const entries = readFilesInDirectory(
      options.rootDir,
      options?.recursive ?? false,
      (options?.exclude ?? []).map((ep) => join(options.rootDir, ep)),
      [],
    );

    for (const entry of entries) {
      const handler = options.optimize ? optimizedHandler(entry, options) : getDynamicHandler(entry, options);

      cacheRouter.path(entry.relativePath).get(handler);
      if (entry.filename === 'index.html') {
        if (options.indexFallback) {
          cacheRouter.wildcard().get(handler);
        }
        cacheRouter.path(entry.paths.join('/')).get(handler);
      }
    }
    return cacheRouter;
  };
}

function getExtension(fileName: string, defaultMime: string): string {
  const extension = extname(fileName);
  if (!extension) {
    return defaultMime;
  }
  return mimeTypeByExtension[extension.substr(1)] ?? defaultMime;
}

interface FileEntry {
  paths: string[];
  relativePath: string;
  absolutePath: string;
  filename: string;
}

export function* readFilesInDirectory(
  path: string,
  recursive: boolean,
  exclude: string[],
  currentPath: string[],
): Generator<FileEntry> {
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
