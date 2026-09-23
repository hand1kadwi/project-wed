export type WeddingCategory = { id: string; name: string; budget: number; saved: number; color: string };
export type Contribution = { id: string; amount: number; date: string; note: string; categoryId: string };
export type Income = { id: string; amount: number; date: string; source: string };

export const defaultCategories: WeddingCategory[] = [
  { id: "venue", name: "Venue & catering", budget: 24000000, saved: 4100000, color: "#d97c5d" },
  { id: "rings", name: "Rings", budget: 7000000, saved: 1200000, color: "#d4a65a" },
  { id: "attire", name: "Attire & makeup", budget: 8000000, saved: 850000, color: "#9a7197" },
  { id: "photo", name: "Photo & video", budget: 6500000, saved: 600000, color: "#638f9d" },
  { id: "decor", name: "Decor & invitations", budget: 5500000, saved: 400000, color: "#96a879" },
  { id: "honeymoon", name: "Honeymoon", budget: 5000000, saved: 350000, color: "#8090bd" },
  { id: "buffer", name: "Contingency fund", budget: 4000000, saved: 0, color: "#82919b" },
];

export const targetDate = "2027-12-10";

export const currency = (amount: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);

export function monthsUntil(target: string, now = new Date()) {
  const end = new Date(`${target}T00:00:00`);
  return Math.max(1, (end.getFullYear() - now.getFullYear()) * 12 + end.getMonth() - now.getMonth() + (end.getDate() >= now.getDate() ? 1 : 0));
}

export function planSummary(categories: WeddingCategory[], target = targetDate, now = new Date()) {
  const goal = categories.reduce((total, category) => total + category.budget, 0);
  const saved = categories.reduce((total, category) => total + category.saved, 0);
  const remaining = Math.max(0, goal - saved);
  const months = monthsUntil(target, now);
  return { goal, saved, remaining, months, monthly: Math.ceil(remaining / months), progress: goal ? Math.min(100, (saved / goal) * 100) : 0 };
}
