import { Zone, PostalCode, Service, ServiceUnit, ServiceCategory } from '../types';

export const ZONAS: Zone[] = [
  // --- ARGENTINA ---
  // Zonas SIN DESCUENTO
  { id: 1, zone_id: 'CABA', pais: 'AR', provincia: 'Buenos Aires', ciudad: 'CABA', general_discount_pct: 0, active: true },
  { id: 2, zone_id: 'BUENOS_AIRES_ZONA_SUR', pais: 'AR', provincia: 'Buenos Aires', ciudad: 'Buenos Aires zona sur', general_discount_pct: 0, active: true },
  { id: 3, zone_id: 'BUENOS_AIRES_ZONA_NORTE', pais: 'AR', provincia: 'Buenos Aires', ciudad: 'Buenos Aires zona norte', general_discount_pct: 0, active: true },
  { id: 4, zone_id: 'BUENOS_AIRES_ZONA_OESTE', pais: 'AR', provincia: 'Buenos Aires', ciudad: 'Buenos Aires zona oeste', general_discount_pct: 0, active: true },
  { id: 5, zone_id: 'BARDA_DEL_MEDIO', pais: 'AR', provincia: 'Río Negro', ciudad: 'Barda del Medio', general_discount_pct: 0, active: true },
  { id: 6, zone_id: 'RIO_NEGRO', pais: 'AR', provincia: 'Río Negro', ciudad: 'Río Negro', general_discount_pct: 0, active: true },
  { id: 7, zone_id: 'RIO_GALLEGOS', pais: 'AR', provincia: 'Santa Cruz', ciudad: 'Río Gallegos', general_discount_pct: 0, active: true },
  { id: 8, zone_id: 'ZARATE_Y_CAMPANA', pais: 'AR', provincia: 'Buenos Aires', ciudad: 'Zárate y Campana', general_discount_pct: 0, active: true },
  { id: 9, zone_id: 'GENERAL_ROCA', pais: 'AR', provincia: 'Río Negro', ciudad: 'General Roca', general_discount_pct: 0, active: true },
  { id: 10, zone_id: 'NEUQUEN', pais: 'AR', provincia: 'Neuquén', ciudad: 'Neuquén', general_discount_pct: 0, active: true },
  { id: 11, zone_id: 'BARILOCHE', pais: 'AR', provincia: 'Río Negro', ciudad: 'Bariloche', general_discount_pct: 0, active: true },
  { id: 12, zone_id: 'TANDIL', pais: 'AR', provincia: 'Buenos Aires', ciudad: 'Tandil', general_discount_pct: 0, active: true },
  { id: 13, zone_id: 'PARTIDO_DE_LA_COSTA', pais: 'AR', provincia: 'Buenos Aires', ciudad: 'Partido de la Costa', general_discount_pct: 0, active: true },
  { id: 14, zone_id: 'NECOCHEA_Y_QUEQUEN', pais: 'AR', provincia: 'Buenos Aires', ciudad: 'Necochea y Quequén', general_discount_pct: 0, active: true },
  { id: 15, zone_id: 'VIEDMA_Y_CARMEN_DE_PATAGONES', pais: 'AR', provincia: 'Río Negro', ciudad: 'Viedma y Carmen de Patagones', general_discount_pct: 0, active: true },
  { id: 16, zone_id: 'SAN_NICOLAS_DE_LOS_ARROYOS', pais: 'AR', provincia: 'Buenos Aires', ciudad: 'San Nicolás de los Arroyos', general_discount_pct: 0, active: true },
  { id: 17, zone_id: 'EL_CALAFATE', pais: 'AR', provincia: 'Santa Cruz', ciudad: 'El Calafate', general_discount_pct: 0, active: true },
  { id: 18, zone_id: 'COMODORO_RIVADAVIA', pais: 'AR', provincia: 'Chubut', ciudad: 'Comodoro Rivadavia', general_discount_pct: 0, active: true },
  { id: 19, zone_id: 'PUERTO_MADRYN', pais: 'AR', provincia: 'Chubut', ciudad: 'Puerto Madryn', general_discount_pct: 0, active: true },
  { id: 20, zone_id: 'LOBERIA', pais: 'AR', provincia: 'Buenos Aires', ciudad: 'Lobería', general_discount_pct: 0, active: true },
  { id: 21, zone_id: 'VILLA_GESELL_Y_PINAMAR', pais: 'AR', provincia: 'Buenos Aires', ciudad: 'Villa Gesell y Pinamar', general_discount_pct: 0, active: true },
  
  // Zonas CON DESCUENTO GENERAL 10%
  { id: 22, zone_id: 'MAR_DEL_PLATA', pais: 'AR', provincia: 'Buenos Aires', ciudad: 'Mar del Plata', general_discount_pct: 0.10, active: true },
  { id: 23, zone_id: 'CORRIENTES', pais: 'AR', provincia: 'Corrientes', ciudad: 'Corrientes', general_discount_pct: 0.10, active: true },
  { id: 24, zone_id: 'SALTA', pais: 'AR', provincia: 'Salta', ciudad: 'Salta', general_discount_pct: 0.10, active: true },
  { id: 25, zone_id: 'MENDOZA', pais: 'AR', provincia: 'Mendoza', ciudad: 'Mendoza', general_discount_pct: 0.10, active: true },
  { id: 26, zone_id: 'TUCUMAN', pais: 'AR', provincia: 'Tucumán', ciudad: 'Tucumán', general_discount_pct: 0.10, active: true },
  { id: 27, zone_id: 'BAHIA_BLANCA', pais: 'AR', provincia: 'Buenos Aires', ciudad: 'Bahía Blanca', general_discount_pct: 0.10, active: true },
  { id: 28, zone_id: 'LA_PLATA', pais: 'AR', provincia: 'Buenos Aires', ciudad: 'La Plata', general_discount_pct: 0.10, active: true },
  { id: 29, zone_id: 'RESISTENCIA', pais: 'AR', provincia: 'Chaco', ciudad: 'Resistencia', general_discount_pct: 0.10, active: true },
  { id: 30, zone_id: 'CORDOBA', pais: 'AR', provincia: 'Córdoba', ciudad: 'Córdoba', general_discount_pct: 0.10, active: true },
  { id: 31, zone_id: 'RIO_CUARTO', pais: 'AR', provincia: 'Córdoba', ciudad: 'Río Cuarto', general_discount_pct: 0.10, active: true },
  { id: 32, zone_id: 'PARANA', pais: 'AR', provincia: 'Entre Ríos', ciudad: 'Paraná', general_discount_pct: 0.10, active: true },
  { id: 33, zone_id: 'SANTA_FE', pais: 'AR', provincia: 'Santa Fe', ciudad: 'Santa Fe', general_discount_pct: 0.10, active: true },
  { id: 34, zone_id: 'POSADAS', pais: 'AR', provincia: 'Misiones', ciudad: 'Posadas', general_discount_pct: 0.10, active: true },
  { id: 35, zone_id: 'SANTIAGO_DEL_ESTERO', pais: 'AR', provincia: 'Santiago del Estero', ciudad: 'Santiago del Estero', general_discount_pct: 0.10, active: true },
  { id: 36, zone_id: 'TRELEW_Y_RAWSON', pais: 'AR', provincia: 'Chubut', ciudad: 'Trelew y Rawson', general_discount_pct: 0.10, active: true },
  { id: 37, zone_id: 'SAN_JUAN', pais: 'AR', provincia: 'San Juan', ciudad: 'San Juan', general_discount_pct: 0.10, active: true },
  { id: 38, zone_id: 'SAN_SALVADOR_DE_JUJUY', pais: 'AR', provincia: 'Jujuy', ciudad: 'San Salvador de Jujuy', general_discount_pct: 0.10, active: true },
  { id: 39, zone_id: 'SAN_LUIS', pais: 'AR', provincia: 'San Luis', ciudad: 'San Luis', general_discount_pct: 0.10, active: true },
  { id: 40, zone_id: 'FORMOSA', pais: 'AR', provincia: 'Formosa', ciudad: 'Formosa', general_discount_pct: 0.10, active: true },
  { id: 41, zone_id: 'SAN_RAFAEL', pais: 'AR', provincia: 'Mendoza', ciudad: 'San Rafael', general_discount_pct: 0.10, active: true },
  { id: 42, zone_id: 'LA_RIOJA', pais: 'AR', provincia: 'La Rioja', ciudad: 'La Rioja', general_discount_pct: 0.10, active: true },
  { id: 43, zone_id: 'CARLOS_PAZ', pais: 'AR', provincia: 'Córdoba', ciudad: 'Carlos Paz', general_discount_pct: 0.10, active: true },
  { id: 44, zone_id: 'VALLE_DE_PUNILLA', pais: 'AR', provincia: 'Córdoba', ciudad: 'Valle de Punilla', general_discount_pct: 0.10, active: true },
  { id: 45, zone_id: 'CONCEPCION_DEL_URUGUAY', pais: 'AR', provincia: 'Entre Ríos', ciudad: 'Concepción del Uruguay', general_discount_pct: 0.10, active: true },
  { id: 46, zone_id: 'SAN_FERNANDO_DEL_VALLE_DE_CATAMARCA', pais: 'AR', provincia: 'Catamarca', ciudad: 'San Fernando del Valle de Catamarca', general_discount_pct: 0.10, active: true },
  { id: 47, zone_id: 'LAGUNA_LARGA_PILAR_RIO_SEGUNDO', pais: 'AR', provincia: 'Córdoba', ciudad: 'Laguna Larga, Pilar y Río Segundo', general_discount_pct: 0.10, active: true },
  { id: 48, zone_id: 'URDINARRAIN_GUALEGUAY_GUALEGUAYCHU_ROSARIO_DEL_TALA', pais: 'AR', provincia: 'Entre Ríos', ciudad: 'Urdinarrain, Gualeguay, Gualeguaychú, Rosario del Talá', general_discount_pct: 0.10, active: true },
  { id: 49, zone_id: 'BALCARCE', pais: 'AR', provincia: 'Buenos Aires', ciudad: 'Balcarce', general_discount_pct: 0.10, active: true },
  { id: 50, zone_id: 'FUNES_Y_ROSARIO', pais: 'AR', provincia: 'Santa Fe', ciudad: 'Funes y Rosario', general_discount_pct: 0.10, active: true },

  // --- BOLIVIA ---
  // Zonas CON DESCUENTO GENERAL 10%
  { id: 101, zone_id: 'LA_PAZ_BO', pais: 'BO', provincia: 'La Paz', ciudad: 'La Paz (Bolivia)', general_discount_pct: 0.10, active: true },
];

export const POSTAL_CODES: PostalCode[] = [
  // Argentina - Some examples remain for CP-based lookup
  { id: 1, pais: 'AR', cp_from: '1000', cp_to: '1499', zone_id: 'CABA' },
  { id: 2, pais: 'AR', cp_from: '1800', cp_to: '1999', zone_id: 'BUENOS_AIRES_ZONA_SUR' },
  { id: 3, pais: 'AR', cp_from: '1900', cp_to: '1999', zone_id: 'LA_PLATA' },
  { id: 4, pais: 'AR', cp_from: '7600', cp_to: '7699', zone_id: 'MAR_DEL_PLATA' },
  { id: 5, pais: 'AR', cp_from: '5000', cp_to: '5099', zone_id: 'CORDOBA' },
  
  // Bolivia (CPs are less standardized, so location is primarily by city/province)
  { id: 101, pais: 'BO', cp_from: '2000', cp_to: '2999', zone_id: 'LA_PAZ_BO' },
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