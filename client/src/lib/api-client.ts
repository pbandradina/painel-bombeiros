// Simple HTTP client for Supabase Edge Function API
const API_BASE_URL = "https://gntlcxaoxtzukaizoxoi.supabase.co/functions/v1/api";

export const apiClient = {
  async get(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  },

  async post(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  },

  async delete(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  },

  // Bombeiros endpoints
  bombeiros: {
    list: async () => apiClient.get("/bombeiros"),
    create: async (data: { nome: string; equipe: string; data: string }) =>
      apiClient.post("/bombeiros", data),
    delete: async (id: number) => apiClient.delete(`/bombeiros/${id}`),
  },

  // Periodos endpoints
  periodos: {
    list: async () => apiClient.get("/periodos"),
    create: async (data: any) => apiClient.post("/periodos", data),
    delete: async (id: number) => apiClient.delete(`/periodos/${id}`),
  },
};
