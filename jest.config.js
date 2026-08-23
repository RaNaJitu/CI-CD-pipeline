/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/test"],
  testMatch: ["**/*.test.js"],
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
  collectCoverageFrom: ["src/lib/**/*.js", "src/config/**/*.js", "src/routes/**/*.js"],
  coverageDirectory: "coverage",
};
