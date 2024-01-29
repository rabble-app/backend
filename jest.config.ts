module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  testEnvironment: 'node',
  testRegex: '(/tests/.*|(\\.|/)(e2e-)?spec)\\.(jsx?|tsx?)$',
  coveragePathIgnorePatterns: ['/node_modules/'],
  collectCoverage: true,
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  verbose: true,
  clearMocks: true,
  modulePaths: ['<rootDir>/src'],
  modulePathIgnorePatterns: ['<rootDir>/src/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
