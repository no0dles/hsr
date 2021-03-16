import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testTimeout: 25000,
  testRegex: 'packages/.*.spec.ts',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage/',
  collectCoverageFrom: ['packages/**', '!dist/**', '!coverage/**', '!packages/**/*.spec.ts'],
  coverageReporters: ['json', 'html', 'lcov'],
}

export default config
