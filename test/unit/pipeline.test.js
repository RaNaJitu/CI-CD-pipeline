const { pipeline, concepts } = require("../../src/data/pipeline");

describe("pipeline data", () => {
  test("includes DEV, Stage, and Prod entries", () => {
    expect(pipeline.map((p) => p.id)).toEqual(["dev", "stage", "prod"]);
  });

  test("each environment has steps and learn points", () => {
    pipeline.forEach((env) => {
      expect(env.steps.length).toBeGreaterThan(0);
      expect(env.learn.length).toBeGreaterThan(0);
    });
  });

  test("defines CI/CD concept blurbs", () => {
    expect(concepts.ci).toMatch(/Continuous Integration/i);
    expect(concepts.cd).toMatch(/Continuous/i);
    expect(concepts.flow).toMatch(/DEV/i);
  });
});
