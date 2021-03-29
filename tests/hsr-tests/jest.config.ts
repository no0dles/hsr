import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  rootDir: '../..',
  testTimeout: 45000,
  testRegex: 'tests/hsr-tests/.*\\.spec\\.ts$',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage/hsr-tests',
  collectCoverageFrom: [
    '<rootDir>/packages/hsr-browser/**',
    '<rootDir>/packages/hsr-browser-rpc/**',
    '<rootDir>/packages/hsr-node/**',
    '<rootDir>/packages/hsr-node-rpc/**',
    '<rootDir>/packages/hsr-node-static/**',
    '<rootDir>/packages/hsr-node-typescript/**',
  ],
  moduleNameMapper: {
    '^@no0dles/hsr-node/(.*)$': '<rootDir>/packages/hsr-node/$1',
    '^@no0dles/hsr-node-rpc/(.*)$': '<rootDir>/packages/hsr-node-rpc/$1',
    '^@no0dles/hsr-node-typescript/(.*)$': '<rootDir>/packages/hsr-node-typescript/$1',
    '^@no0dles/hsr-node-static/(.*)$': '<rootDir>/packages/hsr-node-static/$1',
    '^@no0dles/hsr-browser/(.*)$': '<rootDir>/packages/hsr-browser/$1',
    '^@no0dles/hsr-browser-rpc/(.*)$': '<rootDir>/packages/hsr-browser-rpc/$1',
  },
  coverageReporters: ['json', 'html', 'lcov'],
  verbose: true,
}

export default config
