import { useEffect, useState, FormEvent } from 'react';
import { Loader2, Save, Settings as SettingsIcon, ServerCog, Wifi, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { SettingsService, DeviceService } from '@/lib/services';
import { useToast } from '@/components/ui/toast';
import { apiErrorMessage } from '@/lib/api';
import { formatDateTime, formatNumber } from '@/lib/utils';
import type { Device, Settings as SettingsType } from '@/types/api';

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [namaAlat, setNamaAlat] = useState('');
  const [maxPressure, setMaxPressure] = useState('');
  const [unit, setUnit] = useState('cm');
  const [buzzerEnabled, setBuzzerEnabled] = useState(true);

  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [s, d] = await Promise.all([SettingsService.get(), DeviceService.getAll()]);
      setSettings(s.data);
      setDevices(d.data);
      setNamaAlat(s.data.nama_alat);
      setMaxPressure(String(s.data.max_pressure));
      setUnit(s.data.unit);
      setBuzzerEnabled(s.data.buzzer_enabled);
    } catch (err) {
      toast({ title: 'Gagal memuat pengaturan', description: apiErrorMessage(err), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const max = Number(maxPressure);
    if (isNaN(max) || max <= 0) {
      toast({ title: 'Batas jarak tidak valid', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const res = await SettingsService.update({
        nama_alat: namaAlat,
        max_pressure: max,
        unit,
        buzzer_enabled: buzzerEnabled,
      });
      setSettings(res.data);
      toast({
        title: 'Pengaturan disimpan',
        description: 'Konfigurasi terbaru telah dikirim ke alat via MQTT.',
        variant: 'success',
      });
    } catch (err) {
      toast({ title: 'Gagal menyimpan', description: apiErrorMessage(err), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Memuat pengaturan...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4" /> Pengaturan Sensor Jarak (HC-SR04)
          </CardTitle>
          <CardDescription>
            Ubah batas tekanan (berdasarkan jarak) maksimal, satuan, dan status buzzer. Perubahan langsung dikirim
            ke ESP8266 melalui MQTT (retained) — alat selalu sinkron tanpa flash ulang.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="nama_alat">Nama Alat</Label>
              <Input
                id="nama_alat"
                value={namaAlat}
                onChange={(e) => setNamaAlat(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="max_pressure">Batas Jarak Minimum (cm)</Label>
                <Input
                  id="max_pressure"
                  type="number"
                  step="0.01"
                  min="0"
                  value={maxPressure}
                  onChange={(e) => setMaxPressure(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="unit">Satuan</Label>
                <Input
                  id="unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="cm, %, dll"
                />
              </div>
            </div>

            {/* Info logika sensor HC-SR04 */}
            <div className="flex items-start gap-2 text-xs text-muted-foreground glass-card p-3">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
              <span>
                Isi nilai <strong>jarak minimum dalam cm</strong>. Buzzer akan berbunyi dan overload tercatat
                saat objek lebih dekat dari jarak ini. Contoh: isi <strong>30</strong> → bunyi kalau objek
                masuk dalam jarak 30 cm.
              </span>
            </div>

            <div className="flex items-center justify-between glass-card p-4">
              <div>
                <p className="text-sm font-medium">Buzzer Peringatan</p>
                <p className="text-xs text-muted-foreground">
                  Aktifkan bunyi buzzer pada alat saat tekanan melebihi batas
                </p>
              </div>
              <Switch checked={buzzerEnabled} onCheckedChange={setBuzzerEnabled} />
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Simpan Pengaturan
            </Button>

            {settings?.updated_at && (
              <p className="text-xs text-muted-foreground">
                Terakhir diperbarui: {formatDateTime(settings.updated_at)}
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Status Device */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ServerCog className="w-4 h-4" /> Status Perangkat
          </CardTitle>
          <CardDescription>
            Status koneksi alat ESP8266 berdasarkan topic MQTT status.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {devices.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada perangkat yang terdaftar.</p>
          ) : (
            devices.map((d) => (
              <div key={d.device_id} className="glass-card p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wifi className={`w-4 h-4 ${d.is_online ? 'text-success' : 'text-muted-foreground'}`} />
                  <div>
                    <p className="text-sm font-medium">{d.label}</p>
                    <p className="text-xs text-muted-foreground font-mono">{d.device_id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={d.is_online ? 'success' : 'outline'}>
                    {d.is_online ? 'Online' : 'Offline'}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    Terakhir: {d.last_seen ? formatDateTime(d.last_seen) : '—'}
                  </p>
                  {d.last_pressure !== null && d.last_pressure !== undefined && (
                    <p className="text-xs text-muted-foreground">
                      Tekanan: {formatNumber(d.last_pressure, 2)} {unit}
                    </p>
                  )}
                  {d.last_distance_cm !== null && d.last_distance_cm !== undefined && (
                    <p className="text-xs text-muted-foreground">
                      Jarak: {formatNumber(d.last_distance_cm, 1)} cm
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Info koneksi */}
      <Card>
        <CardHeader>
          <CardTitle>Koneksi API & MQTT</CardTitle>
          <CardDescription>Informasi konfigurasi sistem (diatur via environment backend).</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>Backend menerima data dari ESP8266 melalui broker MQTT dan menyimpan ke Neon Postgres.</p>
          <p>
            Realtime ke dashboard menggunakan WebSocket endpoint{' '}
            <code className="text-primary">/ws</code>.
          </p>
          <p>
            Perubahan batas tekanan maksimal dikirim ke ESP8266 via topic{' '}
            <code className="text-primary">Pemrowalawe/config</code> (retained).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}