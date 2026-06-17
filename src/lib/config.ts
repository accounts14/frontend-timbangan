// Konfigurasi base URL API & WebSocket — bisa di-override via localStorage (untuk testing)
const DEFAULT_API_BASE = "http://localhost:5000/api";
const DEFAULT_WS_URL = "ws://localhost:5000/ws";

export const API_BASE_URL =
  (typeof window !== "undefined" && window.localStorage.getItem("smartscale.apiBase")) ||
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  DEFAULT_API_BASE;

export const WS_URL =
  (typeof window !== "undefined" && window.localStorage.getItem("smartscale.wsUrl")) ||
  (import.meta.env.VITE_WS_URL as string | undefined) ||
  DEFAULT_WS_URL;
