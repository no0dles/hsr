import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  rootDir: '../..',
  testTimeout: 25000,
  testRegex: 'tests/hsr-tests/.*\\.spec\\.ts$',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage/hsr-tests',
  collectCoverageFrom: [
    '<rootDir>/packages/hsr-browser/**',
    '<rootDir>/packages/hsr-browser-rpc/**',
    '<rootDir>/packages/hsr-node/**',
    '<rootDir>/packages/hsr-node-rpc/**',
    '<rootDir>/packages/hsr-node-typescript/**',
  ],
  coverageReporters: ['json', 'html', 'lcov'],
}

export default config
