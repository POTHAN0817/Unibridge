const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

export const TOKEN_STORAGE_KEY = "unibridge_access_token";

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    // LocalStorage not available
  }
}

export function removeStoredToken(): void {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // LocalStorage not available
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const url = new URL(endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`);

  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const token = getStoredToken();

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      ...options,
      headers,
    });
  } catch (networkError) {
    console.error("[UniBridge API] Network error connecting to:", url.toString(), networkError);
    throw new ApiError(
      "Unable to connect to UniBridge backend. Please check your network or verify the backend server is running on " + BASE_URL,
      0,
      networkError
    );
  }

  // Parse response
  let responseData: any = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }
  } else {
    try {
      responseData = await response.text();
    } catch {
      responseData = null;
    }
  }

  if (!response.ok) {
    let errorMessage = "Request failed";

    if (responseData && typeof responseData === "object") {
      if (typeof responseData.detail === "string") {
        errorMessage = responseData.detail;
      } else if (Array.isArray(responseData.detail)) {
        // FastAPI Pydantic validation error array
        errorMessage = responseData.detail
          .map((err: any) => err.msg || `${err.loc?.join(".")}: ${err.type}`)
          .join("; ");
      } else if (responseData.message) {
        errorMessage = responseData.message;
      }
    } else if (typeof responseData === "string" && responseData.trim()) {
      errorMessage = responseData;
    } else {
      switch (response.status) {
        case 400:
          errorMessage = "Bad request. Please check submitted data.";
          break;
        case 401:
          errorMessage = "Invalid email or password.";
          break;
        case 403:
          errorMessage = "Access denied. You do not have permission for this action.";
          break;
        case 404:
          errorMessage = "The requested resource was not found.";
          break;
        case 422:
          errorMessage = "Validation error. Please verify all required form fields.";
          break;
        case 500:
          errorMessage = "Internal server error. Please try again later.";
          break;
        default:
          errorMessage = `HTTP error ${response.status}`;
      }
    }

    throw new ApiError(errorMessage, response.status, responseData);
  }

  return responseData as T;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  put: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  patch: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),

  getBaseUrl: () => BASE_URL,
};
