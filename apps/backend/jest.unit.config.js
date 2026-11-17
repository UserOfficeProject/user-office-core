module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(?:.*/node_modules/)?(?:@faker-js/faker|htmlparser2|domhandler|dom-serializer|domutils|domelementtype|entities)/)',
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
