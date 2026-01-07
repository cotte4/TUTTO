
import { QuoteInput, QuoteResult, Service, Zone, PostalCode, ServiceUnit, ServiceCategory, AppliedDiscount, QuoteItemResult, DiscountRule } from '../types';

export type CalculateQuoteResult = QuoteResult | 'ZONE_NOT_FOUND' | 'ZONE_INACTIVE' | 'SERVICE_NOT_FOUND';

// Helper to normalize strings for comparison (removes accents, lowercase)
const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export const calculateQuote = (
  input: QuoteInput,
  allServices: Service[],
  allZones: Zone[],
  allPostalCodes: PostalCode[],
  discountRules: DiscountRule[]
): CalculateQuoteResult | null => {
  if (input.items.length === 0) return null;

  const moneda = input.pais === 'AR' ? 'ARS' : 'Bs';
  
  const services = allServices.filter(s => s.pais === input.pais);
  const zones = allZones.filter(z => z.pais === input.pais);
  const postalCodes = allPostalCodes.filter(pc => pc.pais === input.pais);

  // 2. Find Zone Information
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

  // Handle case for Bolivia with no location provided
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

  // 3. Calculate initial base price for each item
  let itemsResult: QuoteItemResult[] = [];
  let workloadSubtotal = 0;

  for (const item of input.items) {
      const service = services.find(s => s.servicio_id === item.serviceId);
      if (!service) return 'SERVICE_NOT_FOUND';

      let basePrice = 0;
      if (service.unidad === ServiceUnit.M2) {
        // We still respect individual service minimums if defined in the Services sheet (e.g. for carpets)
        basePrice = Math.max(service.min_cargo || 0, (service.tasa_m2 || 0) * item.quantity);
      } else {
        basePrice = service.precio_base * item.quantity;
      }
      itemsResult.push({ service, quantity: item.quantity, basePrice });
  }

  // 4. Apply Special Calculation Rules (Item Bundling)
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

  // 5. Apply Promotions & Discounts
  let priceAfterDiscount = workloadSubtotal;
  let appliedDiscount: AppliedDiscount | null = null;
  let promoApplied = false;

  // --- 5.1 Dynamic Category Rules (From Google Sheet 'Discounts' Tab) ---
  if (input.paymentMethod === 'cash_transfer') {
      // Filter active rules for this country OR Global ('ALL')
      const activeRules = discountRules.filter(r => 
        (r.pais === input.pais || r.pais === 'ALL') && r.active
      );

      // Sort by highest discount first to give the best applicable deal
      activeRules.sort((a, b) => b.discount_pct - a.discount_pct);
      
      for (const rule of activeRules) {
          const categoryName = rule.category;
          let itemsInCat: QuoteItemResult[] = [];

          if (normalize(categoryName) === 'general') {
             // General applies to all items except specific exclusions (Estetica usually excluded from general promos)
             itemsInCat = itemsResult.filter(ir => ir.service.categoria !== ServiceCategory.ESTETICA_VEHICULAR);
          } else {
             itemsInCat = itemsResult.filter(ir => 
                 normalize(ir.service.categoria) === normalize(categoryName)
             );
          }
          
          // Count total QUANTITY (e.g. 6 chairs), not just line items
          const count = itemsInCat.reduce((sum, item) => sum + item.quantity, 0);

          if (count >= rule.min_qty) {
              const catSubtotal = itemsInCat.reduce((sum, item) => sum + item.basePrice, 0);
              const discountAmount = catSubtotal * rule.discount_pct;
              
              priceAfterDiscount = workloadSubtotal - discountAmount;
              appliedDiscount = { 
                  type: 'PROMO', 
                  description: rule.description || `${rule.discount_pct * 100}% OFF en ${categoryName}`, 
                  amount: discountAmount, 
                  pct: rule.discount_pct 
              };
              promoApplied = true;
              break; // Apply the first matching rule (highest priority)
          }
      }
  }

  // --- 5.2 Check Zone Discounts (if no promo applied) ---
  // Note: All hardcoded value-based rules (like carpets > 50k) have been removed.
  // Zone discounts are now the only fallback.
  if (!appliedDiscount) {
    const eligibleItems = itemsResult.filter(item => item.service.categoria !== ServiceCategory.ESTETICA_VEHICULAR);
    const eligibleSubtotal = eligibleItems.reduce((sum, item) => sum + item.basePrice, 0);
    const nonEligibleSubtotal = workloadSubtotal - eligibleSubtotal;

    if (baseZone.general_discount_pct > 0) {
        const discountAmount = eligibleSubtotal * baseZone.general_discount_pct;
        priceAfterDiscount = (eligibleSubtotal - discountAmount) + nonEligibleSubtotal;
        appliedDiscount = { type: 'ZONE_GENERAL', description: `${baseZone.general_discount_pct * 100}% Descuento General Zona`, amount: discountAmount, pct: baseZone.general_discount_pct };
    } 
    // Legacy hardcoded '2+ items zone discount' removed. 
    // Use 'GENERAL' rule in Google Sheets to replace it if needed.
  }

  // 6. Final Price
  const finalPrice = priceAfterDiscount;

  // We keep min/max in the interface to avoid type breaking, but they are now just the final price.
  const min = finalPrice;
  const max = finalPrice;

  // 7. Generate Summary and Details
  const serviceList = itemsResult.map(i => i.service.subservicio).join(', ');
  const locationForSummary = baseZone.ciudad === 'General' ? 'Bolivia' : baseZone.ciudad;
  
  // Helper for currency formatting
  const formatter = new Intl.NumberFormat(input.pais === 'AR' ? 'es-AR' : 'es-BO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
  });

  const summary = `Cotización para ${serviceList} en ${locationForSummary}: ${moneda} ${formatter.format(finalPrice)}. Valor final sujeto a confirmación in situ.`;
  
  const notes: string[] = [];

  return {
    min,
    max,
    detail: {
      workloadSubtotal,
      appliedDiscount,
      priceAfterDiscount,
      finalPrice,
      zoneId: baseZone.zone_id,
      moneda: moneda,
      operaryName: baseZone.operary_name,
      items: itemsResult,
    },
    notes,
    summary
  };
};
