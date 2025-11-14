import React, { useState } from 'react';
import { Service, Zone, PostalCode, ServiceUnit, ServiceCategory, Pais, Moneda } from '../types';
import { EditableTable, Column } from './EditableTable';

interface AdminPageProps {
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  zones: Zone[];
  setZones: React.Dispatch<React.SetStateAction<Zone[]>>;
  postalCodes: PostalCode[];
  setPostalCodes: React.Dispatch<React.SetStateAction<PostalCode[]>>;
  onResetData: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ services, setServices, zones, setZones, postalCodes, setPostalCodes, onResetData }) => {
  const [activeTab, setActiveTab] = useState<'services' | 'zones' | 'postalCodes'>('services');

  const tabClass = (isActive: boolean) =>
    `px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
      isActive
        ? 'border-brand-secondary text-brand-primary'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`;
  
  const serviceColumns: Column<Service>[] = [
    { key: 'servicio_id', header: 'ID Servicio', editable: true, type: 'text' },
    { key: 'pais', header: 'País', editable: true, type: 'select', options: [{value: 'AR', label: 'AR'}, {value: 'BO', label: 'BO'}] },
    { key: 'moneda', header: 'Moneda', editable: true, type: 'select', options: [{value: 'ARS', label: 'ARS'}, {value: 'Bs', label: 'Bs'}] },
    { key: 'servicio', header: 'Servicio', editable: true, type: 'text' },
    { key: 'subservicio', header: 'Sub-Servicio', editable: true, type: 'text' },
    { key: 'categoria', header: 'Categoría', editable: true, type: 'select', options: Object.values(ServiceCategory).map(c => ({value: c, label: c})) },
    { key: 'unidad', header: 'Unidad', editable: true, type: 'select', options: Object.values(ServiceUnit).map(u => ({value: u, label: u})) },
    { key: 'precio_base', header: 'Precio/Dif.', editable: true, type: 'number' },
    { key: 'tasa_m2', header: 'Tasa m²', editable: true, type: 'number' },
    { key: 'min_cargo', header: 'Mínimo m²', editable: true, type: 'number' },
    { key: 'active', header: 'Activo', editable: true, type: 'checkbox' },
  ];

  const handleSaveService = (row: Service) => {
    if (!row.servicio_id || !row.servicio || !row.subservicio) {
        alert('ID, Servicio y Sub-Servicio no pueden estar vacíos.');
        return false;
    }
    if (row.id === -1 && services.some(s => s.servicio_id === row.servicio_id)) {
        alert(`El ID de servicio "${row.servicio_id}" ya existe.`);
        return false;
    }
    setServices(prev => {
        if(row.id === -1){
            const newId = Math.max(...prev.map(s => s.id), 0) + 1;
            return [...prev, {...row, id: newId}];
        }
        return prev.map(s => s.id === row.id ? row : s)
    });
    return true;
  };

  const newServiceTemplate: Omit<Service, 'id'> = {
    servicio_id: '',
    pais: 'AR',
    moneda: 'ARS',
    servicio: '',
    subservicio: '',
    categoria: ServiceCategory.OTROS,
    unidad: ServiceUnit.PIEZA,
    precio_base: 0,
    tasa_m2: 0,
    min_cargo: 0,
    active: true,
  };

  const zoneColumns: Column<Zone>[] = [
    { key: 'zone_id', header: 'ID Zona', editable: true, type: 'text' },
    { key: 'pais', header: 'País', editable: true, type: 'select', options: [{value: 'AR', label: 'AR'}, {value: 'BO', label: 'BO'}] },
    { key: 'provincia', header: 'Provincia', editable: true, type: 'text' },
    { key: 'ciudad', header: 'Ciudad', editable: true, type: 'text' },
    { 
      key: 'general_discount_pct', 
      header: 'Descuento (%)', 
      editable: true, 
      type: 'number', 
      render: (row) => `${(row.general_discount_pct * 100).toFixed(0)}%`,
      getEditValue: (row) => row.general_discount_pct * 100,
    },
    { key: 'active', header: 'Activo', editable: true, type: 'checkbox' },
    { key: 'operary_name', header: 'Operario', editable: true, type: 'text' },
  ];

  const handleSaveZone = (row: Zone) => {
    const discountValue = row.general_discount_pct as unknown as number;
    if (discountValue < 0 || discountValue > 30) {
        alert('El descuento de zona debe estar entre 0 y 30%.');
        return false;
    }
    if (!row.zone_id || !row.provincia || !row.ciudad) {
        alert('ID Zona, Provincia y Ciudad son obligatorios.');
        return false;
    }
     if (row.id === -1 && zones.some(z => z.zone_id === row.zone_id)) {
        alert(`El ID de zona "${row.zone_id}" ya existe.`);
        return false;
    }
    setZones(prev => {
        const updatedRow = { ...row, general_discount_pct: discountValue / 100 };
        if(row.id === -1){
            const newId = Math.max(...prev.map(z => z.id), 0) + 1;
            return [...prev, {...updatedRow, id: newId}];
        }
        return prev.map(z => z.id === row.id ? updatedRow : z)
    });
    return true;
  };

  const newZoneTemplate: Omit<Zone, 'id'> = {
    zone_id: '',
    pais: 'AR',
    provincia: '',
    ciudad: '',
    general_discount_pct: 0,
    active: true,
    operary_name: '',
  };

  const zoneOptions = zones.map(z => ({ value: z.zone_id, label: `${z.zone_id} (${z.pais})` }));
  const postalCodeColumns: Column<PostalCode>[] = [
    { key: 'pais', header: 'País', editable: true, type: 'select', options: [{value: 'AR', label: 'AR'}, {value: 'BO', label: 'BO'}] },
    { key: 'cp_from', header: 'CP Desde', editable: true, type: 'text' },
    { key: 'cp_to', header: 'CP Hasta', editable: true, type: 'text' },
    { key: 'zone_id', header: 'ID Zona', editable: true, type: 'select', options: zoneOptions },
  ];

  const handleSavePostalCode = (row: PostalCode) => {
    if (!row.cp_from || !row.cp_to || !row.zone_id) {
        alert('Todos los campos son obligatorios.');
        return false;
    }
    setPostalCodes(prev => {
        if(row.id === -1){
            const newId = Math.max(...prev.map(p => p.id), 0) + 1;
            return [...prev, {...row, id: newId}];
        }
        return prev.map(p => p.id === row.id ? row : p)
    });
    return true;
  };

  const newPostalCodeTemplate: Omit<PostalCode, 'id'> = {
    pais: 'AR',
    cp_from: '',
    cp_to: '',
    zone_id: '',
  };
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
        <nav className="flex space-x-2" aria-label="Tabs">
          <button onClick={() => setActiveTab('services')} className={tabClass(activeTab === 'services')}>Servicios</button>
          <button onClick={() => setActiveTab('zones')} className={tabClass(activeTab === 'zones')}>Ubicaciones</button>
          <button onClick={() => setActiveTab('postalCodes')} className={tabClass(activeTab === 'postalCodes')}>Códigos Postales</button>
        </nav>
        <div>
            <button
                onClick={onResetData}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
            >
                Restablecer Datos
            </button>
        </div>
      </div>
      
      <div>
        {activeTab === 'services' && (
          <EditableTable
            columns={serviceColumns}
            data={services}
            onSaveRow={handleSaveService}
            newRowTemplate={newServiceTemplate}
          />
        )}
        {activeTab === 'zones' && (
          <EditableTable
            columns={zoneColumns}
            data={zones}
            onSaveRow={handleSaveZone}
            newRowTemplate={newZoneTemplate}
          />
        )}
        {activeTab === 'postalCodes' && (
          <EditableTable
            columns={postalCodeColumns}
            data={postalCodes}
            onSaveRow={handleSavePostalCode}
            newRowTemplate={newPostalCodeTemplate}
          />
        )}
      </div>
    </div>
  );
};
