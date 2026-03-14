import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPplogClient } from "../index.js";
import { withContext } from "../with-context.js";

// Mock createPplogClient to test context handling without real API client creation
vi.mock("../index.js", () => ({
  createPplogClient: vi.fn(),
}));

describe("withContext", () => {
  const mockCreatePplogClient = vi.mocked(createPplogClient);

  // Mock client instance to verify it's passed to handlers correctly
  const mockClient: Partial<ReturnType<typeof createPplogClient>> = {};

  // Mock handler function to verify arguments and return values
  const mockHandler = vi.fn();

  // Create test context with default values and optional overrides
  const createTestContext = (overrides?: {
    apiAccessToken?: string;
    apiBaseUrl?: string;
  }) => ({
    apiAccessToken: overrides?.apiAccessToken ?? "test-token",
    apiBaseUrl: overrides?.apiBaseUrl ?? "https://api.pplog.example.com",
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreatePplogClient.mockReturnValue(
      mockClient as ReturnType<typeof createPplogClient>,
    );
  });

  it("should create client and call handler for StdioContext", async () => {
    const context = createTestContext();
    const expectedResult = { success: true };
    mockHandler.mockResolvedValue(expectedResult);

    const result = await withContext(context, mockHandler, "arg1", "arg2");

    expect(mockCreatePplogClient).toHaveBeenCalledWith(
      context.apiAccessToken,
      context.apiBaseUrl,
    );
    expect(mockHandler).toHaveBeenCalledWith(mockClient, "arg1", "arg2");
    expect(result).toBe(expectedResult);
  });

  it("should work with different apiBaseUrl", async () => {
    const context = createTestContext({
      apiBaseUrl: "https://api.example.com",
    });

    await withContext(context, mockHandler);

    expect(mockCreatePplogClient).toHaveBeenCalledWith(
      context.apiAccessToken,
      context.apiBaseUrl,
    );
  });

  it("should throw error for unsupported context type", async () => {
    // Create invalid context missing required apiAccessToken property
    const invalidContext = {
      someOtherProperty: "value",
    };

    await expect(
      withContext(
        invalidContext as unknown as Parameters<typeof withContext>[0],
        mockHandler,
      ),
    ).rejects.toThrow(
      "Unsupported context type. Only StdioContext is currently supported.",
    );
  });

  it("should handle handler errors correctly", async () => {
    const context = createTestContext();
    const handlerError = new Error("Handler failed");
    mockHandler.mockRejectedValue(handlerError);

    await expect(withContext(context, mockHandler)).rejects.toThrow(
      "Handler failed",
    );
  });

  it("should pass through handler arguments correctly", async () => {
    const context = createTestContext();
    const args = [{ page: 1 }, { per_page: 20 }, "extra"];
    mockHandler.mockResolvedValue("success");

    await withContext(context, mockHandler, ...args);

    expect(mockHandler).toHaveBeenCalledWith(mockClient, ...args);
  });
});
