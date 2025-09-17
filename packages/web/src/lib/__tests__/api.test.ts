import api from "../api";

// Mock axios
jest.mock("axios", () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  })),
}));

describe("API Client", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(api).toBeDefined();
  });

  it("should have axios instance", () => {
    expect(api).toHaveProperty("get");
    expect(api).toHaveProperty("post");
    expect(api).toHaveProperty("put");
    expect(api).toHaveProperty("delete");
  });

  it("should have request and response interceptors", () => {
    expect(api.interceptors).toBeDefined();
    expect(api.interceptors.request).toBeDefined();
    expect(api.interceptors.response).toBeDefined();
  });
});
