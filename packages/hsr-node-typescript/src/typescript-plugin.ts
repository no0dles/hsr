import { readFileSync } from 'fs'
import {
  ModuleKind,
  ScriptTarget,
  transpileModule,
  createSourceFile,
  SourceFile,
  CompilerOptions,
  SyntaxKind,
  ImportDeclaration,
  StringLiteral,
} from 'typescript'
import { TypescriptPluginOptions } from './typescript-plugin-options'
import * as path from 'path'
import * as fs from 'fs'
import { HttpPlugin } from '@no0dles/hsr-node/server/http-plugin'

interface TypescriptEntry {
  sourceFile: SourceFile
  compiledFile: string
  compiledSourceMap: string | undefined
}

function addEntry(
  entries: { [key: string]: TypescriptEntry },
  fileName: string,
  target: ScriptTarget,
  compilerOptions: CompilerOptions
) {
  if (entries[fileName]) {
    return
  }

  const content = readFileSync(fileName).toString()
  const sourceFile = createSourceFile(fileName, content, target)
  const compiledFile = transpileModule(content, {
    compilerOptions,
  })
  entries[fileName] = {
    compiledFile: compiledFile.outputText,
    compiledSourceMap: compiledFile.sourceMapText,
    sourceFile,
  }

  for (const statement of sourceFile.statements) {
    if (statement.kind === SyntaxKind.ImportDeclaration) {
      const importDeclaration = statement as ImportDeclaration
      const moduleSpecifier = (importDeclaration.moduleSpecifier as StringLiteral).text
      if (moduleSpecifier.startsWith('.')) {
        const importPath = getPath(path.join(path.dirname(fileName), moduleSpecifier))
        if (importPath) {
          addEntry(entries, importPath, target, compilerOptions)
        }
      } else {
        let pathParts = path.dirname(fileName).split(path.sep)
        for (let i = pathParts.length - 1; i >= 0; i--) {
          const nodeModulePath = path.join(pathParts.slice(0, i).join(path.sep), 'node_modules', moduleSpecifier)
          const importPath = getPath(nodeModulePath)
          if (importPath) {
            addEntry(entries, importPath, target, compilerOptions)
          }
        }
      }
    }
  }
}

function getPath(importPath: string) {
  const importPaths = [
    path.join(importPath, 'index.ts'),
    path.join(importPath, 'index.d.ts'),
    importPath + '.ts',
    importPath + '.d.ts',
  ]
  for (const impPath of importPaths) {
    if (fs.existsSync(impPath)) {
      return impPath
    }
  }
  return null
}

export function typescriptPlugin(options: TypescriptPluginOptions): HttpPlugin<{}> {
  return (router) => {
    const target = options?.compilerOptions?.target ?? ScriptTarget.ES2020
    const entries: { [key: string]: TypescriptEntry } = {}
    const compilerOptions: CompilerOptions = options?.compilerOptions ?? {
      target: ScriptTarget.ES2020,
      module: ModuleKind.ES2015,
    }

    for (const entryFile of options.entryFiles) {
      addEntry(entries, entryFile, target, compilerOptions)
    }

    for (const fileName of Object.keys(entries)) {
      const relativePath = path.relative(options.rootDir, fileName)

      const requestPaths = [
        relativePath.substr(0, relativePath.length - 3) + '.js',
        relativePath.substr(0, relativePath.length - 3),
      ]
      if (relativePath.endsWith('index.ts')) {
        const parts = relativePath.split('/')
        router.path(relativePath.substr(0, relativePath.length - 'index.ts'.length)).get(async (req, res) => {
          return res.statusCode(301).header('location', parts[parts.length - 2] + '/index')
        })
      }

      for (const requestPath of requestPaths) {
        router.path(requestPath).get(async (req, res) => {
          try {
            return res.statusCode(200).header('Content-Type', 'text/javascript').body(entries[fileName].compiledFile)
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
