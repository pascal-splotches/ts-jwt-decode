const getTestMatch = (name) =>
  ['**/+([a-zA-Z])', name, '(spec|test).ts?(x)'].filter(Boolean).join('.');

const common = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.jest.json',
    },
  },
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],
  moduleFileExtensions: ['ts', 'js'],
  displayName: {
    name: 'Web',
    color: 'cyan',
  },
  testMatch: [getTestMatch()],
};

module.exports = {
  projects: [common],
};
