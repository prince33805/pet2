// lib/date.ts
export const tz = 'Asia/Bangkok';
export const pad2 = (n: number) => String(n).padStart(2, '0');

export function minutesToLabel(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${pad2(h)}:${pad2(m)}`;
}

export function toISODate(d: Date) {
  // คืนค่า 'YYYY-MM-DD' ตามเวลาท้องถิ่น
  const y = d.getFullYear();
  const mo = pad2(d.getMonth() + 1);
  const da = pad2(d.getDate());
  return `${y}-${mo}-${da}`;
}
