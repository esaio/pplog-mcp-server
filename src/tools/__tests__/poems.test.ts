import type { TextContent } from "@modelcontextprotocol/sdk/types.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { createPplogClient } from "../../api_client/index.js";
import { createPoem, getPoem, searchPoems } from "../poems.js";

describe("getPoem", () => {
  const mockClient = {
    GET: vi.fn(),
  } as unknown as ReturnType<typeof createPplogClient> & {
    GET: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a poem successfully", async () => {
    const mockPoem = {
      id: "abc123",
      title: "Test Poem",
      content: "First line\nSecond line",
      created_at: "2024-01-01T00:00:00+09:00",
    };

    mockClient.GET.mockResolvedValue({
      data: mockPoem,
      error: undefined,
      response: {
        ok: true,
        status: 200,
      } as Response,
    });

    const result = await getPoem(mockClient, { id: "abc123" });

    expect(mockClient.GET).toHaveBeenCalledWith("/v1/poems/{id}", {
      params: {
        path: { id: "abc123" },
      },
    });

    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: JSON.stringify(mockPoem, null, 2),
        },
      ],
    });
  });

  it("should handle API errors", async () => {
    const mockError = { error: "not_found", message: "Poem not found" };

    mockClient.GET.mockResolvedValue({
      data: undefined,
      error: mockError,
      response: {
        ok: false,
        status: 404,
      } as Response,
    });

    const result = await getPoem(mockClient, { id: "nonexistent" });

    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: `Error: ${JSON.stringify(mockError, null, 2)}`,
        },
      ],
    });
  });

  it("should handle error with response status when error is falsy", async () => {
    mockClient.GET.mockResolvedValue({
      data: undefined,
      error: undefined,
      response: {
        ok: false,
        status: 500,
      } as Response,
    });

    const result = await getPoem(mockClient, { id: "abc123" });

    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: "Error: API Response(status: 500)",
        },
      ],
    });
  });

  it("should handle network errors", async () => {
    const networkError = new Error("Network connection failed");

    mockClient.GET.mockRejectedValue(networkError);

    const result = await getPoem(mockClient, { id: "abc123" });

    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: "Error: Network connection failed",
        },
      ],
    });
  });

  it("should handle non-Error exceptions", async () => {
    mockClient.GET.mockRejectedValue("Unexpected error");

    const result = await getPoem(mockClient, { id: "abc123" });

    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: "Error: Unexpected error",
        },
      ],
    });
  });
});

