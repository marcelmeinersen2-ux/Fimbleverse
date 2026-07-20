'use client';

interface CategoryTotal { name: string; total: number }

function zloty(n: number) {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(n);
}

// Calm horizontal bars — one per category, sized by share of the month's spend.
export function SpendingBreakdown({ totals, grandTotal, monthLabel }:
  { totals: CategoryTotal[]; grandTotal: number; monthLabel: string }) {
  if (grandTotal === 0) {
    return (
      <div className="rounded-card bg-surface border border-line p-5">
        <p className="text-sm text-muted">No spending yet this month.</p>
      </div>
    );
  }
  const sorted = [...totals].sort((a, b) => b.total - a.total);
  const max = Math.max(...sorted.map((t) => t.total));

  return (
    <div className="rounded-card bg-surface shadow-soft border border-line p-5">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-sm font-medium text-muted">Where it went · {monthLabel}</h2>
        <span className="font-display text-lg tabular-nums">{zloty(grandTotal)}</span>
      </div>
      <div className="space-y-3">
        {sorted.map((t) => {
          const pct = Math.round((t.total / grandTotal) * 100);
          const width = max > 0 ? (t.total / max) * 100 : 0;
          return (
            <div key={t.name}>
              <div className="flex items-baseline justify-between text-sm mb-1">
                <span className="text-ink capitalize">{t.name}</span>
                <span className="text-muted tabular-nums">{zloty(t.total)} · {pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-bg overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: `${width}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
