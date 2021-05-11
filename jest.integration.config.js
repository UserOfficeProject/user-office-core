module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testEnvironment: 'node',
  testRegex: '(/__tests__/.*|(\\.|/)(test))\\.[jt]sx?$',
  collectCoverage: true,
  setupFiles: ['dotenv/config'],
  setupFilesAfterEnv: ['<rootDir>/src/config/dependencyConfigTest.ts'],
};
