/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/test.ts', '<rootDir>/tests/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest'],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/app$': '<rootDir>/src/app/index.ts',
    '^@app$': '<rootDir>/src/app/index.ts',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@schedule/(.*)$': '<rootDir>/src/schedule/$1',
    // avoid shadowing the real npm package import: `@prisma/client.js`
    '^@prisma/(?!client\\.js$)(.*)$': '<rootDir>/src/prisma/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@logger$': '<rootDir>/src/utils/Logger.ts',
  },
}
