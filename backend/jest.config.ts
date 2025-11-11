import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  moduleFileExtensions: ["ts", "tsx", "js", "json"],
  collectCoverageFrom: ["src/**/*.ts", "!src/generated/**"],
  coverageDirectory: "coverage",
  clearMocks: true,
};

export default config;
