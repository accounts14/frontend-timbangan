import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertService } from '@/lib/services';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/toast';
import { apiErrorMessage } from '@/lib/api';
import { formatDateTime, formatNumber } from '@/lib/utils';
import type { Alert } from '@/types/api';

export default function AlertsPage() {
  const [alerts,      setAlerts]      = useState<Alert[]>([]);
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [filter,      setFilter]      = useState<'' | 'true' | 'false'>('');
  const [loading,     setLoading]     = useState(true);
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  const { isAuthenticated } = useAuth();
  const { toast }           = useToast();

  const load = () => {
    setLoading(true);
    AlertService.getAll({ page, limit: 15, resolved: filter === '' ? undefined : filter === 'true' })
      .then((res) => { setAlerts(res.data); setTotalPages(res.totalPages || 1); })
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [page, filter]);

  const handleResolve = async (id: number) => {
    setResolvingId(id);
    try {
      await AlertService.resolve(id);
      toast({ title: 'Alert ditandai selesai', variant: 'success' });
      load();
    } catch (err) {
      toast({ title: 'Gagal menyelesaikan alert', description: apiErrorMessage(err), variant: 'destructive' });
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
          <CardTitle>Riwayat Peringatan Tekanan Berlebih</CardTitle>
          <div className="flex items-center gap-2">
            {[
              { label: 'Semua',          value: '' },
              { label: 'Belum Selesai',  value: 'false' },
              { label: 'Selesai',        value: 'true' },
            ].map((f) => (
              <Button
                key={f.value}
                size="sm"
                variant={filter === f.value ? 'default' : 'outline'}
                onClick={() => { setFilter(f.value as typeof filter); setPage(1); }}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Memuat data...
            </div>
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
              <CheckCircle2 className="w-8 h-8 text-success" />
              <p>Tidak ada peringatan</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="glass-card p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      className={`w-5 h-5 mt-0.5 shrink-0 ${alert.resolved ? 'text-muted-foreground' : 'text-destructive'}`}
                    />
                    <div>
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDateTime(alert.created_at)} • Device: {alert.device_id}
                        {' '}• Tekanan: {formatNumber(alert.pressure, 2)} / Maks {formatNumber(alert.max_pressure, 2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={alert.resolved ? 'success' : 'destructive'}>
                      {alert.resolved ? 'Selesai' : 'Belum Selesai'}
                    </Badge>
                    {!alert.resolved && isAuthenticated && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={resolvingId === alert.id}
                        onClick={() => handleResolve(alert.id)}
                      >
                        {resolvingId === alert.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <CheckCircle2 className="w-4 h-4" />}
                        Tandai Selesai
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && alerts.length > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">Halaman {page} dari {totalPages}</p>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="w-4 h-4" /> Sebelumnya
                </Button>
                <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Selanjutnya <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
