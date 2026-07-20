// Plain-language formatting helpers for the UI.
export function zloty(amount: number): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency', currency: 'PLN',
  }).format(amount);
}

export function shortDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'short',
  }).format(new Date(iso));
}
