const http = require("http");
const { createApp } = require("../../src/app");

function request(server, path) {
  return new Promise((resolve, reject) => {
    const { port } = server.address();
    http
      .get({ hostname: "127.0.0.1", port, path }, (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode,
            body: body ? JSON.parse(body) : null,
          });
        });
      })
      .on("error", reject);
  });
}

describe("API routes", () => {
  let server;

  beforeAll(() => {
    process.env.APP_ENV = "development";
    const app = createApp();
    server = app.listen(0);
  });

  afterAll(() => {
    return new Promise((resolve) => server.close(resolve));
  });

  test("GET /api/health returns ok", async () => {
    const res = await request(server, "/api/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.env.short).toBe("DEV");
    expect(res.body.build).toBeDefined();
  });

  test("GET /api/pipeline returns pipeline and concepts", async () => {
    const res = await request(server, "/api/pipeline");
    expect(res.statusCode).toBe(200);
    expect(res.body.pipeline).toHaveLength(3);
    expect(res.body.concepts.ci).toBeTruthy();
  });

  test("GET /api/env/:name returns environment detail", async () => {
    const res = await request(server, "/api/env/prod");
    expect(res.statusCode).toBe(200);
    expect(res.body.id || res.body.key).toBeDefined();
    expect(res.body.short).toBe("PROD");
  });
});
