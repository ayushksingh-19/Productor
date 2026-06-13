export function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "INR",
  }).format(value || 0);
}

export function formatCount(value) {
  return new Intl.NumberFormat("en-IN").format(value || 0);
}

export function initialsFromName(name) {
  return String(name || "OA")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
