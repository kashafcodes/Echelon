import api, { API_URL, getStoredToken, setStoredToken } from "../utils/api.js";

/**
 * LokArt Dynamic API Client powered by Axios & centralized in utils/api.js
 * Automatically resolves dynamic backend URL, sends credentials/cookies,
 * and attaches Bearer authorization token.
 */

export const API_BASE = API_URL;
export const apiClient = api;
export { getStoredToken, setStoredToken, api };

/**
 * Unified request adapter
 */
export async function apiFetch(endpoint, options = {}) {
  const method = (options.method || "GET").toLowerCase();
  let data = undefined;

  if (options.body) {
    try {
      data = typeof options.body === "string" ? JSON.parse(options.body) : options.body;
    } catch {
      data = options.body;
    }
  }

  return api.request({
    url: endpoint,
    method,
    data,
    headers: options.headers,
    params: options.params,
  });
}

export default api;

// ─── Authentication APIs ────────────────────────────────────────────────────────

export const authApi = {
  register: (payload) => apiClient.post("/api/auth/register", payload),
  login: (payload) => apiClient.post("/api/auth/login", payload),
  getMe: () => apiClient.get("/api/auth/me"),
  logout: () => apiClient.post("/api/auth/logout"),
  updateProfile: (payload) => apiClient.put("/api/auth/profile", payload),
  uploadAvatar: (avatar) => apiClient.post("/api/auth/profile/avatar", { avatar }),
  removeAvatar: () => apiClient.delete("/api/auth/profile/avatar"),
  changePassword: (payload) => apiClient.put("/api/auth/password", payload),
  getAdminUsers: () => apiClient.get("/api/auth/admin/users"),
  updateVendorStatus: (vendorId, status) =>
    apiClient.put(`/api/auth/admin/vendors/${vendorId}/status`, { status }),
};

// ─── Product Catalog APIs ───────────────────────────────────────────────────────

export const productApi = {
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        query.append(key, val);
      }
    });
    const qs = query.toString();
    return apiClient.get(`/api/products${qs ? `?${qs}` : ""}`);
  },

  getProductById: (id) => apiClient.get(`/api/products/${id}`),
  getFeatured: () => apiClient.get("/api/products/featured"),
  getRandom: (limit = 6, excludeId = null) => {
    let url = `/api/products/random?limit=${limit}`;
    if (excludeId) url += `&excludeId=${excludeId}`;
    return apiClient.get(url);
  },
  getCategories: () => apiClient.get("/api/categories"),
};

// ─── Vendor Product Management APIs ─────────────────────────────────────────────

export const vendorProductApi = {
  createProduct: (payload) => apiClient.post("/api/vendor/products", payload),
  getProducts: () => apiClient.get("/api/vendor/products"),
  getProductById: (id) => apiClient.get(`/api/vendor/products/${id}`),
  updateProduct: (id, payload) => apiClient.put(`/api/vendor/products/${id}`, payload),
  togglePublish: (id) => apiClient.patch(`/api/vendor/products/${id}/publish`),
  deleteProduct: (id) => apiClient.delete(`/api/vendor/products/${id}`),
};

// ─── Admin Product Moderation APIs ──────────────────────────────────────────────

export const adminProductApi = {
  getPending: () => apiClient.get("/api/admin/products/pending"),
  approve: (id) => apiClient.patch(`/api/admin/products/${id}/approve`),
  reject: (id, reason) => apiClient.patch(`/api/admin/products/${id}/reject`, { reason }),
};

// ─── Order Management APIs ──────────────────────────────────────────────────────

export const orderApi = {
  placeOrder: (payload) => apiClient.post("/api/orders", payload),
  getMyOrders: () => apiClient.get("/api/orders/my"),
  getOrderById: (id) => apiClient.get(`/api/orders/${id}`),
  cancelOrder: (id, payload = {}) => apiClient.patch(`/api/orders/${id}/cancel`, payload),

  getVendorOrders: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        query.append(key, val);
      }
    });
    const qs = query.toString();
    return apiClient.get(`/api/orders/vendor/orders${qs ? `?${qs}` : ""}`);
  },

  updateVendorItemStatus: (orderId, itemId, payload) =>
    apiClient.patch(`/api/orders/vendor/${orderId}/items/${itemId}/status`, payload),

  getAdminOrders: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        query.append(key, val);
      }
    });
    const qs = query.toString();
    return apiClient.get(`/api/orders/admin/all${qs ? `?${qs}` : ""}`);
  },

  updatePaymentStatus: (orderId, payload) =>
    apiClient.patch(`/api/orders/admin/${orderId}/payment-status`, payload),
};

// ─── Vendor Public Profile APIs ─────────────────────────────────────────────────

export const vendorPublicApi = {
  getProductsByVendor: (vendorId, { excludeId, limit = 8 } = {}) => {
    const params = new URLSearchParams();
    if (excludeId) params.append("excludeId", excludeId);
    params.append("limit", limit);
    return apiClient.get(`/api/products/by-vendor/${vendorId}?${params}`);
  },
};

// ─── Commission Management APIs ─────────────────────────────────────────────────

export const commissionApi = {
  getSettings: () => apiClient.get("/api/commission/settings"),
  updateSettings: (payload) => apiClient.put("/api/commission/settings", payload),

  getAdminOverview: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        query.append(key, val);
      }
    });
    const qs = query.toString();
    return apiClient.get(`/api/commission/admin/overview${qs ? `?${qs}` : ""}`);
  },

  getVendorOverview: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        query.append(key, val);
      }
    });
    const qs = query.toString();
    return apiClient.get(`/api/commission/vendor/overview${qs ? `?${qs}` : ""}`);
  },
};

// ─── AI Multilingual Translation APIs ───────────────────────────────────────────

export const aiApi = {
  translateProduct: ({ productName, description }) =>
    apiClient.post("/api/ai/translate-product", { productName, description }),
};

// ─── Artisan Public Studio APIs ─────────────────────────────────────────────────

export const artisanApi = {
  getProfile: (vendorId) => apiClient.get(`/api/artisans/${vendorId}`),
  getProducts: (vendorId, params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        query.append(key, val);
      }
    });
    const qs = query.toString();
    return apiClient.get(`/api/artisans/${vendorId}/products${qs ? `?${qs}` : ""}`);
  },
};

// ─── Craft Storytelling APIs ────────────────────────────────────────────────────

export const storyApi = {
  getProductStory: (productId) => apiClient.get(`/api/stories/product/${productId}`),
  getMyStories: () => apiClient.get("/api/stories/my-stories"),
  createOrUpdateStory: (payload) => apiClient.post("/api/stories", payload),
  updateStory: (storyId, payload) => apiClient.put(`/api/stories/${storyId}`, payload),
  togglePublish: (storyId) => apiClient.patch(`/api/stories/${storyId}/publish`),
  deleteStory: (storyId) => apiClient.delete(`/api/stories/${storyId}`),
};
