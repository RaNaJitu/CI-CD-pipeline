const { ENV_CONFIG } = require("../config/env");

const pipeline = [
  {
    id: "dev",
    ...ENV_CONFIG.development,
    steps: [
      "Write & commit code",
      "Run unit tests",
      "Lint & static analysis",
      "Build artifacts",
    ],
    learn: [
      "CI triggers on every push or pull request.",
      "Fast feedback catches bugs before they spread.",
      "Feature branches merge after green checks.",
    ],
  },
  {
    id: "stage",
    ...ENV_CONFIG.staging,
    steps: [
      "Deploy build artifact",
      "Run integration tests",
      "Smoke & E2E checks",
      "Manual / QA sign-off",
    ],
    learn: [
      "Mirrors production config, data shape, and infra.",
      "Validates the same binary that will go to prod.",
      "Reduces risk of surprise failures in production.",
    ],
  },
  {
    id: "prod",
    ...ENV_CONFIG.production,
    steps: [
      "Promote approved build",
      "Blue/green or rolling deploy",
      "Health checks & monitoring",
      "Rollback if needed",
    ],
    learn: [
      "Only tested, approved artifacts are released.",
      "Observability (logs, metrics, traces) is essential.",
      "CD automates safe, repeatable deployments.",
    ],
  },
];

const concepts = {
  ci: "Continuous Integration — automate build, test, and merge validation on every change.",
  cd: "Continuous Delivery / Deployment — automate releasing validated builds through environments.",
  flow: "Code moves DEV → Stage → Prod. Each gate adds confidence before users see the change.",
};

module.exports = { pipeline, concepts };
