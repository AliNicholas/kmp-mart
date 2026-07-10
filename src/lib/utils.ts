import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatWibDateTime(value: string | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const formatted = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);

  return `${formatted} WIB`;
}

export function getOrderStatusLabel(status: string) {
  switch (status) {
    case "PENDING_PAYMENT":
      return "Menunggu Pembayaran";
    case "PAID":
      return "Sudah Dibayar";
    case "CONFIRMED":
      return "Dikonfirmasi Koperasi";
    case "PACKED":
      return "Sedang Dikemas";
    case "READY_FOR_PICKUP":
      return "Siap Diambil";
    case "DELIVERED_TO_RT":
      return "Tiba di Agen Transit";
    case "PICKED_UP":
      return "Sudah Diambil";
    case "COMPLETED":
      return "Selesai";
    default:
      return "Dibatalkan";
  }
}

export function getOrderStatusHighlight(status: string) {
  switch (status) {
    case "PENDING_PAYMENT":
      return {
        container: "bg-rose-50 border-rose-200",
        label: "text-rose-800",
        time: "text-rose-600",
      };
    case "PAID":
      return {
        container: "bg-sky-50 border-sky-200",
        label: "text-sky-800",
        time: "text-sky-600",
      };
    case "CONFIRMED":
      return {
        container: "bg-blue-50 border-blue-200",
        label: "text-blue-800",
        time: "text-blue-600",
      };
    case "PACKED":
      return {
        container: "bg-amber-50 border-amber-200",
        label: "text-amber-800",
        time: "text-amber-700",
      };
    case "READY_FOR_PICKUP":
      return {
        container: "bg-violet-50 border-violet-200",
        label: "text-violet-800",
        time: "text-violet-700",
      };
    case "DELIVERED_TO_RT":
      return {
        container: "bg-cyan-50 border-cyan-200",
        label: "text-cyan-800",
        time: "text-cyan-700",
      };
    case "PICKED_UP":
      return {
        container: "bg-indigo-50 border-indigo-200",
        label: "text-indigo-800",
        time: "text-indigo-700",
      };
    case "COMPLETED":
      return {
        container: "bg-emerald-50 border-emerald-200",
        label: "text-emerald-800",
        time: "text-emerald-700",
      };
    case "CANCELLED":
      return {
        container: "bg-rose-50 border-rose-200",
        label: "text-rose-800",
        time: "text-rose-600",
      };
    default:
      return {
        container: "bg-stone-100 border-stone-200",
        label: "text-stone-700",
        time: "text-stone-500",
      };
  }
}
