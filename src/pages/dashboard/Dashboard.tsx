import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, Gauge, ServerCog, TrendingUp, Volume2, VolumeX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WeightGauge } from '@/components/dashboard/WeightGauge';
import { WeightChart } from '@/components/dashboard/WeightChart';
import { PressureService, AlertService } from '@/lib/services';
import { useToast } from '@/components/ui/toast';
import { formatDateTime, formatNumber } from '@/lib/utils';
import type { Alert, ChartPoint, PressureLog, Settings, Stats } from '@/types/api';

interface DashboardProps {
  wsConnected: boolean;
  latest: PressureLog | null;
  settings: Settings | null;
  lastAlert: Alert | null;
}

export default function Dashboard({ wsConnected, latest, settings, lastAlert }: DashboardProps) {
  const { toast } = useToast();

  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [unresolvedAlerts, setUnresolvedAlerts] = useState(0);
  const [latestLoaded, setLatestLoaded] = useState(false);
  const [fallbackLatest, setFallbackLatest] = useState<PressureLog | null>(null);
  const [fallbackSettings, setFallbackSettings] = useState<Settings | null>(null);

  // Initial REST load
  useEffect(() => {
    (async () => {
      try {
        const [latestRes, chartRes, statsRes, alertsRes] = await Promise.all([
          PressureService.getLatest(),
          PressureService.getChart(24),
          PressureService.getStats(24),
          AlertService.getAll({ resolved: false, limit: 1 }),
        ]);
        setFallbackLatest(latestRes.data);
        setFallbackSettings(latestRes.settings);
        setChartData(chartRes.data);
        setStats(statsRes.data);
        setUnresolvedAlerts(alertsRes.unresolved ?? 0);
      } finally {
        setLatestLoaded(true);
      }
    })();
  }, []);

  // Refresh chart/stats tiap 30 detik
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [chartRes, statsRes] = await Promise.all([
          PressureService.getChart(24),
          PressureService.getStats(24),
        ]);
        setChartData(chartRes.data);
        setStats(statsRes.data);
      } catch { /* ignore */ }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Toast saat ada alert baru dari WebSocket
  useEffect(() => {
    if (lastAlert) {
      toast({
        title: '⚠️ Tekanan Berlebih Terdeteksi!',
        description: lastAlert.message,
        variant: 'destructive',
      });
      setUnresolvedAlerts((n) => n + 1);
    }
  }, [lastAlert, toast]);

  const effectiveLatest = latest ?? fallbackLatest;
  const effectiveSettings = settings ?? fallbackSettings;

  const pressure = Number(effectiveLatest?.pressure ?? 0);
  const maxPressure = Number(effectiveSettings?.max_pressure ?? effectiveLatest?.max_pressure ?? 80);
  const unit = effectiveSettings?.unit ?? effectiveLatest?.unit ?? 'cm';
  // maxPressure di DB = batas jarak minimum (cm). Overload kalau distance_cm < batas
  const distanceCm = Number(effectiveLatest?.distance_cm ?? Infinity);
  const isOverload = effectiveLatest?.status === 'overload' || (effectiveLatest != null && distanceCm < maxPressure);
  const buzzerEnabled = effectiveSettings?.buzzer_enabled ?? effectiveLatest?.buzzer_enabled ?? true;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Overload banner */}
      {isOverload && latestLoaded && (
        <div className="glass-card border-destructive/40 bg-destructive/10 p-4 flex items-center gap-3 animate-fade-in">
          <AlertTriangle className="w-6 h-6 text-destructive animate-blink-warn shrink-0" />
          <div>
            <p className="font-semibold text-destructive">Peringatan: Tekanan melebihi batas maksimal!</p>
            <p className="text-sm text-muted-foreground">
              Jarak terukur {formatNumber(distanceCm, 1)} cm, lebih dekat dari batas minimum {formatNumber(maxPressure, 1)} cm.
              {buzzerEnabled ? ' Buzzer pada alat aktif.' : ' Buzzer dinonaktifkan.'}
            </p>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle>Status Alat</CardTitle>
            <ServerCog className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className={`status-dot ${wsConnected ? 'bg-success animate-pulse-glow' : 'bg-destructive'}`} />
              <span className="text-lg font-semibold">{wsConnected ? 'Online' : 'Terputus'}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Koneksi realtime via WebSocket / MQTT</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle>Rata-rata 24 Jam</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="stat-value text-2xl">
              {formatNumber(stats?.avg_pressure ?? 0, 2)}{' '}
              <span className="text-sm text-muted-foreground font-normal">{unit}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">{stats?.total_readings ?? 0} pembacaan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle>Tekanan Tertinggi</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="stat-value text-2xl">
              {formatNumber(stats?.max_recorded ?? 0, 2)}{' '}
              <span className="text-sm text-muted-foreground font-normal">{unit}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">dalam 24 jam terakhir</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle>Peringatan Aktif</CardTitle>
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="stat-value text-2xl text-destructive">{unresolvedAlerts}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.total_overload ?? 0} kejadian overload (24 jam)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gauge + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Pembacaan Real-time</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <WeightGauge
              pressure={pressure}
              maxPressure={maxPressure}
              unit={unit}
              isOverload={isOverload}
              distanceCm={distanceCm === Infinity ? 0 : distanceCm}
            />

            <div className="w-full grid grid-cols-2 gap-3 mt-2">
              <div className="glass-card p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <Badge variant={isOverload ? 'destructive' : 'success'}>
                  {isOverload ? 'OVERLOAD' : 'Normal'}
                </Badge>
              </div>
              <div className="glass-card p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Buzzer</p>
                <div className="flex items-center justify-center gap-1.5 text-sm font-medium">
                  {buzzerEnabled
                    ? <Volume2 className="w-4 h-4 text-primary" />
                    : <VolumeX className="w-4 h-4 text-muted-foreground" />
                  }
                  {buzzerEnabled ? 'Aktif' : 'Nonaktif'}
                </div>
              </div>
            </div>

            {effectiveLatest?.distance_cm !== null && effectiveLatest?.distance_cm !== undefined && (
              <p className="text-xs text-muted-foreground">
                Jarak terukur: <span className="font-mono text-primary">{formatNumber(effectiveLatest.distance_cm, 1)} cm</span>
              </p>
            )}

            <p className="text-xs text-muted-foreground">
              Update terakhir:{' '}
              {effectiveLatest ? formatDateTime(effectiveLatest.created_at) : 'menunggu data...'}
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Grafik Tekanan — 24 Jam Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <WeightChart data={chartData} maxPressure={maxPressure} />
            ) : (
              <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm gap-2">
                <Gauge className="w-4 h-4" />
                Belum ada data pembacaan
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}