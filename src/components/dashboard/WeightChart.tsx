import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine
} from 'recharts';
import type { ChartPoint } from '@/types/api';
import { formatTime } from '@/lib/utils';

export function WeightChart({ data, maxPressure }: { data: ChartPoint[]; maxPressure: number }) {
  const chartData = data.map((d) => ({
    time:     formatTime(d.time_bucket),
    pressure: Number(d.pressure),
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="pressureFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="hsl(170 80% 50%)" stopOpacity={0.4} />
            <stop offset="100%" stopColor="hsl(170 80% 50%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(210 20% 18%)"
          vertical={false}
        />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 11, fill: 'hsl(200 12% 60%)' }}
          tickLine={false}
          axisLine={false}
          minTickGap={30}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'hsl(200 12% 60%)' }}
          tickLine={false}
          axisLine={false}
          width={40}
        />
        <Tooltip
          contentStyle={{
            background:   'hsl(210 28% 9%)',
            border:       '1px solid hsl(210 20% 18%)',
            borderRadius: 8,
            fontSize:     12,
          }}
          labelStyle={{ color: 'hsl(180 20% 96%)' }}
          formatter={(v: number) => [`${v}`, 'Tekanan']}
        />
        <ReferenceLine
          y={maxPressure}
          stroke="hsl(0 84% 60%)"
          strokeDasharray="4 4"
          label={{ value: 'Maks', fill: 'hsl(0 84% 60%)', fontSize: 11, position: 'right' }}
        />
        <Area
          type="monotone"
          dataKey="pressure"
          stroke="hsl(170 80% 50%)"
          strokeWidth={2}
          fill="url(#pressureFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
