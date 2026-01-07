import { Service, Zone, PostalCode, ServiceCategory, ServiceUnit, Pais, Moneda, DiscountRule } from '../types';

export const parseCSV = (text: string): any[] => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  if (lines.length < 2) return [];

  // Parse headers
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

  return lines.slice(1).map(line => {
    // Basic CSV splitting that handles quotes slightly better, though GVIZ output is usually clean
    const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(val => val.trim().replace(/^"|"$/g, ''));
    
    const entry: any = {};
    headers.forEach((header, index) => {
      // Clean header key just in case
      const cleanHeader = header.trim();
      entry[cleanHeader] = values[index];
    });
    return entry;
  });
};

const normalizeUnit = (raw: string): ServiceUnit => {
    const lower = raw?.toLowerCase() || '';
    if (lower.includes('m2') || lower.includes('metro')) return ServiceUnit.M2;
    if (lower.includes('pieza')) return ServiceUnit.PIEZA;
    return ServiceUnit.UNIDAD;
};

export const mapServices = (rawRows: any[]): Service[] => {
  return rawRows.map((row, index) => ({
    id: index,
    servicio_id: row.servicio_id,
    pais: (row.pais as Pais) || 'AR',
    moneda: (row.moneda as Moneda) || 'ARS',
    servicio: row.servicio,
    subservicio: row.tipo || row.subservicio, // Map 'tipo' to 'subservicio'
    categoria: row.categoria as ServiceCategory,
    unidad: normalizeUnit(row.tipo_de_precio || row.unidad), // Map 'tipo_de_precio'
    precio_base: parseFloat(row.precio_base) || 0,
    // If diferencial_id is missing in sheet, it remains undefined. Logic might rely on Extras names.
    diferencial_id: row.diferencial_id === 'undefined' || row.diferencial_id === '' ? undefined : row.diferencial_id,
    notas: row.notas,
    active: (row.active === 'TRUE' || row.active === 'true' || row.active === 'VERDADERO'),
    tasa_m2: row.tasa_m2 ? parseFloat(row.tasa_m2) : undefined,
    min_cargo: row.min_cargo ? parseFloat(row.min_cargo) : undefined,
  })).filter(s => s.servicio_id);
};

export const mapExtras = (rawRows: any[]): Service[] => {
    return rawRows.map((row, index) => {
        // Robust checking for column names (Case insensitive fallback)
        const nombre = row.Nombre || row.nombre || row.subservicio || 'Extra sin nombre';
        const categoria = row.Categoria_base || row.categoria_base || row.categoria || 'Otros';
        const precio = row.Precio || row.precio || row.precio_base || 0;
        const codigo = row.Codigo_extra || row.codigo_extra || `extra_${index}`;
        const activo = row.Activo || row.active || row.activo;
        const nota = row.Nota || row.nota || row.notas;

        return {
            id: 10000 + index, 
            servicio_id: codigo,
            pais: 'AR' as Pais, 
            moneda: 'ARS' as Moneda, 
            servicio: 'Extra', 
            subservicio: nombre,
            categoria: categoria.trim() as ServiceCategory, // Ensure no trailing spaces
            unidad: ServiceUnit.UNIDAD,
            precio_base: parseFloat(precio) || 0,
            active: (activo === 'TRUE' || activo === 'true' || activo === 'VERDADERO'),
            notas: nota
        };
    }).filter(e => e.servicio_id);
};

export const mapZones = (rawRows: any[]): Zone[] => {
  return rawRows.map((row, index) => ({
    id: index,
    zone_id: row.zone_id,
    pais: (row.pais as Pais) || 'AR',
    provincia: row.provincia,
    ciudad: row.ciudad,
    // Map 'ajuste_de_precio' to 'general_discount_pct'
    general_discount_pct: parseFloat(row.ajuste_de_precio) || 0,
    active: (row.active === 'TRUE' || row.active === 'true' || row.active === 'VERDADERO'),
    operary_name: row.nombre_operario,
  })).filter(z => z.zone_id);
};

export const mapPostalCodes = (rawRows: any[]): PostalCode[] => {
  return rawRows.map((row, index) => ({
    id: index,
    pais: (row.pais as Pais) || 'AR',
    cp_from: row.cp_from,
    cp_to: row.cp_to,
    zone_id: row.zone_id,
  })).filter(p => p.zone_id);
};

export const mapDiscounts = (rawRows: any[]): DiscountRule[] => {
    return rawRows.map((row, index) => ({
        id: index,
        pais: row.pais || 'AR',
        category: row.category,
        min_qty: parseInt(row.min_qty) || 0,
        discount_pct: parseFloat(row.discount_pct) || 0,
        active: (row.active === 'TRUE' || row.active === 'true' || row.active === 'VERDADERO'),
        description: row.description
    })).filter(d => d.category && d.min_qty > 0);
};