describe("searchPoems", () => {
  const mockClient = {
    GET: vi.fn(),
  } as unknown as ReturnType<typeof createPplogClient> & {
    GET: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should search poems successfully", async () => {
    const mockData = {
      poems: [
        {
          id: "abc123",
          title: "Test Poem",
          content: "Short content",
          created_at: "2024-01-01T00:00:00+09:00",
        },
      ],
      pagination: {
        current_page: 1,
        total_pages: 1,
        total_count: 1,
      },
    };

    mockClient.GET.mockResolvedValue({
      data: mockData,
      error: undefined,
      response: {
        ok: true,
        status: 200,
      } as Response,
    });

    const result = await searchPoems(mockClient, { keyword: "test" });

    expect(mockClient.GET).toHaveBeenCalledWith("/v1/poems", {
      params: {
        query: { keyword: "test" },
      },
    });

    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              poems: [
                {
                  id: "abc123",
                  title: "Test Poem",
                  content: "Short content",
                  created_at: "2024-01-01T00:00:00+09:00",
                },
              ],
              pagination: mockData.pagination,
            },
            null,
            2,
          ),
        },
      ],
    });
  });

  it("should truncate long content to 200 characters", async () => {
    const longContent = "a".repeat(250);
    const mockData = {
      poems: [
        {
          id: "abc123",
          title: "Long Poem",
          content: longContent,
          created_at: "2024-01-01T00:00:00+09:00",
        },
      ],
      pagination: {
        current_page: 1,
        total_pages: 1,
        total_count: 1,
      },
    };

    mockClient.GET.mockResolvedValue({
      data: mockData,
      error: undefined,
      response: {
        ok: true,
        status: 200,
      } as Response,
    });

    const result = await searchPoems(mockClient, {});

    const parsedResult = JSON.parse((result.content[0] as TextContent).text);
    expect(parsedResult.poems[0].content).toBe(`${"a".repeat(200)}...`);
  });

  it("should not truncate content at exactly 200 characters", async () => {
    const exactContent = "a".repeat(200);
    const mockData = {
      poems: [
        {
          id: "abc123",
          title: "Exact Poem",
          content: exactContent,
          created_at: "2024-01-01T00:00:00+09:00",
        },
      ],
      pagination: {
        current_page: 1,
        total_pages: 1,
        total_count: 1,
      },
    };

    mockClient.GET.mockResolvedValue({
      data: mockData,
      error: undefined,
      response: {
        ok: true,
        status: 200,
      } as Response,
    });

    const result = await searchPoems(mockClient, {});

    const parsedResult = JSON.parse((result.content[0] as TextContent).text);
    expect(parsedResult.poems[0].content).toBe(exactContent);
  });

  it("should search without keyword or page", async () => {
    const mockData = {
      poems: [],
      pagination: {
        current_page: 1,
        total_pages: 0,
        total_count: 0,
      },
    };

    mockClient.GET.mockResolvedValue({
      data: mockData,
      error: undefined,
      response: {
        ok: true,
        status: 200,
      } as Response,
    });

    const result = await searchPoems(mockClient, {});

    expect(mockClient.GET).toHaveBeenCalledWith("/v1/poems", {
      params: {
        query: {},
      },
    });

    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { poems: [], pagination: mockData.pagination },
            null,
            2,
          ),
        },
      ],
    });
  });

  it("should pass page parameter when specified", async () => {
    const mockData = {
      poems: [],
      pagination: {
        current_page: 2,
        total_pages: 3,
        total_count: 30,
      },
    };

    mockClient.GET.mockResolvedValue({
      data: mockData,
      error: undefined,
      response: {
        ok: true,
        status: 200,
      } as Response,
    });

    await searchPoems(mockClient, { keyword: "test", page: 2 });

    expect(mockClient.GET).toHaveBeenCalledWith("/v1/poems", {
      params: {
        query: { keyword: "test", page: 2 },
      },
    });
  });

  it("should handle API errors", async () => {
    const mockError = {
      error: "unauthorized",
      message: "Invalid access token",
    };

    mockClient.GET.mockResolvedValue({
      data: undefined,
      error: mockError,
      response: {
        ok: false,
        status: 401,
      } as Response,
    });

    const result = await searchPoems(mockClient, { keyword: "test" });

    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: `Error: ${JSON.stringify(mockError, null, 2)}`,
        },
      ],
    });
  });

  it("should handle network errors", async () => {
    const networkError = new Error("Network connection failed");

    mockClient.GET.mockRejectedValue(networkError);

    const result = await searchPoems(mockClient, { keyword: "test" });

    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: "Error: Network connection failed",
        },
      ],
    });
  });

  it("should handle non-Error exceptions", async () => {
    mockClient.GET.mockRejectedValue("Unexpected error");

    const result = await searchPoems(mockClient, { keyword: "test" });

    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: "Error: Unexpected error",
        },
      ],
    });
  });
});

describe("createPoem", () => {
  const mockClient = {
    POST: vi.fn(),
  } as unknown as ReturnType<typeof createPplogClient> & {
    POST: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a poem successfully", async () => {
    const mockPoem = {
      id: "new123",
      title: "New Poem",
      content: "New Poem\nThis is the body",
      created_at: "2024-01-01T00:00:00+09:00",
    };

    mockClient.POST.mockResolvedValue({
      data: mockPoem,
      error: undefined,
      response: {
        ok: true,
        status: 201,
      } as Response,
    });

    const result = await createPoem(mockClient, {
      content: "New Poem\nThis is the body",
    });

    expect(mockClient.POST).toHaveBeenCalledWith("/v1/poems", {
      body: {
        content: "New Poem\nThis is the body",
      },
    });

    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: JSON.stringify(mockPoem, null, 2),
        },
      ],
    });
  });

  it("should handle API errors when creating a poem", async () => {
    const mockError = {
      error: "bad_request",
      message: "Invalid poem data",
    };

    mockClient.POST.mockResolvedValue({
      data: undefined,
      error: mockError,
      response: {
        ok: false,
        status: 400,
      } as Response,
    });

    const result = await createPoem(mockClient, {
      content: "",
    });

    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: `Error: ${JSON.stringify(mockError, null, 2)}`,
        },
      ],
    });
  });

  it("should handle network errors when creating a poem", async () => {
    const networkError = new Error("Network connection failed");

    mockClient.POST.mockRejectedValue(networkError);

    const result = await createPoem(mockClient, {
      content: "Test Poem\nBody",
    });

    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: "Error: Network connection failed",
        },
      ],
    });
  });

  it("should handle non-Error exceptions when creating a poem", async () => {
    mockClient.POST.mockRejectedValue("Unexpected error");

    const result = await createPoem(mockClient, {
      content: "Test Poem\nBody",
    });

    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: "Error: Unexpected error",
        },
      ],
    });
  });
});
