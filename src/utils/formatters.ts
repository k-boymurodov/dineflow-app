/**
 * Currency and date formatting utilities for DineFlow (Uzbek Latin format)
 */

export function formatUZS(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '0 soʻm';
  }
  return new Intl.NumberFormat('uz-UZ', {
    maximumFractionDigits: 0,
  }).format(amount) + ' soʻm';
}

export function formatNumberOnly(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '0';
  }
  return new Intl.NumberFormat('uz-UZ', {
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatTimeAgo(isoDate: string): string {
  try {
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    if (diffMinutes < 1) return 'Hozirgina';
    if (diffMinutes < 60) return `${diffMinutes} daqiqa oldin`;
    const diffHours = Math.floor(diffMinutes / 60);
    const remMinutes = diffMinutes % 60;
    return `${diffHours}s ${remMinutes} daq`;
  } catch {
    return 'Yangi';
  }
}

export function formatShortTime(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    return d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '--:--';
  }
}

export function generateOrderNumber(): string {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `#DF-${randomSuffix}`;
}

export interface StatusConfig {
  label: string;
  badgeBg: string;
  badgeText: string;
  border?: string;
  iconName: string;
  description: string;
}

export const ORDER_STATUS_MAP: Record<string, StatusConfig> = {
  new: {
    label: 'Yangi',
    badgeBg: 'bg-red-50 text-red-700',
    badgeText: 'text-red-700',
    border: 'border-red-200',
    iconName: 'bell',
    description: 'Buyurtma qabul qilinishi kutilmoqda',
  },
  preparing: {
    label: 'Tayyorlanmoqda',
    badgeBg: 'bg-amber-50 text-amber-800',
    badgeText: 'text-amber-800',
    border: 'border-amber-200',
    iconName: 'flame',
    description: 'Oshpazlar taomni tayyorlamoqda',
  },
  ready: {
    label: 'Tayyor',
    badgeBg: 'bg-emerald-50 text-emerald-800',
    badgeText: 'text-emerald-800',
    border: 'border-emerald-200',
    iconName: 'check-circle-2',
    description: 'Taom tayyor, ofitsiant olib ketmoqda',
  },
  delivered: {
    label: 'Yetkazildi',
    badgeBg: 'bg-[#E8F0EC] text-[#173F35]',
    badgeText: 'text-[#173F35]',
    border: 'border-[#c1ecdd]',
    iconName: 'utensils',
    description: 'Taom stolga tortildi',
  },
  cancelled: {
    label: 'Bekor qilingan',
    badgeBg: 'bg-slate-100 text-slate-600',
    badgeText: 'text-slate-600',
    border: 'border-slate-200',
    iconName: 'x-circle',
    description: 'Buyurtma bekor qilingan',
  },
};
