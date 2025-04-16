import authService from "./authService";

interface RequestOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

const apiService = {
  request: async (endpoint: string, options: RequestOptions = {}) => {
    try {
      const token = await authService.getToken();
      const companyCode = await authService.getCompanyCode();

      if (!token || !companyCode) {
        throw new Error("Authentication required");
      }

      const url = `${process.env.EXPO_PUBLIC_API_URL}${endpoint}`;
      const defaultHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-tenant-id": companyCode,
      };

      const response = await fetch(url, {
        method: options.method || "GET",
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      // Handle 401 errors (unauthorized) by logging out
      if (response.status === 401) {
        await authService.logout();
        throw new Error("Your session has expired. Please log in again.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `Request failed with status ${response.status}`
        );
      }

      return data;
    } catch (error: any) {
      console.error(`API request error for ${endpoint}:`, error);
      throw error;
    }
  },

  // Helper methods for common HTTP methods
  get: (endpoint: string) => apiService.request(endpoint),

  post: (endpoint: string, data: any) =>
    apiService.request(endpoint, {
      method: "POST",
      body: data,
    }),

  put: (endpoint: string, data: any) =>
    apiService.request(endpoint, {
      method: "PUT",
      body: data,
    }),

  patch: (endpoint: string, data: any) =>
    apiService.request(endpoint, {
      method: "PATCH",
      body: data,
    }),

  delete: (endpoint: string) =>
    apiService.request(endpoint, {
      method: "DELETE",
    }),
};

export default apiService;
