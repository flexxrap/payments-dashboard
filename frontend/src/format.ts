export function formatMoney(value: string | number): string {
  const num = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("ru-RU");
}
