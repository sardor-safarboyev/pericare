import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("perisafe_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const triageApi = {
  login: async (email: string, telegram_user_id?: string) => {
    const res = await api.post("/auth/login", { email, telegram_user_id });
    return res.data;
  },
  extractOcr: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post("/triage/ocr-extract", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  evaluateVitals: async (data: any) => {
    const res = await api.post("/triage/evaluate", data);
    return res.data;
  },
  getDashboardStats: async () => {
    const res = await api.get("/dashboard/stats");
    return res.data;
  },
};
