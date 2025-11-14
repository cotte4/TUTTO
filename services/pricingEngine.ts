import { QuoteInput, QuoteResult, Service, Zone, PostalCode, ServiceUnit, ServiceCategory, AppliedDiscount, QuoteItemResult, Pais } from '../types';

const roundToNearest = (num: number, nearest: number) => Math.round(num / nearest) * nearest;

// FIX: Add 'as const' to ensure TypeScript infers literal types (e.g., 'ARS' instead of string)
// This resolves the type error when assigning config.moneda to a property expecting type Moneda.
const COUNTRY_CONFIG = {
    AR: {
        moneda: 'ARS',
        rounding: 100,
        minimum_charge: 27999,
        alfombra_threshold: 50000,
        promo_colchon_base_pct: 0.15,
    },
    BO: {
        moneda: 'Bs',
        rounding: 1,
        minimum_charge: 125,
        alfombra_threshold: 260,
        promo_colchon_base_pct: 0.10,
    }
} as const;

export type CalculateQuoteResult = QuoteResult | 'ZONE_NOT_FOUND' | 'ZONE_INACTIVE' | 'SERVICE_NOT_FOUND';

export const calculateQuote = (
  input: QuoteInput,
  allServices: Service[],
  allZones: Zone[],
  allPostalCodes: PostalCode[]
): CalculateQuoteResult | null => {
  if (input.items.length === 0) return null;

  const config = COUNTRY_CONFIG[input.pais];
  const services = allServices.filter(s => s.pais === input.pais);
  const zones = allZones.filter(z => z.pais === input.pais);
  const postalCodes = allPostalCodes.filter(pc => pc.pais === input.pais);

  // 1. Find Zone Information
  let baseZone: Zone | undefined;
  if (input.cp) {
    const inputCpNum = parseInt(input.cp, 10);
    const postalCodeData = postalCodes.find(pc => {
        const from = parseInt(pc.cp_from, 10);
        const to = parseInt(pc.cp_to, 10);
        return inputCpNum >= from && inputCpNum <= to;
    });
    if (postalCodeData) baseZone = zones.find(z => z.zone_id === postalCodeData.zone_id);
  }
  
  if (!baseZone && input.provincia && input.ciudad) {
    baseZone = zones.find(z => 
        z.provincia.toLowerCase() === input.provincia.toLowerCase() && 
        z.ciudad.toLowerCase() === input.ciudad.toLowerCase()
    );
  }

  // Handle case for Bolivia with no location provided by creating a default zone
  if (!baseZone && input.pais === 'BO') {
      baseZone = {
          id: 0,
          zone_id: 'BOLIVIA_GENERAL',
          pais: 'BO',
          provincia: 'Bolivia',
          ciudad: 'General',
          general_discount_pct: 0,
          active: true,
      };
  }

  if (!baseZone) return 'ZONE_NOT_FOUND';
  if (!baseZone.active) return 'ZONE_INACTIVE';

  // 2. Calculate initial base price for each item
  let itemsResult: QuoteItemResult[] = [];
  let workloadSubtotal = 0;

  for (const item of input.items) {
      const service = services.find(s => s.servicio_id === item.serviceId);
      if (!service) return 'SERVICE_NOT_FOUND';

      let basePrice = 0;
      if (service.unidad === ServiceUnit.M2) {
        basePrice = Math.max(service.min_cargo || 0, (service.tasa_m2 || 0) * item.quantity);
      } else {
        basePrice = service.precio_base * item.quantity;
      }
      itemsResult.push({ service, quantity: item.quantity, basePrice });
  }

  // 3. Apply Special Calculation Rules
  // Rule: Ítems Aislados de Vehículos
  const isolatedItems = itemsResult.filter(ir => ir.service.categoria === ServiceCategory.VEHICULOS_AISLADOS);
  if (isolatedItems.length >= 2) {
    const maxPrice = Math.max(...isolatedItems.map(item => item.basePrice));
    
    // Infer vehicle category from the first isolated item that has a diferencial_id
    const firstItemWithDiff = isolatedItems.find(item => item.service.diferencial_id);
    const diferencialId = firstItemWithDiff?.service.diferencial_id;
    const diferencialService = services.find(s => s.servicio_id === diferencialId);

    if (diferencialService) {
        const differentialAmount = diferencialService.precio_base;
        const totalIsolatedPrice = maxPrice + differentialAmount;
        
        // Replace all isolated items with a single conceptual line item
        const otherItems = itemsResult.filter(ir => ir.service.categoria !== ServiceCategory.VEHICULOS_AISLADOS);
        const combinedIsolatedItemNames = isolatedItems.map(i => i.service.subservicio).join(' + ');
        
        // Create a fake service to represent the bundle
        const combinedService: Service = { ...isolatedItems[0].service, subservicio: combinedIsolatedItemNames };
        itemsResult = [...otherItems, { service: combinedService, quantity: 1, basePrice: totalIsolatedPrice }];
    }
  }

  workloadSubtotal = itemsResult.reduce((sum, item) => sum + item.basePrice, 0);

  // 4. Apply Promotions & Discounts
  let priceAfterDiscount = workloadSubtotal;
  let appliedDiscount: AppliedDiscount | null = null;
  let promoApplied = false;

  const hasPromoService = (serviceId: string) => input.items.some(i => i.serviceId.includes(serviceId));
  const countItemsByCategory = (category: ServiceCategory) => itemsResult.filter(ir => ir.service.categoria === category).length;
  const subtotalByCategory = (category: ServiceCategory) => itemsResult
      .filter(ir => ir.service.categoria === category)
      .reduce((sum, item) => sum + item.basePrice, 0);

  // --- Check Promotions (only apply one) ---
  if (input.paymentMethod === 'cash_transfer') {
      // Bebé Promo
      if (hasPromoService('bebe_promo') && countItemsByCategory(ServiceCategory.BEBE) > 2) { // 2 items + promo item = 3
          const babySubtotal = subtotalByCategory(ServiceCategory.BEBE);
          const discountAmount = babySubtotal * 0.20;
          priceAfterDiscount = workloadSubtotal - discountAmount;
          appliedDiscount = { type: 'PROMO', description: '20% OFF en 2+ artículos de bebé', amount: discountAmount, pct: 0.20 };
          promoApplied = true;
      }
      // Colchón + Base Promo
      else if (hasPromoService('colchon_base') && itemsResult.some(ir => ir.service.categoria === ServiceCategory.COLCHONES && ir.service.servicio_id !== 'colchon_base_ar' && ir.service.servicio_id !== 'colchon_base_bo')) {
          const discountAmount = workloadSubtotal * config.promo_colchon_base_pct;
          priceAfterDiscount = workloadSubtotal - discountAmount;
          appliedDiscount = { type: 'PROMO', description: `${config.promo_colchon_base_pct*100}% OFF Colchón + Base`, amount: discountAmount, pct: config.promo_colchon_base_pct };
          promoApplied = true;
      }
      // Sillones Promo
      else if (hasPromoService('promo_juego_sillones')) {
          const discountAmount = workloadSubtotal * 0.15; // Assuming 15% for AR
          priceAfterDiscount = workloadSubtotal - discountAmount;
          appliedDiscount = { type: 'PROMO', description: '15% OFF en Juego de Sillones', amount: discountAmount, pct: 0.15 };
          promoApplied = true;
      }
  }

  // --- Check Value-based Rules (if no promo) ---
  if (!promoApplied) {
      const alfombraSubtotal = subtotalByCategory(ServiceCategory.ALFOMBRAS);
      if (alfombraSubtotal > config.alfombra_threshold) {
          const discountAmount = alfombraSubtotal * 0.08;
          priceAfterDiscount = workloadSubtotal - discountAmount;
          appliedDiscount = { type: 'VALUE', description: `8% OFF por superar ${config.moneda} ${config.alfombra_threshold} en alfombras`, amount: discountAmount, pct: 0.08 };
      }
  }

  // --- Check Zone Discounts (if no promo/value rule) ---
  if (!appliedDiscount) {
    const eligibleItems = itemsResult.filter(item => item.service.categoria !== ServiceCategory.ESTETICA_VEHICULAR);
    const eligibleSubtotal = eligibleItems.reduce((sum, item) => sum + item.basePrice, 0);
    const nonEligibleSubtotal = workloadSubtotal - eligibleSubtotal;

    if (baseZone.general_discount_pct > 0) {
        const discountAmount = eligibleSubtotal * baseZone.general_discount_pct;
        priceAfterDiscount = (eligibleSubtotal - discountAmount) + nonEligibleSubtotal;
        appliedDiscount = { type: 'ZONE_GENERAL', description: `${baseZone.general_discount_pct * 100}% Descuento General Zona`, amount: discountAmount, pct: baseZone.general_discount_pct };
    } else if (eligibleItems.length >= 2 && input.paymentMethod === 'cash_transfer') {
        const discountAmount = eligibleSubtotal * 0.08;
        priceAfterDiscount = (eligibleSubtotal - discountAmount) + nonEligibleSubtotal;
        appliedDiscount = { type: 'ZONE_CONDITIONAL', description: '8% OFF por 2+ ítems (ctdo/transf)', amount: discountAmount, pct: 0.08 };
    }
  }

  // 5. Check Minimum Charge
  let finalPrice = priceAfterDiscount;
  let minimumChargeApplied = 0;
  if (finalPrice < config.minimum_charge) {
    minimumChargeApplied = config.minimum_charge - finalPrice;
    finalPrice = config.minimum_charge;
  }
  
  // 6. Calculate Range
  const min = roundToNearest(finalPrice * 0.95, config.rounding);
  const max = roundToNearest(finalPrice * 1.10, config.rounding);

  // 7. Generate Summary and Details
  const serviceList = itemsResult.map(i => i.service.subservicio).join(', ');
  const locationForSummary = baseZone.ciudad === 'General' ? 'Bolivia' : baseZone.ciudad;
  const summary = `Estimado orientativo para ${serviceList} en ${locationForSummary}: ${config.moneda} ${min}–${max}. El valor final se confirma in situ.`;
  
  const notes = [
      'Método: inyección–cepillado–extracción.',
      'Tiempo de secado estimado: 4–5 horas.',
      'Manchas y olores pre-existentes pueden no eliminarse al 100%.',
      'El valor final se confirma en la visita presencial.',
  ];
  if(minimumChargeApplied > 0) notes.push(`Se aplicó un monto mínimo de ${config.moneda} ${config.minimum_charge}.`);
  if(appliedDiscount?.type.startsWith('ZONE')) notes.push('Descuentos de zona no aplican a Estética Vehicular.');


  return {
    min,
    max,
    detail: {
      workloadSubtotal,
      appliedDiscount,
      priceAfterDiscount,
      minimumChargeApplied,
      finalPrice,
      zoneId: baseZone.zone_id,
      moneda: config.moneda,
      operaryName: baseZone.operary_name,
      items: itemsResult,
    },
    notes,
    summary
  };
};