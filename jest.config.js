/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  forceExit: true,
  verbose: true,
  // detectOpenHandles: true,
  openHandlesTimeout: 1000,
};
