export interface Zone {
  id: number;
  zone_id: string;
  provincia: string;
  ciudad: string;
  zone_discount_pct: number;
  active: boolean;
  operary_name?: string;
  operary_id?: string;
  contact?: string;
}

export interface PostalCode {
  id: number;
  cp_from: string;
  cp_to: string;
  zone_id: string;
}

export enum ServiceUnit {
  PIEZA = 'pieza',
  M2 = 'm2',
}

export interface Service {
  id: number;
  servicio_id: string;
  servicio: string;
  subservicio: string;
  unidad: ServiceUnit;
  base_unit_price: number;
  m2_rate: number;
  min_charge: number;
  active: boolean;
}

export interface Modifier {
  tipo: string;
  clave: string;
  label: string;
  pct: number;
}

export interface QuoteInput {
  cp: string;
  provincia: string;
  ciudad: string;
  serviceId: string;
  quantity: number;
  flags: { [key: string]: boolean };
}

export interface AppliedModifier {
    clave: string;
    label: string;
    pct: number;
}

export interface QuoteResultDetail {
  basePrice: number;
  workloadPrice: number;
  appliedModifiers: AppliedModifier[];
  modifierFactor: number;
  zoneId: string;
  zoneDiscountPct: number;
  zoneDiscountAmount: number;
  finalPrice: number;
  formula: string;
  operaryName?: string;
}

export interface QuoteResult {
  min: number;
  max: number;
  detail: QuoteResultDetail;
  notes: string[];
  summary: string;
}