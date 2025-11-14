import { Zone, PostalCode, Service, ServiceUnit, ServiceCategory } from '../types';

export const ZONAS: Zone[] = [
  // Argentina - SIN DESCUENTO GENERAL
  { id: 1, zone_id: 'CABA', pais: 'AR', provincia: 'Buenos Aires', ciudad: 'CABA', general_discount_pct: 0, active: true },
  { id: 2, zone_id: 'ZONA_SUR', pais: 'AR', provincia: 'Buenos Aires', ciudad: 'Zona Sur', general_discount_pct: 0, active: true },
  { id: 3, zone_id: 'ZONA_NORTE_Y_OESTE', pais: 'AR', provincia: 'Buenos Aires', ciudad: 'Zona Norte y Oeste', general_discount_pct: 0, active: true },
  { id: 48, zone_id: 'NEUQUEN', pais: 'AR', provincia: 'Neuquén', ciudad: 'Neuquén', general_discount_pct: 0, active: true },
  { id: 52, zone_id: 'BARILOCHE', pais: 'AR', provincia: 'Río Negro', ciudad: 'San Carlos de Bariloche', general_discount_pct: 0, active: true },

  // Argentina - CON DESCUENTO GENERAL 10%
  { id: 5, zone_id: 'MAR_DEL_PLATA', pais: 'AR', provincia: 'Buenos Aires', ciudad: 'Mar del Plata', general_discount_pct: 0.10, active: true, operary_name: 'Juan Perez' },
  { id: 4, zone_id: 'LA_PLATA', pais: 'AR', provincia: 'Buenos Aires', ciudad: 'La Plata', general_discount_pct: 0.10, active: true },
  { id: 44, zone_id: 'MENDOZA', pais: 'AR', provincia: 'Mendoza', ciudad: 'Mendoza', general_discount_pct: 0.10, active: true },
  { id: 25, zone_id: 'CORDOBA_CAPITAL', pais: 'AR', provincia: 'Córdoba', ciudad: 'Córdoba Capital', general_discount_pct: 0.10, active: true },

  // Bolivia - Zonas de ejemplo (asumiendo 10% de descuento)
  { id: 101, zone_id: 'LA_PAZ', pais: 'BO', provincia: 'La Paz', ciudad: 'La Paz', general_discount_pct: 0.10, active: true },
  { id: 102, zone_id: 'SANTA_CRUZ', pais: 'BO', provincia: 'Santa Cruz', ciudad: 'Santa Cruz de la Sierra', general_discount_pct: 0.10, active: true },
];

export const POSTAL_CODES: PostalCode[] = [
  // Argentina
  { id: 1, pais: 'AR', cp_from: '1000', cp_to: '1499', zone_id: 'CABA' },
  { id: 2, pais: 'AR', cp_from: '1800', cp_to: '1999', zone_id: 'ZONA_SUR' },
  { id: 3, pais: 'AR', cp_from: '1500', cp_to: '1799', zone_id: 'ZONA_NORTE_Y_OESTE' },
  { id: 4, pais: 'AR', cp_from: '1900', cp_to: '1999', zone_id: 'LA_PLATA' },
  { id: 5, pais: 'AR', cp_from: '7600', cp_to: '7699', zone_id: 'MAR_DEL_PLATA' },
  { id: 25, pais: 'AR', cp_from: '5000', cp_to: '5099', zone_id: 'CORDOBA_CAPITAL' },
  
  // Bolivia (CPs son menos estandarizados, usando rangos de ejemplo)
  { id: 101, pais: 'BO', cp_from: '2000', cp_to: '2999', zone_id: 'LA_PAZ' },
  { id: 102, pais: 'BO', cp_from: '3000', cp_to: '3999', zone_id: 'SANTA_CRUZ' },
];

