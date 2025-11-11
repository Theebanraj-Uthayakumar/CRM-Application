import type { Customer, CustomerPayload } from "../types/customer";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

const headers = {
  "Content-Type": "application/json",
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers,
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = (errorBody as { message?: string }).message ?? response.statusText;
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const customerApi = {
  list: () => request<Customer[]>("/customers"),
  create: (payload: CustomerPayload) =>
    request<Customer>("/customers", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  update: (id: string, payload: CustomerPayload) =>
    request<Customer>(`/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  delete: (id: string) =>
    request<void>(`/customers/${id}`, {
      method: "DELETE",
    }),
};
