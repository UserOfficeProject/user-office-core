module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.js$': ['ts-jest', { diagnostics: false }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!.*(htmlparser2|dom-serializer|domelementtype|domhandler|domutils|entities))',
  ],
  testEnvironment: 'node',
  testRegex: '(/__tests__/.*|(\\.|/)(test))\\.[jt]sx?$',
  collectCoverage: true,
  setupFiles: ['dotenv/config'],
  setupFilesAfterEnv: ['<rootDir>/src/config/dependencyConfigTest.ts'],
};
