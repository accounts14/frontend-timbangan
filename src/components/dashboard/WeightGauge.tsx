import { cn } from '@/lib/utils';

interface PressureGaugeProps {
  pressure: number;  // nilai pressure dari firmware (tidak ditampilkan)
  maxPressure: number;  // batas jarak minimum (cm) dari settings
  unit: string;
  isOverload: boolean;
  distanceCm?: number;  // jarak aktual yang ditampilkan ke user
}

export function WeightGauge({ maxPressure, unit, isOverload, distanceCm }: PressureGaugeProps) {
  // Tampilkan jarak aktual. Gauge penuh = 0 cm (sangat dekat), kosong = maxPressure*2 atau lebih
  const displayValue = distanceCm ?? 0;
  const maxDisplay = Math.max(maxPressure * 2, 10); // skala gauge = 2x batas minimum
  // Makin dekat = makin penuh (bahaya), makin jauh = makin kosong (aman)
  const percent = Math.min((1 - displayValue / maxDisplay) * 100, 100);
  const clampedPercent = Math.max(0, percent);

  const radius = 90;
  const circumference = Math.PI * radius;
  const dashOffset = circumference - (clampedPercent / 100) * circumference;

  const color = isOverload ? 'hsl(var(--destructive))' : 'hsl(var(--primary))';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-64 h-36">
        <svg viewBox="0 0 200 110" className="w-full h-full">
          {/* Track */}
          <path
            d="M 10 100 A 90 90 0 0 1 190 100"
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* Value arc */}
          <path
            d="M 10 100 A 90 90 0 0 1 190 100"
            fill="none"
            stroke={color}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.3s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span
            className={cn(
              'stat-value text-4xl',
              isOverload ? 'text-destructive animate-blink-warn' : 'text-foreground'
            )}
          >
            {displayValue.toFixed(1)}
          </span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
      </div>
      <div className="flex items-center justify-between w-64 mt-2 text-xs text-muted-foreground">
        <span>Dekat</span>
        <span>Batas: {maxPressure.toFixed(1)} {unit}</span>
      </div>
    </div>
  );
}