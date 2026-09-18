module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['<rootDir>/__tests__/helpers/'],
};
