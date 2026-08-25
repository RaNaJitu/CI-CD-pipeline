const { resolveEnv, getRuntimeEnv, ENV_CONFIG } = require("../../src/config/env");

describe("env config", () => {
  const originalAppEnv = process.env.APP_ENV;
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    if (originalAppEnv === undefined) delete process.env.APP_ENV;
    else process.env.APP_ENV = originalAppEnv;

    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
  });

  test("resolves development aliases", () => {
    expect(resolveEnv("dev").key).toBe("dev");
    expect(resolveEnv("development").short).toBe("DEV");
  });

  test("resolves staging aliases", () => {
    expect(resolveEnv("stage").key).toBe("stage");
    expect(resolveEnv("staging").short).toBe("STAGE");
  });

  test("resolves production aliases", () => {
    expect(resolveEnv("prod").key).toBe("prod");
    expect(resolveEnv("production").short).toBe("PROD");
  });

  test("defaults unknown values to development", () => {
    expect(resolveEnv("unknown")).toEqual(ENV_CONFIG.development);
    expect(resolveEnv(undefined)).toEqual(ENV_CONFIG.development);
  });

  test("getRuntimeEnv prefers APP_ENV", () => {
    process.env.APP_ENV = "staging";
    process.env.NODE_ENV = "production";
    expect(getRuntimeEnv().key).toBe("stage");
  });
});
