import express from "express";
import swaggerJSDoc from "swagger-jsdoc";
import { serve, setup } from "swagger-ui-express";

const app = express();

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Poker Tracker API",
      version: "1.0.0",
      description:
        "A comprehensive poker tracking application with statistics and analytics",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
  },
  apis: ["./src/api/controllers/*.ts", "./src/api/routes/*.ts"],
};

const specs = swaggerJSDoc(options);

app.use("/api-docs", serve, setup(specs));

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(specs);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`);
  console.log(`📄 Swagger JSON: http://localhost:${PORT}/api-docs.json`);
});
