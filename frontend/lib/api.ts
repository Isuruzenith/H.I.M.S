import { API_BASE_URL } from "@/lib/constants";

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
};

export class ApiError extends Error {
  status: number;
  errors: string[];

  constructor(message: string, status: number, errors: string[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

type RequestOptions = Omit<RequestInit, "body" | "method"> & {
  body?: unknown;
};

async function request<T>(
  path: string,
  method: string,
  options: RequestOptions = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(options.headers);

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    method,
    headers,
    credentials: "include",
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  let payload: ApiEnvelope<T> | null = null;
  try {
    payload = (await response.json()) as ApiEnvelope<T>;
  } catch {
    payload = null;
  }

  if (!response.ok || payload?.success === false) {
    throw new ApiError(
      payload?.message ?? `Request failed with status ${response.status}`,
      response.status,
      payload?.errors ?? []
    );
  }

  return (payload?.data ?? ({} as T)) as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, "GET", options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, "POST", { ...options, body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, "PUT", { ...options, body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, "PATCH", { ...options, body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, "DELETE", options),
};

export function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return [error.message, ...error.errors].filter(Boolean).join(" ");
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong while contacting the Flask API.";
}

export function toBackendIssuePayload(input: {
  departmentId: number;
  requestedByStaffId: number;
  itemId: number;
  quantity: number;
}) {
  return {
    department_id: input.departmentId,
    requested_by_staff_id: input.requestedByStaffId,
    item_id: input.itemId,
    requested_quantity: input.quantity,
  };
}
