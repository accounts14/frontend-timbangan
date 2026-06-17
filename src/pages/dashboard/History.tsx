import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, AlertTriangle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PressureService } from '@/lib/services';
import { formatDateTime, formatNumber } from '@/lib/utils';
import type { PressureLog } from '@/types/api';

export default function HistoryPage() {
  const [logs, setLogs] = useState<PressureLog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Selalu filter overload saja
    PressureService.getHistory({ page, limit: 15, status: 'overload' })
      .then((res) => {
        setLogs(res.data);
        setTotalPages(res.totalPages || 1);
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Kejadian Overload</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Memuat data...
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
              <AlertTriangle className="w-8 h-8" />
              <p>Belum ada kejadian overload</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="py-2 pr-4 font-medium">Waktu</th>
                    <th className="py-2 pr-4 font-medium">Device</th>
                    <th className="py-2 pr-4 font-medium">Tekanan</th>
                    <th className="py-2 pr-4 font-medium">Jarak (cm)</th>
                    <th className="py-2 pr-4 font-medium">Batas Maks</th>
                    <th className="py-2 pr-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5 pr-4 whitespace-nowrap">{formatDateTime(log.created_at)}</td>
                      <td className="py-2.5 pr-4 font-mono text-xs text-muted-foreground">{log.device_id}</td>
                      <td className="py-2.5 pr-4 stat-value">{formatNumber(log.pressure, 2)}</td>
                      <td className="py-2.5 pr-4 font-mono text-xs text-muted-foreground">
                        {log.distance_cm !== null ? formatNumber(log.distance_cm, 1) : '—'}
                      </td>
                      <td className="py-2.5 pr-4 text-muted-foreground">{formatNumber(log.max_pressure, 2)}</td>
                      <td className="py-2.5 pr-4">
                        <Badge variant="destructive">Overload</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && logs.length > 0 && (
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