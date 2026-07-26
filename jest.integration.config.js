module.exports = {
    preset: "jest-expo",
    testEnvironment: "node",
    testMatch: ["<rootDir>/src/integration-tests/**/*.integration.test.ts"],
    maxWorkers: 1,
    testTimeout: 30000,
}