import { CompilerOptions } from 'typescript'

export interface TypescriptPluginOptions {
  compilerOptions?: CompilerOptions
  entryFiles: string[]
  rootDir: string
}
