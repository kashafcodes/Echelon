/**
 * LokArt API Client
 * Sends cookies automatically and attaches Bearer token if present.
 */

const API_BASE = "";

export function getStoredToken() {
  return localStorage.getItem("lokart_token");
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem("lokart_token", token);
  } else {
    localStorage.removeItem("lokart_token");
  }
}

export async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const token = getStoredToken();
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // For HTTP-only cookie support
  });

  let data = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const errorMessage =
      data?.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const authApi = {
  register: (payload) =>
    apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload) =>
    apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getMe: () =>
    apiFetch("/api/auth/me", {
      method: "GET",
    }),

  logout: () =>
    apiFetch("/api/auth/logout", {
      method: "POST",
    }),

  updateProfile: (payload) =>
    apiFetch("/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  uploadAvatar: (avatar) =>
    apiFetch("/api/auth/profile/avatar", {
      method: "POST",
      body: JSON.stringify({ avatar }),
    }),

  removeAvatar: () =>
    apiFetch("/api/auth/profile/avatar", {
      method: "DELETE",
    }),

  changePassword: (payload) =>
    apiFetch("/api/auth/password", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  getAdminUsers: () =>
    apiFetch("/api/auth/admin/users", {
      method: "GET",
    }),

  updateVendorStatus: (vendorId, status) =>
    apiFetch(`/api/auth/admin/vendors/${vendorId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
};
