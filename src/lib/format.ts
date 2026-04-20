export const fmtMoney = (n: number, opts: Intl.NumberFormatOptions = {}) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...opts,
  }).format(Number.isFinite(n) ? n : 0);

export const fmtNum = (n: number, frac = 2) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: frac,
    maximumFractionDigits: frac,
  }).format(Number.isFinite(n) ? n : 0);

export const fmtPct = (n: number) =>
  `${n >= 0 ? "+" : ""}${fmtNum(n, 2)}%`;

export const signClass = (n: number) =>
  n > 0 ? "text-gain" : n < 0 ? "text-loss" : "text-muted-foreground";
