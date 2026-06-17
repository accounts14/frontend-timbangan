import { api } from './api';
import type {
  Alert,
  ChartPoint,
  Device,
  PaginatedResponse,
  PressureLog,
  Settings,
  Stats,
  User,
} from '@/types/api';

export const AuthService = {
  async login(payload: { email: string; password: string }) {
    const res = await api.post<{ success: boolean; message: string; token: string; user: User }>(
      '/auth/login', payload
    );
    return res.data;
  },
  async register(payload: { nama: string; email: string; password: string }) {
    const res = await api.post<{ success: boolean; message: string }>('/auth/register', payload);
    return res.data;
  },
  async me() {
    const res = await api.get<{ success: boolean; user: User }>('/auth/me');
    return res.data;
  },
};

export const PressureService = {
  async getLatest(deviceId?: string) {
    const res = await api.get<{ success: boolean; data: PressureLog | null; settings: Settings }>(
      '/pressure/latest',
      { params: deviceId ? { device_id: deviceId } : {} }
    );
    return res.data;
  },
  async getHistory(params: { page?: number; limit?: number; status?: string; device_id?: string } = {}) {
    const res = await api.get<PaginatedResponse<PressureLog>>('/pressure/history', { params });
    return res.data;
  },
  async getStats(hours = 24) {
    const res = await api.get<{ success: boolean; data: Stats }>('/pressure/stats', { params: { hours } });
    return res.data;
  },
  async getChart(hours = 24) {
    const res = await api.get<{ success: boolean; data: ChartPoint[] }>('/pressure/chart', { params: { hours } });
    return res.data;
  },
};

export const SettingsService = {
  async get() {
    const res = await api.get<{ success: boolean; data: Settings }>('/settings');
    return res.data;
  },
  async update(payload: Partial<Pick<Settings, 'nama_alat' | 'max_pressure' | 'unit' | 'buzzer_enabled'>>) {
    const res = await api.put<{ success: boolean; message: string; data: Settings }>('/settings', payload);
    return res.data;
  },
};

export const AlertService = {
  async getAll(params: { page?: number; limit?: number; resolved?: boolean } = {}) {
    const res = await api.get<PaginatedResponse<Alert>>('/alerts', { params });
    return res.data;
  },
  async resolve(id: number) {
    const res = await api.patch<{ success: boolean; message: string; data: Alert }>(`/alerts/${id}/resolve`);
    return res.data;
  },
};

export const DeviceService = {
  async getAll() {
    const res = await api.get<{ success: boolean; data: Device[] }>('/devices');
    return res.data;
  },
};
