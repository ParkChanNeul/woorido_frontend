import dayjs from "dayjs";
import "dayjs/locale/ko";
import relativeTime from "dayjs/plugin/relativeTime";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

dayjs.extend(relativeTime);

/**
 * className 조건부 결합 및 Tailwind 클래스 병합
 * Tailwind 클래스 충돌 자동 해결
 * @example cn("text-red-500", condition && "font-bold", "text-lg")
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * 금액 포맷팅
 */
export function formatAmount(
  value: number,
  options?: {
    showSign?: boolean;
    compact?: boolean;
    currency?: boolean;
  }
): string {
  const { showSign = false, compact = false, currency = true } = options ?? {};

  const formatter = new Intl.NumberFormat("ko-KR", {
    style: currency ? "currency" : "decimal",
    currency: "KRW",
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: 0,
  });

  const formatted = formatter.format(Math.abs(value));

  if (showSign && value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted.replace("-", "")}`;
  return formatted;
}

/**
 * 퍼센트 포맷팅
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * 날짜 포맷팅
 */
export function formatDate(
  date: string | Date,
  format = "YYYY.MM.DD"
): string {
  return dayjs(date).format(format);
}

/**
 * 상대 시간 (몇 분 전, 몇 시간 전)
 */
export function formatRelativeTime(date: string | Date, locale = "ko"): string {
  return dayjs(date).locale(locale).fromNow();
}

/**
 * D-Day 계산
 */
export function calculateDDay(targetDate: string | Date): {
  days: number;
  label: string;
} {
  const target = dayjs(targetDate).startOf("day");
  const today = dayjs().startOf("day");
  const diff = target.diff(today, "day");

  if (diff === 0) {
    return { days: 0, label: "D-Day" };
  } else if (diff > 0) {
    return { days: diff, label: `D-${diff}` };
  } else {
    return { days: Math.abs(diff), label: `D+${Math.abs(diff)}` };
  }
}

/**
 * 전화번호 포맷팅
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
  }
  
  return phone;
}

/**
 * 계좌번호 마스킹
 */
export function maskAccountNumber(account: string): string {
  if (account.length <= 4) return account;
  const visible = account.slice(-4);
  const masked = "*".repeat(account.length - 4);
  return `${masked}${visible}`;
}

/**
 * 이메일 마스킹
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  
  const maskedLocal =
    local.length <= 2
      ? local
      : `${local[0]}${"*".repeat(local.length - 2)}${local[local.length - 1]}`;
  
  return `${maskedLocal}@${domain}`;
}

/**
 * 디바운스
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * 로컬 스토리지 유틸
 */
export const storage = {
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : (defaultValue ?? null);
    } catch {
      return defaultValue ?? null;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // 스토리지 가득 참 등의 에러 무시
    }
  },

  remove(key: string): void {
    localStorage.removeItem(key);
  },
};
