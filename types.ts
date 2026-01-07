
export type Pais = 'AR' | 'BO';
export type Moneda = 'ARS' | 'Bs';

export interface Zone {
  id: number;
  zone_id: string;
  pais: Pais;
  provincia: string;
  ciudad: string;
  general_discount_pct: number;
  active: boolean;
  operary_name?: string;
  operary_id?: string;
  contact?: string;
}

export interface PostalCode {
  id: number;
  pais: Pais;
  cp_from: string;
  cp_to: string;
  zone_id: string;
}

export enum ServiceUnit {
  PIEZA = 'pieza',
  M2 = 'm2',
  UNIDAD = 'unidad', // For vehicle plans
}

export enum ServiceCategory {
    VEHICULOS = 'Vehículos',
    VEHICULOS_AISLADOS = 'Vehículos Aislados',
    ESTETICA_VEHICULAR = 'Estética Vehicular',
    COLCHONES = 'Colchones',
    TAPIZADOS = 'Tapizados', // Replaces SILLONES
    SILLAS = 'Sillas',
    ALFOMBRAS = 'Alfombras',
    BEBE = 'Bebé', // Replaces ART_BEBE
    CORTINAS = 'Cortinas',
    OTROS = 'Otros',
}

export interface Service {
  id: number;
  servicio_id: string; // Unique ID, e.g., 'veh_std_basico_ar'
  pais: Pais;
  moneda: Moneda;
  servicio: string; // Main group, e.g., 'Auto Standard'
  subservicio: string; // Specific item, e.g., 'Plan Básico'
  categoria: ServiceCategory;
  unidad: ServiceUnit;
  precio_base: number;
  diferencial_id?: string; // Links to a diferencial entry, e.g., 'dif_std_ar'
  notas?: string;
  active: boolean;
  // Fields for m2-based services
  tasa_m2?: number;
  min_cargo?: number;
}

export interface QuoteItem {
    key: number;
    serviceId: string;
    quantity: number;
}

export interface QuoteInput {
  pais: Pais;
  cp: string;
  provincia: string;
  ciudad: string;
  items: QuoteItem[];
  paymentMethod: 'cash_transfer' | 'other';
}

export interface AppliedDiscount {
    type: 'PROMO' | 'VALUE' | 'ZONE_GENERAL' | 'ZONE_CONDITIONAL';
    description: string;
    amount: number;
    pct: number;
}

export interface QuoteItemResult {
    service: Service;
    quantity: number;
    basePrice: number; // The price for this line item before any global discounts
}

export interface QuoteResultDetail {
  workloadSubtotal: number;
  appliedDiscount: AppliedDiscount | null;
  priceAfterDiscount: number;
  finalPrice: number;
  zoneId: string;
  moneda: Moneda;
  operaryName?: string;
  items: QuoteItemResult[];
}

export interface QuoteResult {
  min: number;
  max: number;
  detail: QuoteResultDetail;
  notes: string[];
  summary: string;
}

export interface DiscountRule {
    id: number;
    pais: Pais | string; // Allows 'ALL'
    category: string; // Matches ServiceCategory string (case insensitive)
    min_qty: number;
    discount_pct: number;
    active: boolean;
    description?: string;
}
