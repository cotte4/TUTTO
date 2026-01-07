import React, { useMemo, useState, useEffect } from 'react';
import { QuoteInput, Service, Zone, PostalCode, QuoteItem, Pais, ServiceUnit, Moneda } from '../types';
import { CalculatorIcon } from './IconComponents';

interface InputFormProps {
  input: QuoteInput;
  setInput: React.Dispatch<React.SetStateAction<QuoteInput>>;
  onCalculate: () => void;
  isCalculating?: boolean;
  onReset: () => void;
  services: Service[];
  zones: Zone[];
  postalCodes: PostalCode[];
  modifiers: never[]; // Modifiers are deprecated
}

const STORAGE_KEY_LOCATION = 'tutto_last_location';

const formatCurrencySimple = (value: number, currency: Moneda) => {
    return new Intl.NumberFormat(currency === 'ARS' ? 'es-AR' : 'es-BO', {
        style: 'currency',
        currency: currency === 'ARS' ? 'ARS' : 'BOB', // BOB is ISO for Boliviano, usually
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

// Helper to normalize strings (remove accents, lowercase) for loose comparison
const normalize = (str: string) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";

export const InputForm: React.FC<InputFormProps> = ({ input, setInput, onCalculate, isCalculating = false, onReset, services, zones, postalCodes }) => {
  const [currentItem, setCurrentItem] = useState({ serviceId: '', quantity: 1 });
  const [selectedExtraIds, setSelectedExtraIds] = useState<Set<string>>(new Set());
  const [itemKey, setItemKey] = useState(0);

  // --- Validation Logic ---
  const isLocationComplete = Boolean(input.pais && input.provincia && input.ciudad);
  const hasItems = input.items.length > 0;
  const isFormValid = isLocationComplete && hasItems;

  // 1. Load saved location on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOCATION);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only apply if we have valid data and the form is currently empty/default
        if (parsed.pais && parsed.provincia && parsed.ciudad && input.items.length === 0) {
           setInput(prev => ({
             ...prev,
             pais: parsed.pais,
             provincia: parsed.provincia,
             ciudad: parsed.ciudad
             // We don't restore CP to avoid confusion if the saved location was manual
           }));
        }
      }
    } catch (e) {
      console.warn("Could not load saved location", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // 2. Save location whenever it changes
  useEffect(() => {
    if (input.pais && input.provincia && input.ciudad) {
      const toSave = {
        pais: input.pais,
        provincia: input.provincia,
        ciudad: input.ciudad
      };
      localStorage.setItem(STORAGE_KEY_LOCATION, JSON.stringify(toSave));
    }
  }, [input.pais, input.provincia, input.ciudad]);

  // 3. Reset selected extras when main service changes
  useEffect(() => {
    setSelectedExtraIds(new Set());
  }, [currentItem.serviceId]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newPais = e.target.value as Pais;
      // When country changes, we keep items but reset location details
      setInput(prev => ({
          ...prev,
          pais: newPais,
          cp: '',
          provincia: '',
          ciudad: '',
          paymentMethod: 'cash_transfer'
      }));
  };

  const handleCpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    let autoProvincia = input.provincia;
    let autoCiudad = input.ciudad;

    // Logic: Try to find a matching zone for this CP
    const valNum = parseInt(val, 10);
    if (!isNaN(valNum) && postalCodes) {
        // Find matching range for current country
        const match = postalCodes.find(pc => 
            pc.pais === input.pais && 
            valNum >= parseInt(pc.cp_from, 10) && 
            valNum <= parseInt(pc.cp_to, 10)
        );

        if (match) {
            const associatedZone = zones.find(z => z.zone_id === match.zone_id);
            if (associatedZone && associatedZone.active) {
                autoProvincia = associatedZone.provincia;
                autoCiudad = associatedZone.ciudad;
            }
        }
    }

    setInput(prev => ({
        ...prev,
        cp: val,
        provincia: autoProvincia,
        ciudad: autoCiudad
    }));
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'provincia') {
      // If manually changing province, we might want to clear CP if it contradicts, 
      // but for simplicity, we just update the location fields.
      setInput(prev => ({ ...prev, provincia: value, ciudad: '' }));
    } else if (name === 'ciudad') {
      setInput(prev => ({ ...prev, ciudad: value }));
    }
  };
  
  const handleAddItem = () => {
      if (!currentItem.serviceId || currentItem.quantity <= 0) {
          alert("Por favor, seleccione un servicio y una cantidad válida.");
          return;
      }
      
      let nextKey = itemKey;
      const itemsToAdd: QuoteItem[] = [];

      // 1. Add Main Item
      itemsToAdd.push({ ...currentItem, key: nextKey });
      nextKey++;

      // 2. Add Selected Extras (Using same quantity as parent)
      selectedExtraIds.forEach(extraId => {
          itemsToAdd.push({
              serviceId: extraId,
              quantity: currentItem.quantity, // Extras match parent quantity (e.g. 6 chairs -> 6 waterproofing)
              key: nextKey
          });
          nextKey++;
      });

      setItemKey(nextKey);
      setInput(prev => ({ ...prev, items: [...prev.items, ...itemsToAdd]}));
      
      // Reset form
      setCurrentItem({ serviceId: '', quantity: 1 });
      setSelectedExtraIds(new Set());
  };

  const handleRemoveItem = (keyToRemove: number) => {
      setInput(prev => ({
          ...prev,
          items: prev.items.filter(item => item.key !== keyToRemove)
      }));
  };

  const toggleExtra = (extraId: string) => {
      const newSet = new Set(selectedExtraIds);
      if (newSet.has(extraId)) {
          newSet.delete(extraId);
      } else {
          newSet.add(extraId);
      }
      setSelectedExtraIds(newSet);
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (isFormValid && !isCalculating) {
          onCalculate();
      }
  };

  // Filter services to show in dropdown (exclude Extras)
  const groupedServices = useMemo(() => {
    const countryServices = services.filter(s => s.pais === input.pais && s.servicio !== 'Extra');
    
    return countryServices.reduce((acc: Record<string, Service[]>, service) => {
      const groupName = service.categoria;
      if (!acc[groupName]) acc[groupName] = [];
      acc[groupName].push(service);
      return acc;
    }, {} as Record<string, Service[]>);
  }, [services, input.pais]);

  const provinces = useMemo(() => {
    const countryZones = zones.filter(z => z.pais === input.pais && z.active);
    return [...new Set(countryZones.map(z => z.provincia))].sort();
  }, [zones, input.pais]);

  const citiesInProvince = useMemo<string[]>(() => {
      if (!input.provincia) return [];
      return zones
        .filter(z => z.pais === input.pais && z.provincia === input.provincia && z.active)
        .map(z => z.ciudad)
        .filter((v, i, a) => a.indexOf(v) === i)
        .sort();
  }, [input.provincia, input.pais, zones]);

  const getServiceDetails = (serviceId: string) => services.find(s => s.servicio_id === serviceId);

  // Determine current service unit to change label (m2 vs Cant)
  const selectedService = useMemo(() => {
      return services.find(s => s.servicio_id === currentItem.serviceId);
  }, [services, currentItem.serviceId]);

  // Find relevant extras based on selected service category
  // Using normalize() to ensure "Vehículos" matches "Vehiculos" or "vehiculos"
  const availableExtras = useMemo(() => {
      if (!selectedService) return [];
      const currentCategoryNormalized = normalize(selectedService.categoria);
      
      return services.filter(s => 
          s.pais === input.pais && 
          s.servicio === 'Extra' && 
          normalize(s.categoria) === currentCategoryNormalized &&
          s.active
      );
  }, [selectedService, services, input.pais]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
       <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-brand-primary">Crear Cotización</h2>
        <button 
          type="button" 
          onClick={() => {
            onReset();
            localStorage.removeItem(STORAGE_KEY_LOCATION);
          }} 
          className="px-3 py-1 text-sm font-semibold text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
        >
          Empezar de cero
        </button>
      </div>
      
      {/* Location Section */}
      <div className="p-4 border border-gray-200 rounded-lg space-y-4 bg-gray-50/50">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs transition-colors ${isLocationComplete ? 'bg-green-500 text-white' : 'bg-brand-primary text-white'}`}>
             {isLocationComplete ? '✓' : '1'}
          </span>
          Tu Ubicación
        </h3>
        
        <div>
            <label htmlFor="pais" className="block text-sm font-semibold text-gray-700 mb-1">País</label>
            <select name="pais" id="pais" value={input.pais} onChange={handleCountryChange} className="select-style">
                <option value="AR">Argentina</option>
                <option value="BO">Bolivia</option>
            </select>
        </div>

        <div>
            <label htmlFor="cp" className="block text-sm font-semibold text-gray-700 mb-1">Código Postal (Opcional)</label>
            <input 
              type="text" 
              name="cp" 
              id="cp" 
              value={input.cp} 
              onChange={handleCpChange} 
              placeholder={input.pais === 'AR' ? 'Ej: 1414' : 'Ej: 2000'}
              className="input-style" 
            />
            <p className="text-xs text-gray-500 mt-1">Si lo reconocemos, completamos la zona por vos.</p>
        </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="provincia" className="block text-sm font-semibold text-gray-700 mb-1">Provincia / Departamento</label>
              <select name="provincia" id="provincia" value={input.provincia} onChange={handleLocationChange} className="select-style">
                  <option value="">Elegí tu provincia...</option>
                  {provinces.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="ciudad" className="block text-sm font-semibold text-gray-700 mb-1">Localidad / Zona</label>
              <select name="ciudad" id="ciudad" value={input.ciudad} onChange={handleLocationChange} disabled={!input.provincia} className="select-style disabled:bg-gray-200 disabled:cursor-not-allowed">
                  <option value="">Elegí tu zona...</option>
                  {citiesInProvince.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {input.provincia && citiesInProvince.length === 0 && (
                 <p className="text-xs text-red-500 mt-1">No hay zonas activas cargadas para esta provincia.</p>
              )}
            </div>
         </div>
      </div>

      {/* Services Section */}
      <div className="p-4 border border-gray-200 rounded-lg space-y-4 bg-gray-50/50">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
           <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs transition-colors ${hasItems ? 'bg-green-500 text-white' : 'bg-brand-primary text-white'}`}>
             {hasItems ? '✓' : '2'}
           </span>
           ¿Qué necesitás limpiar?
        </h3>
        <div className="flex items-end gap-2">
            <div className="flex-grow">
                <label htmlFor="serviceId" className="block text-sm font-semibold text-gray-700 mb-1">Servicio</label>
                <select id="serviceId" value={currentItem.serviceId} onChange={e => setCurrentItem(p => ({...p, serviceId: e.target.value}))} className="select-style">
                    <option value="">Elegí el servicio que necesitás...</option>
                    {Object.entries(groupedServices).map(([group, serviceItems]: [string, Service[]]) => (
                        <optgroup label={group} key={group}>
                            {serviceItems.map(s => <option key={s.servicio_id} value={s.servicio_id}>{s.servicio} - {s.subservicio}</option>)}
                        </optgroup>
                    ))}
                </select>
            </div>
            <div className="w-20 sm:w-24">
                 <label htmlFor="quantity" className="block text-sm font-semibold text-gray-700 mb-1">
                    {selectedService?.unidad === ServiceUnit.M2 ? 'Metros²' : 'Cant.'}
                 </label>
                 <input type="number" id="quantity" value={currentItem.quantity} onChange={e => setCurrentItem(p => ({...p, quantity: parseInt(e.target.value, 10) || 1}))} min="1" className="input-style" />
            </div>
            <button type="button" onClick={handleAddItem} className="h-[42px] px-4 font-bold text-white bg-brand-secondary rounded-md hover:bg-blue-700 shadow-sm active:scale-95 transition-transform">
              +
            </button>
        </div>
        
        {/* Dynamic Extras Selection */}
        {availableExtras.length > 0 && (
            <div className="mt-3 bg-white p-3 rounded border border-blue-100 shadow-sm animate-fade-in">
                <p className="text-xs font-bold text-brand-primary uppercase mb-2">Extras disponibles para {selectedService?.categoria}:</p>
                <div className="flex flex-wrap gap-2">
                    {availableExtras.map(extra => {
                        const isSelected = selectedExtraIds.has(extra.servicio_id);
                        return (
                            <button
                                key={extra.servicio_id}
                                type="button"
                                onClick={() => toggleExtra(extra.servicio_id)}
                                className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 flex items-center gap-1
                                    ${isSelected 
                                        ? 'bg-blue-100 border-blue-300 text-blue-800 font-medium' 
                                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <span className={`w-3 h-3 rounded-full border flex items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'}`}>
                                    {isSelected && <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                </span>
                                {extra.subservicio || "Extra"} (+{formatCurrencySimple(extra.precio_base, extra.moneda)})
                            </button>
                        );
                    })}
                </div>
            </div>
        )}

        {input.items.length > 0 ? (
            <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Items seleccionados</h4>
                <div className="divide-y divide-gray-200 border border-gray-200 rounded-md bg-white overflow-hidden">
                  {input.items.map(item => {
                      const details = getServiceDetails(item.serviceId);
                      const isM2 = details?.unidad === ServiceUnit.M2;
                      const isExtra = details?.servicio === 'Extra';
                      return (
                          <div key={item.key} className={`flex justify-between items-center p-3 hover:bg-gray-50 transition-colors ${isExtra ? 'bg-gray-50/50 pl-6 border-l-4 border-l-gray-300' : ''}`}>
                              <div>
                                <p className={`text-sm font-medium ${isExtra ? 'text-gray-600' : 'text-gray-800'}`}>
                                    {isExtra && <span className="text-xs text-brand-secondary font-bold mr-1">EXTRA:</span>}
                                    {details?.servicio !== 'Extra' ? details?.servicio : ''} {isExtra ? details?.subservicio : `- ${details?.subservicio}`}
                                </p>
                                <p className="text-xs text-gray-500">
                                    <span className="font-semibold text-brand-primary">
                                        {isM2 ? `${item.quantity} m²` : `x${item.quantity}`}
                                    </span>
                                     {details && (
                                       <span className="text-gray-400 ml-1">
                                          · {formatCurrencySimple(details.precio_base, details.moneda)}
                                       </span>
                                     )}
                                </p>
                              </div>
                              <button type="button" onClick={() => handleRemoveItem(item.key)} className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                              </button>
                          </div>
                      );
                  })}
                </div>
            </div>
        ) : (
          <div className="text-center py-4 bg-amber-50 border border-dashed border-amber-200 rounded text-amber-600 text-sm font-medium animate-pulse">
            👆 Agregá al menos un servicio aquí
          </div>
        )}
      </div>

      {/* Payment and Submit Section */}
      <div className="p-4 border border-gray-200 rounded-lg space-y-4 bg-gray-50/50">
         <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-primary text-white text-xs">3</span>
            Forma de Pago
         </h3>
          <div>
            <label htmlFor="paymentMethod" className="block text-sm font-semibold text-gray-700 mb-1">¿Cómo vas a pagar?</label>
            <select id="paymentMethod" value={input.paymentMethod} onChange={e => setInput(p => ({...p, paymentMethod: e.target.value as any}))} className="select-style">
                <option value="cash_transfer">Contado / Transferencia</option>
                <option value="other">Otro medio</option>
            </select>
            <p className="text-xs text-gray-500 mt-1 ml-1 italic">Los descuentos de zona aplican solo a Contado/Transferencia.</p>
          </div>
      </div>


      <div>
          <button 
            type="submit" 
            disabled={!isFormValid || isCalculating}
            className={`w-full py-4 px-6 text-lg font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 ${
                isFormValid && !isCalculating
                ? 'text-white bg-brand-primary shadow-lg hover:bg-brand-dark hover:shadow-xl active:scale-[0.98]' 
                : 'text-gray-400 bg-gray-200 cursor-not-allowed shadow-none'
            }`}
          >
            {isCalculating ? (
               <div className="flex items-center gap-2">
                   <div className="w-5 h-5 border-2 border-gray-400 border-t-brand-primary rounded-full animate-spin"></div>
                   <span>Calculando...</span>
               </div>
            ) : (
               <>
                   <CalculatorIcon className="w-6 h-6" />
                   Calculando Cotización
               </>
            )}
          </button>
          
          {/* Helper Text for Invalid State */}
          {!isFormValid && (
             <div className="text-center text-sm text-red-500 mt-3 font-medium bg-red-50 py-2 rounded border border-red-100">
                Para ver el precio, completá: 
                {!isLocationComplete && ' Tu ubicación'}
                {!isLocationComplete && !hasItems && ' +'}
                {!hasItems && ' Al menos un servicio'}
             </div>
          )}
      </div>
    </form>
  );
};