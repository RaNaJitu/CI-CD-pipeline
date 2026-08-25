/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/test"],
  testMatch: ["**/*.test.js"],
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/server.js",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "clover"],
};
