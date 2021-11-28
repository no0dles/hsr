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
    '<rootDir>/packages/hsr-browser/src/**',
    '<rootDir>/packages/hsr-browser-rpc/src/**',
    '<rootDir>/packages/hsr-node/src/**',
    '<rootDir>/packages/hsr-node-rpc/src/**',
    '<rootDir>/packages/hsr-node-static/src/**',
  ],
  moduleNameMapper: {
    '^@no0dles/hsr-node/(.*)$': '<rootDir>/packages/hsr-node/src/$1',
    '^@no0dles/hsr-node-rpc/(.*)$': '<rootDir>/packages/hsr-node-rpc/src/$1',
    '^@no0dles/hsr-node-static/(.*)$': '<rootDir>/packages/hsr-node-static/src/$1',
    '^@no0dles/hsr-browser/(.*)$': '<rootDir>/packages/hsr-browser/src/$1',
    '^@no0dles/hsr-browser-rpc/(.*)$': '<rootDir>/packages/hsr-browser-rpc/src/$1',
  },
  coverageReporters: ['json', 'html', 'lcov'],
  verbose: true,
}

export default config
