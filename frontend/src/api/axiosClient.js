// src/api/axiosClient.js

import axios from 'axios'

// Reads from Vite env var if set, falls back to local FastAPI dev server.
// In production (Railway), set VITE_API_BASE_URL in your frontend's env config.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — attaches JWT to every outgoing request automatically.
// No more manually adding headers in every component.
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor — catches expired/invalid tokens globally.
// If the backend returns 401, clear the bad token and bounce to login.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axiosClient