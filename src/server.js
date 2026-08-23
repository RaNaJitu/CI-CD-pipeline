const { createApp } = require("./app");
const { getRuntimeEnv } = require("./config/env");

const PORT = process.env.PORT || 3000;
const app = createApp();
const currentEnv = getRuntimeEnv();

app.listen(PORT, () => {
  console.log(`CI/CD Learning running on http://localhost:${PORT}`);
  console.log(`Active environment: ${currentEnv.short} (${currentEnv.label})`);
});
