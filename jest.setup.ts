// Matchers such as `toBeOnTheScreen` are provided by
// `@testing-library/react-native` in current versions.

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