export const SERVICIOS: Service[] = [
    // --- ARGENTINA (ARS) ---

    // VEHÍCULOS - PLANES
    { id: 1, servicio_id: 'veh_std_basico_ar', pais: 'AR', moneda: 'ARS', servicio: 'Auto Standard', subservicio: 'Plan Básico', categoria: ServiceCategory.VEHICULOS, unidad: ServiceUnit.UNIDAD, precio_base: 37999, active: true },
    { id: 2, servicio_id: 'veh_std_promo_a_ar', pais: 'AR', moneda: 'ARS', servicio: 'Auto Standard', subservicio: 'Promo A (butacas+traseras+techo/baúl)', categoria: ServiceCategory.VEHICULOS, unidad: ServiceUnit.UNIDAD, precio_base: 46999, notas: 'Es PROMO. No combinar con descuento de zona.', active: true },
    { id: 3, servicio_id: 'veh_std_tutto_ar', pais: 'AR', moneda: 'ARS', servicio: 'Auto Standard', subservicio: 'Plan Tutto', categoria: ServiceCategory.VEHICULOS, unidad: ServiceUnit.UNIDAD, precio_base: 73999, active: true },
    { id: 4, servicio_id: 'veh_suv_basico_ar', pais: 'AR', moneda: 'ARS', servicio: 'SUV hasta 5pax', subservicio: 'Plan Básico', categoria: ServiceCategory.VEHICULOS, unidad: ServiceUnit.UNIDAD, precio_base: 40999, active: true },
    { id: 5, servicio_id: 'veh_suv_tutto_ar', pais: 'AR', moneda: 'ARS', servicio: 'SUV hasta 5pax', subservicio: 'Plan Tutto', categoria: ServiceCategory.VEHICULOS, unidad: ServiceUnit.UNIDAD, precio_base: 76999, active: true },

    // VEHÍCULOS - ÍTEMS AISLADOS
    { id: 100, servicio_id: 'aislado_butaca_delantera_ar', pais: 'AR', moneda: 'ARS', servicio: 'Ítems Aislados Vehículo', subservicio: 'Butacas delanteras', categoria: ServiceCategory.VEHICULOS_AISLADOS, unidad: ServiceUnit.UNIDAD, precio_base: 34000, diferencial_id: 'dif_std_ar', active: true },
    { id: 101, servicio_id: 'aislado_asiento_trasero_ar', pais: 'AR', moneda: 'ARS', servicio: 'Ítems Aislados Vehículo', subservicio: 'Asiento trasero', categoria: ServiceCategory.VEHICULOS_AISLADOS, unidad: ServiceUnit.UNIDAD, precio_base: 32000, diferencial_id: 'dif_std_ar', active: true },
    { id: 102, servicio_id: 'aislado_piso_std_suv_ar', pais: 'AR', moneda: 'ARS', servicio: 'Ítems Aislados Vehículo', subservicio: 'Piso (Auto/SUV)', categoria: ServiceCategory.VEHICULOS_AISLADOS, unidad: ServiceUnit.UNIDAD, precio_base: 26000, diferencial_id: 'dif_std_ar', active: true },
    { id: 103, servicio_id: 'aislado_piso_7asientos_ar', pais: 'AR', moneda: 'ARS', servicio: 'Ítems Aislados Vehículo', subservicio: 'Piso (7 asientos)', categoria: ServiceCategory.VEHICULOS_AISLADOS, unidad: ServiceUnit.UNIDAD, precio_base: 30000, diferencial_id: 'dif_7asientos_ar', active: true },
    { id: 104, servicio_id: 'aislado_techo_std_suv_ar', pais: 'AR', moneda: 'ARS', servicio: 'Ítems Aislados Vehículo', subservicio: 'Techo (Auto/SUV)', categoria: ServiceCategory.VEHICULOS_AISLADOS, unidad: ServiceUnit.UNIDAD, precio_base: 28000, diferencial_id: 'dif_std_ar', active: true },

    // VEHÍCULOS - DIFERENCIALES (usados por la regla de ítems aislados)
    { id: 150, servicio_id: 'dif_std_ar', pais: 'AR', moneda: 'ARS', servicio: 'Diferencial', subservicio: 'Estándar/SUV/Cab. doble', categoria: ServiceCategory.OTROS, unidad: ServiceUnit.UNIDAD, precio_base: 9000, active: false },
    { id: 151, servicio_id: 'dif_7asientos_ar', pais: 'AR', moneda: 'ARS', servicio: 'Diferencial', subservicio: '7 asientos', categoria: ServiceCategory.OTROS, unidad: ServiceUnit.UNIDAD, precio_base: 11000, active: false },
    { id: 152, servicio_id: 'dif_8a12asientos_ar', pais: 'AR', moneda: 'ARS', servicio: 'Diferencial', subservicio: '8 a 12 asientos', categoria: ServiceCategory.OTROS, unidad: ServiceUnit.UNIDAD, precio_base: 15000, active: false },
    
    // TAPIZADOS (Sillones)
    { id: 200, servicio_id: 'sillon_1c_ar', pais: 'AR', moneda: 'ARS', servicio: 'Sillones', subservicio: '1 cuerpo', categoria: ServiceCategory.TAPIZADOS, unidad: ServiceUnit.PIEZA, precio_base: 34999, active: true },
    { id: 201, servicio_id: 'sillon_2c_ar', pais: 'AR', moneda: 'ARS', servicio: 'Sillones', subservicio: '2 cuerpos', categoria: ServiceCategory.TAPIZADOS, unidad: ServiceUnit.PIEZA, precio_base: 49999, active: true },
    { id: 202, servicio_id: 'sillon_3c_ar', pais: 'AR', moneda: 'ARS', servicio: 'Sillones', subservicio: '3 cuerpos', categoria: ServiceCategory.TAPIZADOS, unidad: ServiceUnit.PIEZA, precio_base: 54999, active: true },
    { id: 203, servicio_id: 'promo_juego_sillones_ar', pais: 'AR', moneda: 'ARS', servicio: 'Sillones', subservicio: 'Promo Juego de Sillones', categoria: ServiceCategory.TAPIZADOS, unidad: ServiceUnit.PIEZA, precio_base: 0, notas: 'Promo 15% OFF. Precio se calcula sobre ítems.', active: true },

    // COLCHONES
    { id: 300, servicio_id: 'colchon_1p_ar', pais: 'AR', moneda: 'ARS', servicio: 'Colchones', subservicio: '1 plaza', categoria: ServiceCategory.COLCHONES, unidad: ServiceUnit.PIEZA, precio_base: 31999, active: true },
    { id: 301, servicio_id: 'colchon_2p_ar', pais: 'AR', moneda: 'ARS', servicio: 'Colchones', subservicio: '2 plazas', categoria: ServiceCategory.COLCHONES, unidad: ServiceUnit.PIEZA, precio_base: 41999, active: true },
    { id: 302, servicio_id: 'colchon_base_ar', pais: 'AR', moneda: 'ARS', servicio: 'Colchones', subservicio: 'Adicional Base de sommier', categoria: ServiceCategory.COLCHONES, unidad: ServiceUnit.PIEZA, precio_base: 25000, active: true },
    
    // ALFOMBRAS
    { id: 400, servicio_id: 'alfombra_corto_ar', pais: 'AR', moneda: 'ARS', servicio: 'Alfombras', subservicio: 'Pelo Corto', categoria: ServiceCategory.ALFOMBRAS, unidad: ServiceUnit.M2, precio_base: 0, tasa_m2: 8000, min_cargo: 0, notas: 'Aplica 8% si total > $50.000', active: true },
    { id: 401, servicio_id: 'alfombra_largo_ar', pais: 'AR', moneda: 'ARS', servicio: 'Alfombras', subservicio: 'Pelo Largo', categoria: ServiceCategory.ALFOMBRAS, unidad: ServiceUnit.M2, precio_base: 0, tasa_m2: 9000, min_cargo: 0, notas: 'Aplica 8% si total > $50.000', active: true },
    
    // BEBÉ
    { id: 500, servicio_id: 'bebe_coche_ar', pais: 'AR', moneda: 'ARS', servicio: 'Artículos de Bebé', subservicio: 'Coche de bebé', categoria: ServiceCategory.BEBE, unidad: ServiceUnit.PIEZA, precio_base: 29999, active: true },
    { id: 501, servicio_id: 'bebe_huevito_ar', pais: 'AR', moneda: 'ARS', servicio: 'Artículos de Bebé', subservicio: 'Huevito de bebé', categoria: ServiceCategory.BEBE, unidad: ServiceUnit.PIEZA, precio_base: 26999, active: true },
    { id: 502, servicio_id: 'bebe_promo_ar', pais: 'AR', moneda: 'ARS', servicio: 'Artículos de Bebé', subservicio: 'Promo 2+ artículos', categoria: ServiceCategory.BEBE, unidad: ServiceUnit.PIEZA, precio_base: 0, notas: 'Promo 20% OFF. Precio se calcula sobre ítems.', active: true },

    // ESTÉTICA VEHICULAR (No aplica descuento de zona)
    { id: 600, servicio_id: 'estetica_motor_vapor_ar', pais: 'AR', moneda: 'ARS', servicio: 'Lavado de Motor a Vapor', subservicio: 'Auto standard', categoria: ServiceCategory.ESTETICA_VEHICULAR, unidad: ServiceUnit.UNIDAD, precio_base: 39999, active: true },
    { id: 601, servicio_id: 'estetica_pulido_opticas_ar', pais: 'AR', moneda: 'ARS', servicio: 'Pulido de Ópticas', subservicio: 'El par', categoria: ServiceCategory.ESTETICA_VEHICULAR, unidad: ServiceUnit.UNIDAD, precio_base: 39999, active: true },

    // --- BOLIVIA (Bs) ---

    // VEHÍCULOS - PLANES
    { id: 1001, servicio_id: 'veh_std_basico_bo', pais: 'BO', moneda: 'Bs', servicio: 'Auto Standard', subservicio: 'Plan Básico', categoria: ServiceCategory.VEHICULOS, unidad: ServiceUnit.UNIDAD, precio_base: 204, active: true },
    { id: 1002, servicio_id: 'veh_std_tutto_bo', pais: 'BO', moneda: 'Bs', servicio: 'Auto Standard', subservicio: 'Plan Tutto', categoria: ServiceCategory.VEHICULOS, unidad: ServiceUnit.UNIDAD, precio_base: 372, active: true },
    
    // TAPIZADOS (Sillones)
    { id: 1200, servicio_id: 'sillon_1c_bo', pais: 'BO', moneda: 'Bs', servicio: 'Sillones', subservicio: '1 cuerpo', categoria: ServiceCategory.TAPIZADOS, unidad: ServiceUnit.PIEZA, precio_base: 156, active: true },
    { id: 1201, servicio_id: 'sillon_2c_bo', pais: 'BO', moneda: 'Bs', servicio: 'Sillones', subservicio: '2 cuerpos', categoria: ServiceCategory.TAPIZADOS, unidad: ServiceUnit.PIEZA, precio_base: 234, active: true },
    
    // COLCHONES
    { id: 1300, servicio_id: 'colchon_1p_bo', pais: 'BO', moneda: 'Bs', servicio: 'Colchones', subservicio: '1 plaza', categoria: ServiceCategory.COLCHONES, unidad: ServiceUnit.PIEZA, precio_base: 140, active: true },
    { id: 1301, servicio_id: 'colchon_2p_bo', pais: 'BO', moneda: 'Bs', servicio: 'Colchones', subservicio: '2 plazas', categoria: ServiceCategory.COLCHONES, unidad: ServiceUnit.PIEZA, precio_base: 193, active: true },
    { id: 1302, servicio_id: 'colchon_base_bo', pais: 'BO', moneda: 'Bs', servicio: 'Colchones', subservicio: 'Adicional Base de sommier', categoria: ServiceCategory.COLCHONES, unidad: ServiceUnit.PIEZA, precio_base: 114, active: true },
    
    // ALFOMBRAS
    { id: 1400, servicio_id: 'alfombra_corto_bo', pais: 'BO', moneda: 'Bs', servicio: 'Alfombras', subservicio: 'Pelo Corto', categoria: ServiceCategory.ALFOMBRAS, unidad: ServiceUnit.M2, precio_base: 0, tasa_m2: 36, min_cargo: 0, notas: 'Aplica 8% si total > Bs 260', active: true },

    // BEBÉ
    { id: 1500, servicio_id: 'bebe_coche_bo', pais: 'BO', moneda: 'Bs', servicio: 'Artículos de Bebé', subservicio: 'Coche de bebé', categoria: ServiceCategory.BEBE, unidad: ServiceUnit.PIEZA, precio_base: 146, active: true },
    { id: 1501, servicio_id: 'bebe_huevito_bo', pais: 'BO', moneda: 'Bs', servicio: 'Artículos de Bebé', subservicio: 'Huevito de bebé', categoria: ServiceCategory.BEBE, unidad: ServiceUnit.PIEZA, precio_base: 125, active: true },

    // ESTÉTICA VEHICULAR (No aplica descuento de zona)
    { id: 1600, servicio_id: 'estetica_lavado_motor_bo', pais: 'BO', moneda: 'Bs', servicio: 'Lavado de Motor', subservicio: 'Auto standard', categoria: ServiceCategory.ESTETICA_VEHICULAR, unidad: ServiceUnit.UNIDAD, precio_base: 182, active: true },
];

// MODIFICADORES have been removed as per the new, simpler pricing rules.
// This array is kept for potential future use but is currently not used by the pricing engine.
export const MODIFICADORES = [];
