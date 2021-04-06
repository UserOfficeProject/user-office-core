module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testEnvironment: 'node',
  collectCoverage: true,
  setupFiles: ['dotenv/config'],
  setupFilesAfterEnv: ['<rootDir>/src/config/dependencyConfigTest.ts'],
};
