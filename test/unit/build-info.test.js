const { loadBuildInfo } = require("../../src/config/build-info");

describe("build-info", () => {
  test("returns local defaults when no build-info.json is present", () => {
    const info = loadBuildInfo();
    expect(info).toHaveProperty("version");
    expect(info).toHaveProperty("gitSha");
    expect(info).toHaveProperty("buildNumber");
    expect(info).toHaveProperty("artifactName");
  });
});
