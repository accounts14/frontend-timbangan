export interface User {
  id: string;
  nama: string;
  email: string;
  role: 'admin' | string;
  created_at?: string;
}

export interface Settings {
  id: number;
  nama_alat: string;
  max_pressure: string | number;
  unit: string;
  buzzer_enabled: boolean;
  updated_at?: string;
}

export interface PressureLog {
  id: number;
  device_id: string;
  pressure: string | number;
  distance_cm: string | number | null;
  max_pressure: string | number;
  status: 'normal' | 'overload';
  created_at: string;
  unit?: string;
  buzzer_enabled?: boolean;
}

export interface Alert {
  id: number;
  device_id: string;
  pressure: string | number;
  max_pressure: string | number;
  message: string;
  resolved: boolean;
  created_at: string;
}

export interface Device {
  device_id: string;
  label: string;
  is_online: boolean;
  last_seen: string | null;
  last_pressure: string | number | null;
  last_distance_cm: string | number | null;
  created_at?: string;
}

export interface Stats {
  total_readings: number;
  total_overload: number;
  max_recorded: string | number;
  avg_pressure: string | number;
  min_pressure: string | number;
}

export interface ChartPoint {
  time_bucket: string;
  pressure: string | number;
  max_pressure: string | number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  unresolved?: number;
}

export type WSMessage =
  | { type: 'connected'; message: string }
  | { type: 'pressure_update'; data: PressureLog }
  | { type: 'new_alert'; data: Alert }
  | { type: 'device_status'; data: Device }
  | { type: 'settings_update'; data: Settings };
