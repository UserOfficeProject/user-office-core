module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testEnvironment: 'node',
  testRegex: '(/__tests__/.*|(\\.|/)(spec))\\.[jt]sx?$',
  collectCoverage: true,
  setupFilesAfterEnv: ['<rootDir>/src/config/dependencyConfigTest.ts'],
  setupFiles: ['dotenv/config'],
};
