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

export const productApi = {
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        query.append(key, val);
      }
    });
    const qs = query.toString();
    return apiFetch(`/api/products${qs ? `?${qs}` : ""}`);
  },

  getProductById: (id) => apiFetch(`/api/products/${id}`),

  getFeatured: () => apiFetch("/api/products/featured"),

  getRandom: (limit = 6, excludeId = null) => {
    let url = `/api/products/random?limit=${limit}`;
    if (excludeId) url += `&excludeId=${excludeId}`;
    return apiFetch(url);
  },

  getCategories: () => apiFetch("/api/categories"),
};

export const vendorProductApi = {
  createProduct: (payload) =>
    apiFetch("/api/vendor/products", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getProducts: () => apiFetch("/api/vendor/products"),

  getProductById: (id) => apiFetch(`/api/vendor/products/${id}`),

  updateProduct: (id, payload) =>
    apiFetch(`/api/vendor/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  togglePublish: (id) =>
    apiFetch(`/api/vendor/products/${id}/publish`, {
      method: "PATCH",
    }),

  deleteProduct: (id) =>
    apiFetch(`/api/vendor/products/${id}`, {
      method: "DELETE",
    }),
};

export const adminProductApi = {
  getPending: () => apiFetch("/api/admin/products/pending"),

  approve: (id) =>
    apiFetch(`/api/admin/products/${id}/approve`, {
      method: "PATCH",
    }),

  reject: (id, reason) =>
    apiFetch(`/api/admin/products/${id}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    }),
};

export const orderApi = {
  placeOrder: (payload) =>
    apiFetch("/api/orders", { method: "POST", body: JSON.stringify(payload) }),

  getMyOrders: () => apiFetch("/api/orders/my"),

  getOrderById: (id) => apiFetch(`/api/orders/${id}`),

  cancelOrder: (id, payload = {}) =>
    apiFetch(`/api/orders/${id}/cancel`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  // Vendor order management
  getVendorOrders: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        query.append(key, val);
      }
    });
    const qs = query.toString();
    return apiFetch(`/api/orders/vendor/orders${qs ? `?${qs}` : ""}`);
  },

  updateVendorItemStatus: (orderId, itemId, payload) =>
    apiFetch(`/api/orders/vendor/${orderId}/items/${itemId}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  // Admin order management
  getAdminOrders: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        query.append(key, val);
      }
    });
    const qs = query.toString();
    return apiFetch(`/api/orders/admin/all${qs ? `?${qs}` : ""}`);
  },

  updatePaymentStatus: (orderId, payload) =>
    apiFetch(`/api/orders/admin/${orderId}/payment-status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};

export const vendorPublicApi = {
  getProductsByVendor: (vendorId, { excludeId, limit = 8 } = {}) => {
    const params = new URLSearchParams();
    if (excludeId) params.append("excludeId", excludeId);
    params.append("limit", limit);
    return apiFetch(`/api/products/by-vendor/${vendorId}?${params}`);
  },
};

export const commissionApi = {
  getSettings: () => apiFetch("/api/commission/settings"),

  updateSettings: (payload) =>
    apiFetch("/api/commission/settings", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  getAdminOverview: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        query.append(key, val);
      }
    });
    const qs = query.toString();
    return apiFetch(`/api/commission/admin/overview${qs ? `?${qs}` : ""}`);
  },

  getVendorOverview: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        query.append(key, val);
      }
    });
    const qs = query.toString();
    return apiFetch(`/api/commission/vendor/overview${qs ? `?${qs}` : ""}`);
  },
};

export const aiApi = {
  translateProduct: ({ productName, description }) =>
    apiFetch("/api/ai/translate-product", {
      method: "POST",
      body: JSON.stringify({ productName, description }),
    }),
};

export const artisanApi = {
  getProfile: (vendorId) => apiFetch(`/api/artisans/${vendorId}`),
  getProducts: (vendorId, params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        query.append(key, val);
      }
    });
    const qs = query.toString();
    return apiFetch(`/api/artisans/${vendorId}/products${qs ? `?${qs}` : ""}`);
  },
};

export const storyApi = {
  getProductStory: (productId) => apiFetch(`/api/stories/product/${productId}`),
  getMyStories: () => apiFetch("/api/stories/my-stories"),
  createOrUpdateStory: (payload) =>
    apiFetch("/api/stories", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateStory: (storyId, payload) =>
    apiFetch(`/api/stories/${storyId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  togglePublish: (storyId) =>
    apiFetch(`/api/stories/${storyId}/publish`, {
      method: "PATCH",
    }),
  deleteStory: (storyId) =>
    apiFetch(`/api/stories/${storyId}`, {
      method: "DELETE",
    }),
};
