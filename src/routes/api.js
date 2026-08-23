const express = require("express");
const { resolveEnv, getRuntimeEnv } = require("../config/env");
const { loadBuildInfo } = require("../config/build-info");
const { pipeline, concepts } = require("../data/pipeline");

function createApiRouter() {
  const router = express.Router();
  const buildInfo = loadBuildInfo();
  const currentEnv = getRuntimeEnv();

  router.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      env: currentEnv,
      build: buildInfo,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  router.get("/pipeline", (_req, res) => {
    res.json({
      currentEnv,
      pipeline,
      concepts,
    });
  });

  router.get("/env/:name", (req, res) => {
    const env = resolveEnv(req.params.name);
    const detail = pipeline.find((p) => p.id === env.key);
    res.json(detail || env);
  });

  return router;
}

module.exports = { createApiRouter };
