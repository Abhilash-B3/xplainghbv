export function monthsSince(isoDate: string): number {
  const start = new Date(isoDate);
  const now = new Date();
  const months =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());
  return Math.max(months, 1);
}

export function addMonths(isoDate: string, n: number): string {
  const d = new Date(isoDate);
  d.setMonth(d.getMonth() + n);
  return d.toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });
}

export function addDays(isoDate: string, n: number): string {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatFullDate(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
