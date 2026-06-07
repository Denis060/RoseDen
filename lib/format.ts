export const money = (value: number) =>
  new Intl.NumberFormat("en-SL", { maximumFractionDigits: 0 }).format(value) + " NLe";

export const shortDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(
    new Date(value.length === 10 ? `${value}T12:00:00` : value)
  );
