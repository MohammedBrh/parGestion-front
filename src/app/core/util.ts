import { Attribution, CarCategory, PersonnelCategory } from './models';

export const CAR_CATEGORIES: { value: CarCategory; label: string }[] = [
  { value: 'VIP', label: 'VIP' },
  { value: 'SERVICE_CLASS', label: 'Service classe' },
  { value: 'SERVICE_NORMALE', label: 'Service normale' },
  { value: 'MATERIEL', label: 'Matériel' },
];

export const PERSONNEL_CATEGORIES: { value: PersonnelCategory; label: string }[] = [
  { value: 'VIP', label: 'VIP' },
  { value: 'GUEST', label: 'Invité' },
  { value: 'EMPLOYEE', label: 'Employé' },
];

export function carCategoryLabel(c: string): string {
  return CAR_CATEGORIES.find((x) => x.value === c)?.label ?? c;
}

export function personnelCategoryLabel(c: string): string {
  return PERSONNEL_CATEGORIES.find((x) => x.value === c)?.label ?? c;
}

/** Remove spaces, dots and dashes: "06 12-34.56.78" -> "0612345678" */
export function cleanPhone(p: string): string {
  return (p ?? '').replace(/[\s.\-()]/g, '');
}

/** International form used by tel: and sms: links. Moroccan local numbers (0X...) become +212X... */
export function dialNumber(p: string): string {
  const n = cleanPhone(p);
  if (n.startsWith('00')) return '+' + n.slice(2);
  if (n.startsWith('0')) return '+212' + n.slice(1);
  return n.startsWith('+') ? n : '+' + n;
}

export type Timing = 'NOW' | 'SOON' | 'OVERDUE';

export function timing(a: Attribution, now = new Date()): Timing {
  const s = new Date(a.startAt).getTime();
  const e = new Date(a.endAt).getTime();
  const t = now.getTime();
  if (t > e) return 'OVERDUE';
  if (t >= s) return 'NOW';
  return 'SOON';
}

export const TIMING_LABEL: Record<Timing, string> = {
  NOW: 'En cours',
  SOON: 'À venir',
  OVERDUE: 'À clôturer',
};

/** Value for <input type="datetime-local"> */
export function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
