import authService from "./authService";

// Define a variable to hold the logout handler from the context
let contextLogoutHandler: (() => Promise<void>) | null = null;

interface RequestOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

const apiService = {
  /**
   * Allows AuthContext to provide its logout function.
   */
  setup: (logoutHandler: () => Promise<void>) => {
    contextLogoutHandler = logoutHandler;
  },

  request: async (endpoint: string, options: RequestOptions = {}) => {
    try {
      const token = await authService.getToken();
      const companyCode = await authService.getCompanyCode();

      // If token or company code is missing, trigger logout and throw auth error
      if (!token || !companyCode) {
        if (contextLogoutHandler) {
          await contextLogoutHandler(); // Use context's logout to update state
        } else {
          await authService.logout(); // Fallback if setup wasn't called (shouldn't happen)
        }
        throw new Error("Authentication required. Please log in.");
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

      // Handle 401 errors (unauthorized) by triggering logout
      if (response.status === 401) {
        if (contextLogoutHandler) {
          await contextLogoutHandler(); // Use context's logout to update state
        } else {
          await authService.logout(); // Fallback
        }
        throw new Error("Your session has expired. Please log in again.");
      }

      // Try parsing JSON, handle potential empty responses for certain status codes if needed
      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        // Check for empty body before parsing
        const text = await response.text();
        data = text ? JSON.parse(text) : null;
      } else {
        // Handle non-JSON responses if necessary, e.g., for DELETE success with no content
        if (response.ok && response.status === 204) {
          return null; // Or return an empty object/success indicator
        }
        // If not OK and not JSON, throw error with text content if available
        const text = await response.text();
        throw new Error(
          text || `Request failed with status ${response.status}`
        );
      }

      if (!response.ok) {
        // Use error message from JSON data if available
        // Ensure data is parsed before accessing .message if possible
        let errorData;
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
            errorData = await response.json();
          }
        } catch (e) {
          // Ignore parsing error if response is not JSON
        }
        throw new Error(
          errorData?.message || `Request failed with status ${response.status}`
        );
      }

      return data;
    } catch (error: any) {
      console.error(`API request error for ${endpoint}:`, error.message);
      // Re-throw the error so it can be caught by the calling component if needed
      // The logout action (if applicable) has already been performed.
      throw error;
    }
  },

  // Helper methods for common HTTP methods
  get: (endpoint: string) => apiService.request(endpoint),

  post: (endpoint: string, data: any = {}) =>
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
