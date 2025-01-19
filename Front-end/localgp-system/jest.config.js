module.exports = {
  transform: {
    '^.+\\.jsx?$': 'esbuild-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!axios)',
  ],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
};
