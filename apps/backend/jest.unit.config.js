module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.js$': ['ts-jest', { diagnostics: false }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!.*(htmlparser2|dom-serializer|domelementtype|domhandler|domutils|entities))',
  ],
  moduleNameMapper: {
    '^@user-office-software/duo-validation/lib/(.*)$':
      '<rootDir>/../../validation/lib/$1',
  },
  testEnvironment: 'node',
  testRegex: '(/__tests__/.*|(\\.|/)(spec))\\.[jt]sx?$',
  collectCoverage: true,
  setupFilesAfterEnv: ['<rootDir>/src/config/dependencyConfigTest.ts'],
  setupFiles: ['dotenv/config'],
  workerIdleMemoryLimit: 0.5,
};
