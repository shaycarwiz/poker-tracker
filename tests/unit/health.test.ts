import request from "supertest";
import app from "@/index";

describe("Health Check Endpoint", () => {
  it("should return 200 and health status", async () => {
    const response = await request(app).get("/health").expect(200);

    expect(response.body).toHaveProperty("status", "OK");
    expect(response.body).toHaveProperty("timestamp");
    expect(response.body).toHaveProperty("uptime");
    expect(response.body).toHaveProperty("environment");
  });
});
