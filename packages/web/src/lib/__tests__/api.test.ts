import apiClient, { playerApi, sessionApi, statisticsApi } from "../api-client";

// Mock axios
jest.mock("axios", () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  })),
}));

// Mock next-auth
jest.mock("next-auth/react", () => ({
  getSession: jest.fn(() => Promise.resolve({ backendToken: "mock-token" })),
}));

describe("API Client", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(apiClient).toBeDefined();
  });

  it("should have axios instance", () => {
    expect(apiClient).toHaveProperty("get");
    expect(apiClient).toHaveProperty("post");
    expect(apiClient).toHaveProperty("put");
    expect(apiClient).toHaveProperty("patch");
    expect(apiClient).toHaveProperty("delete");
  });

  it("should have request and response interceptors", () => {
    expect(apiClient.interceptors).toBeDefined();
    expect(apiClient.interceptors.request).toBeDefined();
    expect(apiClient.interceptors.response).toBeDefined();
  });

  it("should export playerApi", () => {
    expect(playerApi).toBeDefined();
    expect(playerApi.getMe).toBeDefined();
    expect(playerApi.getStats).toBeDefined();
    expect(playerApi.updateBankroll).toBeDefined();
  });

  it("should export sessionApi", () => {
    expect(sessionApi).toBeDefined();
    expect(sessionApi.getAll).toBeDefined();
    expect(sessionApi.getById).toBeDefined();
    expect(sessionApi.create).toBeDefined();
    expect(sessionApi.update).toBeDefined();
    expect(sessionApi.delete).toBeDefined();
  });

  it("should export statisticsApi", () => {
    expect(statisticsApi).toBeDefined();
    expect(statisticsApi.getOverall).toBeDefined();
    expect(statisticsApi.getMonthly).toBeDefined();
  });
});
