module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
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
