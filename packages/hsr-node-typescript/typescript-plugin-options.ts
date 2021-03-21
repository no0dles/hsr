import { CompilerOptions } from 'typescript'

export interface TypescriptPluginOptions {
  compilerOptions?: CompilerOptions
  rootDir: string
  recursive?: boolean
  exclude?: string[]
}
