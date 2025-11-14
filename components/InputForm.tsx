import React, { useMemo, useState, useEffect } from 'react';
import { QuoteInput, Service, Modifier, ServiceUnit, Zone, PostalCode } from '../types';

interface InputFormProps {
  input: QuoteInput;
  setInput: React.Dispatch<React.SetStateAction<QuoteInput>>;
  onCalculate: () => void;
  onReset: () => void;
  services: Service[];
  modifiers: Modifier[];
  zones: Zone[];
  postalCodes: PostalCode[];
}

export const InputForm: React.FC<InputFormProps> = ({ input, setInput, onCalculate, onReset, services, modifiers, zones, postalCodes }) => {
  const [step, setStep] = useState(1);

  // --- Location Sync Logic ---
  useEffect(() => {
    // Automatically find zone when CP is entered
    if (input.cp && input.cp.length >= 4) {
      const cpNum = parseInt(input.cp, 10);
      const postalCodeData = postalCodes.find(pc => {
        const from = parseInt(pc.cp_from, 10);
        const to = parseInt(pc.cp_to, 10);
        return cpNum >= from && cpNum <= to;
      });
      if (postalCodeData) {
        const zoneData = zones.find(z => z.zone_id === postalCodeData.zone_id);
        if (zoneData && (zoneData.provincia !== input.provincia || zoneData.ciudad !== input.ciudad)) {
          setInput(prev => ({
            ...prev,
            provincia: zoneData.provincia,
            ciudad: zoneData.ciudad,
          }));
        }
      }
    }
  }, [input.cp, postalCodes, zones, setInput, input.provincia, input.ciudad]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'provincia') {
      setInput(prev => ({
        ...prev,
        provincia: value,
        ciudad: '', // Reset ciudad when provincia changes
        cp: '', // Clear CP to prioritize manual selection
      }));
    } else if (name === 'ciudad') {
       setInput(prev => ({ ...prev, ciudad: value, cp: '' })); // Clear CP
    } else {
      setInput(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, parseInt(e.target.value, 10) || 0);
    setInput(prev => ({...prev, quantity: value}));
  }

  const handleFlagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setInput(prev => ({
      ...prev,
      flags: { ...prev.flags, [name]: checked },
    }));
  };

  const handleReset = () => {
    onReset();
    setStep(1);
  };

  const selectedService = useMemo(() => {
    return services.find(s => s.servicio_id === input.serviceId);
  }, [input.serviceId, services]);

  const selectedZone = useMemo(() => {
    if (input.provincia && input.ciudad) {
      return zones.find(z => z.provincia === input.provincia && z.ciudad === input.ciudad)
    }
    return undefined;
  }, [input.provincia, input.ciudad, zones]);
  
  const groupedServices = useMemo(() => {
    return services.reduce((acc: Record<string, Service[]>, service) => {
      const groupName = service.servicio;
      if (!acc[groupName]) {
        acc[groupName] = [];
      }
      acc[groupName].push(service);
      return acc;
    }, {} as Record<string, Service[]>);
  }, [services]);

  const provinces = useMemo(() => {
    const uniqueProvinces = [...new Set(zones.map(z => z.provincia))];
    return uniqueProvinces.sort();
  }, [zones]);

  // FIX: Explicitly specify the generic type for useMemo as string[] to resolve the 'unknown' type error.
  const citiesInProvince = useMemo<string[]>(() => {
      if (!input.provincia) return [];
      return zones
          .filter(z => z.provincia === input.provincia)
          .map(z => z.ciudad)
          .filter((value, index, self) => self.indexOf(value) === index) // Unique cities
          .sort();
  }, [input.provincia, zones]);

  // --- Step Validation ---
  const isLocationValid = !!selectedZone;
  const isServiceValid = !!selectedService && input.quantity > 0;

  const renderModifierGroup = (type: string) => {
    const filteredModifiers = modifiers.filter(m => m.tipo === type);
    if (filteredModifiers.length === 0) return null;

    return (
      <div key={type}>
        <label className="block text-sm font-semibold text-gray-700 capitalize mb-2">{type}</label>
        <div className="space-y-2">
          {filteredModifiers.map(mod => (
            <label key={mod.clave} className="flex items-center bg-gray-50 p-3 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
              <input
                type="checkbox"
                name={mod.clave}
                checked={!!input.flags[mod.clave]}
                onChange={handleFlagChange}
                className="h-5 w-5 rounded border-gray-300 text-brand-secondary focus:ring-brand-secondary"
              />
              <span className="ml-3 text-gray-800">{mod.label}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };
  
  const renderStepIndicator = () => (
    <div className="mb-6">
      <p className="text-sm font-semibold text-brand-secondary">
        PASO {step} DE 3
      </p>
      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
        <div 
          className="bg-brand-secondary h-1.5 rounded-full transition-all duration-300" 
          style={{ width: `${(step / 3) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  const SummaryDisplay = ({ title, value, onEdit }: { title: string; value: string; onEdit: () => void }) => (
    <div className="bg-gray-100 p-3 rounded-lg flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500">{title}</p>
        <p className="font-semibold text-gray-800">{value}</p>
      </div>
      <button type="button" onClick={onEdit} className="text-sm font-medium text-brand-secondary hover:underline">
        Cambiar
      </button>
    </div>
  );
  
  return (
    <form onSubmit={(e) => { e.preventDefault(); onCalculate(); }} className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-brand-primary">Ingresar Datos</h2>
        <button
          type="button"
          onClick={handleReset}
          className="px-3 py-1 text-sm font-semibold text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
        >
          Limpiar Todo
        </button>
      </div>
      
      {renderStepIndicator()}
      
      {/* --- STEP 1: Location --- */}
      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <h3 className="text-lg font-semibold text-gray-800">Ubicación</h3>
          <div>
            <label htmlFor="cp" className="block text-sm font-semibold text-gray-700">Código Postal</label>
            <input
              type="text"
              name="cp"
              id="cp"
              value={input.cp}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm"
              placeholder="Ej: 7600"
            />
          </div>
          <p className="text-center my-2 text-xs text-gray-500 font-semibold">O</p>
          <div>
            <label htmlFor="provincia" className="block text-sm font-semibold text-gray-700">Provincia</label>
            <select
                name="provincia"
                id="provincia"
                value={input.provincia}
                onChange={handleInputChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm rounded-md"
            >
                <option value="">Seleccione provincia...</option>
                {provinces.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="ciudad" className="block text-sm font-semibold text-gray-700">Ciudad</label>
            <select
                name="ciudad"
                id="ciudad"
                value={input.ciudad}
                onChange={handleInputChange}
                disabled={!input.provincia}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
                <option value="">Seleccione ciudad...</option>
                {citiesInProvince.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* --- STEP 2: Service --- */}
      {step === 2 && (
        <div className="space-y-4 animate-fade-in">
          <SummaryDisplay title="Ubicación" value={`${input.ciudad}, ${input.provincia}`} onEdit={() => setStep(1)} />
          
          <h3 className="text-lg font-semibold text-gray-800 pt-2">Servicio</h3>
          <div>
            <label htmlFor="serviceId" className="block text-sm font-semibold text-gray-700">Tipo de Servicio</label>
            <select
              name="serviceId"
              id="serviceId"
              value={input.serviceId}
              onChange={handleInputChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm rounded-md"
            >
              <option value="">Seleccione un servicio...</option>
              {Object.entries(groupedServices).map(([groupName, servicesInGroup]) => (
                <optgroup label={groupName} key={groupName}>
                  {servicesInGroup.map(s => (
                    <option key={s.servicio_id} value={s.servicio_id}>{s.subservicio}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {selectedService && (
            <div>
              <label htmlFor="quantity" className="block text-sm font-semibold text-gray-700">
                {selectedService.unidad === ServiceUnit.M2 ? 'Metros Cuadrados (m²)' : 'Cantidad'}
              </label>
              <input
                type="number"
                name="quantity"
                id="quantity"
                value={input.quantity}
                onChange={handleQuantityChange}
                min="1"
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm"
              />
            </div>
          )}
        </div>
      )}
      
      {/* --- STEP 3: Modifiers --- */}
      {step === 3 && (
        <div className="space-y-4 animate-fade-in">
           <SummaryDisplay title="Ubicación" value={`${input.ciudad}, ${input.provincia}`} onEdit={() => setStep(1)} />
           <SummaryDisplay title="Servicio" value={`${selectedService?.servicio} - ${selectedService?.subservicio}`} onEdit={() => setStep(2)} />

          <h3 className="text-lg font-semibold text-gray-800 pt-2">Detalles Adicionales</h3>
          <div className="space-y-4">
            {renderModifierGroup('mancha')}
            {renderModifierGroup('olor')}
            {renderModifierGroup('pelos')}
            {renderModifierGroup('urgencia')}
            {renderModifierGroup('accesibilidad')}
          </div>
        </div>
      )}

      {/* --- Navigation --- */}
      <div className="pt-4 flex items-center gap-4">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep(s => s - 1)}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-md font-bold text-gray-700 bg-white hover:bg-gray-50"
          >
            Anterior
          </button>
        )}
        
        {step < 3 ? (
           <button
            type="button"
            onClick={() => setStep(s => s + 1)}
            disabled={step === 1 ? !isLocationValid : !isServiceValid}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-md font-bold text-white bg-brand-secondary hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        ) : (
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-bold text-white bg-brand-primary hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary transition-colors"
          >
            Cotizar
          </button>
        )}
      </div>
    </form>
  );
};