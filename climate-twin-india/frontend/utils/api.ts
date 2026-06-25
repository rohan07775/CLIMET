import axios from 'axios'

// API base URL defaults to localhost:8000 for local docker compose development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Auto-inject JWT token if it exists in localStorage
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('access_token')
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }
}

export const weatherApi = {
  getCurrent: async () => {
    const res = await api.get('/weather/current')
    return res.data
  },
  getState: async (stateName: string) => {
    const res = await api.get(`/weather/state/${stateName}`)
    return res.data
  },
  getHistorical: async (stateName?: string, limit: number = 50) => {
    const params = stateName ? { state: stateName, limit } : { limit }
    const res = await api.get('/weather/historical', { params })
    return res.data
  },
}

export const predictApi = {
  get7Day: async (stateName: string) => {
    const res = await api.get(`/predict/7day/${stateName}`)
    return res.data
  },
  getMonsoon: async () => {
    const res = await api.get('/predict/monsoon')
    return res.data
  },
}

export const alertsApi = {
  getActive: async (stateName?: string) => {
    const params = stateName ? { state: stateName } : {}
    const res = await api.get('/alerts/active', { params })
    return res.data
  },
  getHistory: async (limit: number = 30) => {
    const res = await api.get('/alerts/history', { params: { limit } })
    return res.data
  },
  createAlert: async (data: { state: string; alert_type: string; risk_level: string; message: str }) => {
    const res = await api.post('/alerts/create', data)
    return res.data
  },
  subscribe: async (data: { email: string; phone?: string; subscribed_states: string[] }) => {
    const res = await api.post('/alerts/subscribe', data)
    return res.data
  },
}

export const agriApi = {
  getStateSuitability: async (stateName: string) => {
    const res = await api.get(`/crop-analysis/state/${stateName}`)
    return res.data
  },
  getAll: async (limit: number = 50) => {
    const res = await api.get('/crop-analysis/all', { params: { limit } })
    return res.data
  },
}

export const chatbotApi = {
  query: async (data: { message: string; session_id?: string; language?: string }) => {
    const res = await api.post('/chatbot/query', data)
    return res.data
  },
}

export const carbonApi = {
  calculate: async (data: { electricity_kwh: number; transport_km: number; fuel_liters: number; waste_kg: number }) => {
    const res = await api.post('/carbon/calculate', data)
    return res.data
  },
}

export const authApi = {
  register: async (data: any) => {
    const res = await api.post('/auth/register', data)
    return res.data
  },
  login: async (data: any) => {
    const res = await api.post('/auth/login', data)
    if (res.data.access_token) {
      localStorage.setItem('access_token', res.data.access_token)
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`
    }
    return res.data
  },
  me: async () => {
    const res = await api.get('/auth/me')
    return res.data
  },
  logout: () => {
    localStorage.removeItem('access_token')
    delete api.defaults.headers.common['Authorization']
  },
}
