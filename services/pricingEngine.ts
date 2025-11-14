import { QuoteInput, QuoteResult, Service, Modifier, Zone, PostalCode, ServiceUnit, AppliedModifier } from '../types';

// Helper function to round to nearest 100
const roundToNearest100 = (num: number) => Math.round(num / 100) * 100;

export type CalculateQuoteResult = QuoteResult | 'ZONE_NOT_FOUND' | 'ZONE_INACTIVE' | 'SERVICE_NOT_FOUND';


export const calculateQuote = (
  input: QuoteInput,
  services: Service[],
  modifiers: Modifier[],
  zones: Zone[],
  postalCodes: PostalCode[]
): CalculateQuoteResult | null => {
  const selectedService = services.find(s => s.servicio_id === input.serviceId);
  if (!selectedService) return 'SERVICE_NOT_FOUND';

  // 1. Find Zone Information
  let baseZone: Zone | undefined;
  const inputCpNum = parseInt(input.cp, 10);
  let postalCodeData: PostalCode | undefined;
  if (!isNaN(inputCpNum)) {
    postalCodeData = postalCodes.find(pc => {
        const from = parseInt(pc.cp_from, 10);
        const to = parseInt(pc.cp_to, 10);
        return inputCpNum >= from && inputCpNum <= to;
    });
  }
  
  if (postalCodeData) {
    baseZone = zones.find(z => z.zone_id === postalCodeData.zone_id);
  } else if (input.provincia && input.ciudad) {
    baseZone = zones.find(z => 
        z.provincia.toLowerCase() === input.provincia.toLowerCase() && 
        z.ciudad.toLowerCase() === input.ciudad.toLowerCase()
    );
  }

  if (!baseZone) return 'ZONE_NOT_FOUND';
  if (!baseZone.active) return 'ZONE_INACTIVE';

  const zoneInfo = {
    zone_id: baseZone.zone_id,
    zone_discount_pct: baseZone.zone_discount_pct,
    operary_name: baseZone.operary_name,
  };

  // 2. Calculate Base Price (National List)
  let basePrice = 0;
  if (selectedService.unidad === ServiceUnit.PIEZA) {
    basePrice = selectedService.base_unit_price * input.quantity;
  } else if (selectedService.unidad === ServiceUnit.M2) {
    basePrice = Math.max(selectedService.min_charge, selectedService.m2_rate * input.quantity);
  }

  // 3. Apply Effort Modifiers (additively)
  const appliedModifiers: AppliedModifier[] = [];
  let totalModifierPct = 0.0;
  for (const key in input.flags) {
    if (input.flags[key]) {
      const modifier = modifiers.find(m => m.clave === key);
      if (modifier) {
        totalModifierPct += modifier.pct;
        appliedModifiers.push({ clave: modifier.clave, label: modifier.label, pct: modifier.pct });
      }
    }
  }
  const modifierFactor = 1 + totalModifierPct;
  const workloadPrice = basePrice * modifierFactor;

  // 4. Apply Zone Discount
  const zoneDiscountAmount = workloadPrice * zoneInfo.zone_discount_pct;
  const finalPrice = workloadPrice - zoneDiscountAmount;

  // 5. Calculate Range
  const min = roundToNearest100(finalPrice * 0.95);
  const max = roundToNearest100(finalPrice * 1.10);

  // 6. Generate Summary and Details
  const formula = `((${basePrice.toFixed(0)} * ${modifierFactor.toFixed(2)}) * (1 - ${zoneInfo.zone_discount_pct}))`;
  
  const city = baseZone.ciudad || `${input.provincia}, ${input.ciudad}`;
  const summary = `Estimado orientativo ${selectedService.servicio}/${selectedService.subservicio} en ${city} (zona ${zoneInfo.zone_id}): $${min}–$${max} ARS. Método: inyección–cepillado–extracción. Secado 4–5 h. Resultados pueden variar; valor final se confirma in situ.`;

  return {
    min,
    max,
    detail: {
      basePrice,
      workloadPrice,
      appliedModifiers,
      modifierFactor,
      zoneId: zoneInfo.zone_id,
      zoneDiscountPct: zoneInfo.zone_discount_pct,
      zoneDiscountAmount,
      finalPrice,
      formula,
      operaryName: zoneInfo.operary_name,
    },
    notes: [
      'Método: inyección–cepillado–extracción.',
      'Tiempo de secado estimado: 4–5 horas.',
      'Manchas y olores pre-existentes pueden no eliminarse al 100%.',
      'El valor final se confirma en la visita presencial.',
    ],
    summary
  };
};