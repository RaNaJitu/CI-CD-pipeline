const express = require("express");
const path = require("path");
const { createApiRouter } = require("./routes/api");

function createApp() {
  const app = express();
  const publicDir = path.join(__dirname, "..", "public");

  app.use(express.static(publicDir));
  app.use("/api", createApiRouter());

  app.get("*", (_req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });

  return app;
}

module.exports = { createApp };
