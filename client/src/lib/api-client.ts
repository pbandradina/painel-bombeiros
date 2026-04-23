// Simple HTTP client for Supabase Edge Function API
const API_BASE_URL = "https://gntlcxaoxtzukaizoxoi.supabase.co/functions/v1/api";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdudGxjeGFveHR6dWthaXpveG9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NzcyODYsImV4cCI6MjA5MDQ1MzI4Nn0.gYHD-Nj-ev4fHOBv43ts9wXg2lgStksQnUV02w0hNms";

export const apiClient = {
  async get(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ANON_KEY}`,
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
        "Authorization": `Bearer ${ANON_KEY}`,
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
        "Authorization": `Bearer ${ANON_KEY}`,
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
    create: async (data: { nome: string; equipe: string; dataInicio: string }) => {
      // Convert dataInicio to ISO format for Supabase
      const payload = {
        nome: data.nome,
        equipe: data.equipe,
        data_inicio: new Date(data.dataInicio).toISOString(),
      };
      return apiClient.post("/bombeiros", payload);
    },
    delete: async (id: number) => apiClient.delete(`/bombeiros/${id}`),
  },

  // Periodos endpoints
  periodos: {
    list: async () => apiClient.get("/periodos"),
    create: async (data: any) => apiClient.post("/periodos", data),
    delete: async (id: number) => apiClient.delete(`/periodos/${id}`),
  },
};
