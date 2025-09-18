import swaggerJSDoc from "swagger-jsdoc";
import { Express } from "express";
import { config } from "../config";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Poker Tracker API",
      version: "1.0.0",
      description:
        "A comprehensive poker tracking application with statistics and analytics",
      contact: {
        name: "API Support",
        email: "support@poker-tracker.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: config.apiBaseUrl || "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      schemas: {
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Error message",
            },
            details: {
              type: "string",
              description: "Additional error details",
            },
          },
        },
        ValidationError: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Validation error message",
            },
            details: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: {
                    type: "string",
                    description: "Field name that failed validation",
                  },
                  message: {
                    type: "string",
                    description: "Validation error message",
                  },
                },
              },
            },
          },
        },
      },
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT token obtained from login endpoint",
        },
      },
    },
  },
  apis: ["./src/api/controllers/*.ts", "./src/api/routes/*.ts"],
};

const specs = swaggerJSDoc(options);

export const setupSwagger = (app: Express) => {
  const swaggerUi = require("swagger-ui-express");

  // Serve Swagger UI
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "Poker Tracker API Documentation",
    })
  );

  // Serve raw JSON
  app.get("/api-docs.json", (_, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(specs);
  });
};

export default specs;
