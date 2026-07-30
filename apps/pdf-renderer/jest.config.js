module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testEnvironment: 'node',
  testRegex: '(/__tests__/.*|(\\.|/)(spec))\\.[jt]sx?$',
  collectCoverage: true,
  coveragePathIgnorePatterns: ['/node_modules/', '/src/cli.ts'],
  // Typst compilation is CPU bound and the first call loads a native addon.
  testTimeout: 30000,
  workerIdleMemoryLimit: 0.5,
};
