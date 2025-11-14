import React, { useMemo, useState, useEffect } from 'react';
import { QuoteInput, Service, Zone, PostalCode, QuoteItem, Pais } from '../types';

interface InputFormProps {
  input: QuoteInput;
  setInput: React.Dispatch<React.SetStateAction<QuoteInput>>;
  onCalculate: () => void;
  onReset: () => void;
  services: Service[];
  zones: Zone[];
  postalCodes: PostalCode[];
  modifiers: never[]; // Modifiers are deprecated
}

export const InputForm: React.FC<InputFormProps> = ({ input, setInput, onCalculate, onReset, services, zones, postalCodes }) => {
  const [currentItem, setCurrentItem] = useState({ serviceId: '', quantity: 1 });
  const [itemKey, setItemKey] = useState(0);

  // Auto-fill location when CP is entered
  useEffect(() => {
    if (input.cp && input.cp.length >= 3) {
      const cpNum = parseInt(input.cp, 10);
      const postalCodeData = postalCodes.find(pc => {
        const from = parseInt(pc.cp_from, 10);
        const to = parseInt(pc.cp_to, 10);
        return pc.pais === input.pais && cpNum >= from && cpNum <= to;
      });
      if (postalCodeData) {
        const zoneData = zones.find(z => z.zone_id === postalCodeData.zone_id && z.pais === input.pais);
        if (zoneData && (zoneData.provincia !== input.provincia || zoneData.ciudad !== input.ciudad)) {
          setInput(prev => ({ ...prev, provincia: zoneData.provincia, ciudad: zoneData.ciudad }));
        }
      }
    }
  }, [input.cp, input.pais, postalCodes, zones, setInput, input.provincia, input.ciudad]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newPais = e.target.value as Pais;
      // Reset everything when country changes
      setInput({
          pais: newPais,
          cp: '',
          provincia: '',
          ciudad: '',
          items: [],
          paymentMethod: 'cash_transfer'
      });
      setCurrentItem({ serviceId: '', quantity: 1 });
      setItemKey(0);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'provincia') {
      setInput(prev => ({ ...prev, provincia: value, ciudad: '', cp: '' }));
    } else if (name === 'ciudad') {
      setInput(prev => ({ ...prev, ciudad: value, cp: '' }));
    } else { // CP
      setInput(prev => ({ ...prev, [name]: value, provincia: '', ciudad: '' }));
    }
  };
  
  const handleAddItem = () => {
      if (!currentItem.serviceId || currentItem.quantity <= 0) {
          alert("Por favor, seleccione un servicio y una cantidad válida.");
          return;
      }
      const newItem: QuoteItem = { ...currentItem, key: itemKey };
      setItemKey(prev => prev + 1);
      setInput(prev => ({ ...prev, items: [...prev.items, newItem]}));
      setCurrentItem({ serviceId: '', quantity: 1 }); // Reset for next item
  };

  const handleRemoveItem = (keyToRemove: number) => {
      setInput(prev => ({
          ...prev,
          items: prev.items.filter(item => item.key !== keyToRemove)
      }));
  };

  const groupedServices = useMemo(() => {
    return services.reduce((acc: Record<string, Service[]>, service) => {
      const groupName = service.categoria; // Group by category now
      if (!acc[groupName]) acc[groupName] = [];
      acc[groupName].push(service);
      return acc;
    }, {} as Record<string, Service[]>);
  }, [services]);

  const provinces = useMemo(() => {
    const countryZones = zones.filter(z => z.pais === input.pais);
    return [...new Set(countryZones.map(z => z.provincia))].sort();
  }, [zones, input.pais]);

  const citiesInProvince = useMemo<string[]>(() => {
      if (!input.provincia) return [];
      return zones
        .filter(z => z.pais === input.pais && z.provincia === input.provincia)
        .map(z => z.ciudad)
        .filter((v, i, a) => a.indexOf(v) === i).sort();
  }, [input.provincia, input.pais, zones]);

  const getServiceDetails = (serviceId: string) => services.find(s => s.servicio_id === serviceId);

  return (
    <form onSubmit={(e) => { e.preventDefault(); onCalculate(); }} className="space-y-6">
       <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-brand-primary">Crear Cotización</h2>
        <button type="button" onClick={onReset} className="px-3 py-1 text-sm font-semibold text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">
          Limpiar
        </button>
      </div>
      
      {/* Location Section */}
      <div className="p-4 border border-gray-200 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">1. Ubicación</h3>
        <div>
            <label htmlFor="pais" className="block text-sm font-semibold text-gray-700">País</label>
            <select name="pais" id="pais" value={input.pais} onChange={handleCountryChange} className="mt-1 block w-full select-style">
                <option value="AR">Argentina</option>
                <option value="BO">Bolivia</option>
            </select>
        </div>
        <div>
            <label htmlFor="cp" className="block text-sm font-semibold text-gray-700">Código Postal</label>
            <input type="text" name="cp" id="cp" value={input.cp} onChange={handleLocationChange} className="mt-1 block w-full input-style" placeholder="Ej: 7600" />
        </div>
        <p className="text-center text-xs text-gray-500 font-semibold">O</p>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="provincia" className="block text-sm font-semibold text-gray-700">Provincia</label>
              <select name="provincia" id="provincia" value={input.provincia} onChange={handleLocationChange} className="mt-1 block w-full select-style">
                  <option value="">Seleccione...</option>
                  {provinces.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="ciudad" className="block text-sm font-semibold text-gray-700">Ciudad</label>
              <select name="ciudad" id="ciudad" value={input.ciudad} onChange={handleLocationChange} disabled={!input.provincia} className="mt-1 block w-full select-style disabled:bg-gray-100">
                  <option value="">Seleccione...</option>
                  {citiesInProvince.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
         </div>
      </div>

      {/* Services Section */}
      <div className="p-4 border border-gray-200 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">2. Servicios</h3>
        <div className="flex items-end gap-2">
            <div className="flex-grow">
                <label htmlFor="serviceId" className="block text-sm font-semibold text-gray-700">Servicio</label>
                <select id="serviceId" value={currentItem.serviceId} onChange={e => setCurrentItem(p => ({...p, serviceId: e.target.value}))} className="mt-1 block w-full select-style">
                    <option value="">Seleccione un servicio...</option>
                    {Object.entries(groupedServices).map(([group, serviceItems]: [string, Service[]]) => (
                        <optgroup label={group} key={group}>
                            {serviceItems.map(s => <option key={s.servicio_id} value={s.servicio_id}>{s.servicio} - {s.subservicio}</option>)}
                        </optgroup>
                    ))}
                </select>
            </div>
            <div className="w-24">
                 <label htmlFor="quantity" className="block text-sm font-semibold text-gray-700">Cantidad</label>
                 <input type="number" id="quantity" value={currentItem.quantity} onChange={e => setCurrentItem(p => ({...p, quantity: parseInt(e.target.value, 10) || 1}))} min="1" className="mt-1 block w-full input-style" />
            </div>
            <button type="button" onClick={handleAddItem} className="px-4 py-2 font-bold text-white bg-brand-secondary rounded-md hover:bg-blue-700">+</button>
        </div>
        
        {input.items.length > 0 &&
            <div className="space-y-2 pt-2">
                <h4 className="font-semibold text-gray-600">Items en cotización:</h4>
                {input.items.map(item => {
                    const details = getServiceDetails(item.serviceId);
                    return (
                        <div key={item.key} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                            <p className="text-sm">{details?.subservicio} (x{item.quantity})</p>
                            <button type="button" onClick={() => handleRemoveItem(item.key)} className="text-red-500 hover:text-red-700 text-xs font-bold">QUITAR</button>
                        </div>
                    );
                })}
            </div>
        }
      </div>

      {/* Payment and Submit Section */}
      <div className="p-4 border border-gray-200 rounded-lg space-y-4">
         <h3 className="text-lg font-semibold text-gray-800">3. Finalizar</h3>
          <div>
            <label htmlFor="paymentMethod" className="block text-sm font-semibold text-gray-700">Método de Pago</label>
            <select id="paymentMethod" value={input.paymentMethod} onChange={e => setInput(p => ({...p, paymentMethod: e.target.value as any}))} className="mt-1 block w-full select-style">
                <option value="cash_transfer">Contado / Transferencia</option>
                <option value="other">Otro</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Algunas promociones y descuentos solo aplican para Contado/Transferencia.</p>
          </div>
      </div>


      <button type="submit" className="w-full py-3 px-4 text-lg font-bold text-white bg-brand-primary rounded-lg hover:bg-brand-dark transition-colors">
        Cotizar
      </button>
    </form>
  );
};

// Add some helper CSS classes to the head for consistency
const style = document.createElement('style');
style.textContent = `
  .input-style {
    display: block;
    width: 100%;
    padding: 0.5rem 0.75rem;
    background-color: white;
    border: 1px solid #D1D5DB;
    border-radius: 0.375rem;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  }
  .select-style {
    display: block;
    width: 100%;
    padding: 0.5rem 2.5rem 0.5rem 0.75rem;
    border: 1px solid #D1D5DB;
    border-radius: 0.375rem;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 0.5rem center;
    background-repeat: no-repeat;
    background-size: 1.5em 1.5em;
  }
  .input-style:focus, .select-style:focus {
    outline: none;
    --tw-ring-color: #3B82F6;
    --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
    --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color);
    box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
    border-color: #3B82F6;
  }
`;
document.head.appendChild(style);
