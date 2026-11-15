export class ApiError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: unknown
  ) {
    super(message);

    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    // Ensure instanceof ApiError works correctly after transpilation.
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * API base URL
 *
 * Production:
 *   Uses the same-origin /api/v1 path.
 *
 * Development:
 *   Uses VITE_API_URL when provided.
 *   Otherwise uses the local Express backend.
 *
 * This application serves both the React frontend and Express API
 * from the same Hostinger Node.js application in production.
 */
const viteEnv =
  typeof import.meta !== 'undefined'
    ? (import.meta as ImportMeta & {
      env?: Record<string, string | undefined>;
    }).env
    : undefined;

const configuredApiUrl = viteEnv?.VITE_API_URL;

const isProduction = viteEnv?.MODE === 'production';

const API_BASE_URL =
  configuredApiUrl ||
  (isProduction
    ? '/api/v1'
    : 'http://localhost:5000/api/v1');

/**
 * Make an API request.
 *
 * Examples:
 *
 *   apiRequest('/auth/login', {
 *     method: 'POST',
 *     body: JSON.stringify({
 *       email,
 *       password,
 *     }),
 *   });
 *
 *   apiRequest('/auth/me');
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  const headers = new Headers(options.headers || {});

  /*
   * Do not manually set Content-Type for FormData.
   * The browser must generate the multipart boundary itself.
   */
  if (
    !headers.has('Content-Type') &&
    !(options.body instanceof FormData) &&
    !(options.body instanceof URLSearchParams)
  ) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,

    /*
     * Required for the application's HttpOnly session cookies.
     */
    credentials: 'include',
  });

  const contentType = response.headers.get('content-type');

  const isJson =
    !!contentType &&
    contentType.toLowerCase().includes('application/json');

  let responseData: unknown = null;

  if (isJson) {
    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }
  }

  /*
   * Convert all non-2xx responses into a consistent ApiError.
   */
  if (!response.ok) {
    const errorPayload =
      typeof responseData === 'object' &&
        responseData !== null &&
        'error' in responseData
        ? (responseData as {
          error?: {
            code?: string;
            message?: string;
            details?: unknown;
          };
        }).error
        : undefined;

    const errorCode =
      errorPayload?.code || 'HTTP_ERROR';

    const errorMessage =
      errorPayload?.message ||
      response.statusText ||
      'An error occurred';

    const errorDetails =
      errorPayload?.details;

    throw new ApiError(
      response.status,
      errorCode,
      errorMessage,
      errorDetails
    );
  }

  /*
   * Your backend responses use:
   *
   * {
   *   success: true,
   *   data: ...
   * }
   *
   * Return only the data portion to callers.
   *
   * If an endpoint returns a non-standard response,
   * return the complete response body.
   */
  if (
    typeof responseData === 'object' &&
    responseData !== null &&
    'data' in responseData
  ) {
    return (responseData as { data: T }).data;
  }

  return responseData as T;
}