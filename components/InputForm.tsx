import React, { useMemo, useState, useEffect } from 'react';
import { QuoteInput, Service, Zone, PostalCode, QuoteItem, Pais, ServiceUnit, Moneda } from '../types';
import {
  CalculatorIcon,
  MapPinIcon,
  SparklesIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PlusCircleIcon
} from './IconComponents';

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
  const [fieldTouched, setFieldTouched] = useState({
    provincia: false,
    ciudad: false,
  });
  const [justAddedItem, setJustAddedItem] = useState<number | null>(null);

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

  // 4. Clear "just added" animation after delay
  useEffect(() => {
    if (justAddedItem !== null) {
      const timer = setTimeout(() => setJustAddedItem(null), 1000);
      return () => clearTimeout(timer);
    }
  }, [justAddedItem]);

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
      setFieldTouched({ provincia: false, ciudad: false });
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
      setInput(prev => ({ ...prev, provincia: value, ciudad: '' }));
      setFieldTouched(prev => ({ ...prev, provincia: true }));
    } else if (name === 'ciudad') {
      setInput(prev => ({ ...prev, ciudad: value }));
      setFieldTouched(prev => ({ ...prev, ciudad: true }));
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
      const mainItemKey = nextKey;
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
      setJustAddedItem(mainItemKey);

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

  // Validation states for inputs
  const provinciaState = fieldTouched.provincia
    ? (input.provincia ? 'valid' : 'error')
    : 'default';
  const ciudadState = fieldTouched.ciudad
    ? (input.ciudad ? 'valid' : 'error')
    : 'default';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
       <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">Crear Cotización</h2>
        <button
          type="button"
          onClick={() => {
            onReset();
            localStorage.removeItem(STORAGE_KEY_LOCATION);
            setFieldTouched({ provincia: false, ciudad: false });
          }}
          className="px-3 py-1.5 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow active:scale-95"
        >
          Empezar de cero
        </button>
      </div>

      {/* Location Section */}
      <div className="relative overflow-hidden p-5 border-2 rounded-xl space-y-4 transition-all duration-300 bg-white shadow-soft hover:shadow-medium"
           style={{
             borderColor: isLocationComplete ? '#10B981' : '#E5E7EB',
           }}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary"
             style={{ opacity: isLocationComplete ? 1 : 0.3, transition: 'opacity 0.3s' }}></div>

        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold transition-all duration-300 ${
            isLocationComplete
              ? 'bg-success text-white shadow-md scale-110'
              : 'bg-gradient-primary text-white'
          }`}>
             {isLocationComplete ? <CheckCircleIcon className="w-4 h-4" /> : '1'}
          </span>
          <MapPinIcon className="w-5 h-5 text-brand-secondary" />
          Tu Ubicación
          {isLocationComplete && (
            <span className="ml-auto text-xs font-medium text-success animate-slide-in">Completo</span>
          )}
        </h3>

        <div className="space-y-4">
          <div className="relative">
              <label htmlFor="pais" className="block text-sm font-bold text-gray-700 mb-2">
                País <span className="text-brand-secondary">*</span>
              </label>
              <div className="relative">
                <select
                  name="pais"
                  id="pais"
                  value={input.pais}
                  onChange={handleCountryChange}
                  className="w-full px-4 py-3 pr-10 text-base border-2 border-gray-200 rounded-lg bg-white focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 focus:outline-none transition-all duration-200 appearance-none cursor-pointer hover:border-gray-300 shadow-sm"
                >
                    <option value="AR">🇦🇷 Argentina</option>
                    <option value="BO">🇧🇴 Bolivia</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
          </div>

          <div className="relative">
              <label htmlFor="cp" className="block text-sm font-bold text-gray-700 mb-2">
                Código Postal <span className="text-gray-400 font-normal">(Opcional)</span>
              </label>
              <input
                type="text"
                name="cp"
                id="cp"
                value={input.cp}
                onChange={handleCpChange}
                placeholder={input.pais === 'AR' ? 'Ej: 1414' : 'Ej: 2000'}
                className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg bg-white focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 focus:outline-none transition-all duration-200 hover:border-gray-300 shadow-sm"
              />
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <SparklesIcon className="w-3 h-3" />
                Si lo reconocemos, completamos la zona automáticamente
              </p>
          </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label htmlFor="provincia" className="block text-sm font-bold text-gray-700 mb-2">
                  Provincia / Departamento <span className="text-brand-secondary">*</span>
                </label>
                <div className="relative">
                  <select
                    name="provincia"
                    id="provincia"
                    value={input.provincia}
                    onChange={handleLocationChange}
                    onBlur={() => setFieldTouched(prev => ({ ...prev, provincia: true }))}
                    className={`w-full px-4 py-3 pr-10 text-base border-2 rounded-lg bg-white focus:outline-none transition-all duration-200 appearance-none shadow-sm ${
                      provinciaState === 'valid'
                        ? 'border-success focus:border-success focus:ring-2 focus:ring-success/20'
                        : provinciaState === 'error'
                        ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20'
                        : 'border-gray-200 focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 hover:border-gray-300'
                    }`}
                  >
                      <option value="">Elegí tu provincia...</option>
                      {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    {provinciaState === 'valid' ? (
                      <CheckCircleIcon className="w-5 h-5 text-success" />
                    ) : provinciaState === 'error' ? (
                      <ExclamationCircleIcon className="w-5 h-5 text-error" />
                    ) : (
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                </div>
                {provinciaState === 'error' && (
                  <p className="text-xs text-error mt-1 animate-slide-down flex items-center gap-1">
                    <ExclamationCircleIcon className="w-3 h-3" />
                    Este campo es obligatorio
                  </p>
                )}
              </div>

              <div className="relative">
                <label htmlFor="ciudad" className="block text-sm font-bold text-gray-700 mb-2">
                  Localidad / Zona <span className="text-brand-secondary">*</span>
                </label>
                <div className="relative">
                  <select
                    name="ciudad"
                    id="ciudad"
                    value={input.ciudad}
                    onChange={handleLocationChange}
                    onBlur={() => setFieldTouched(prev => ({ ...prev, ciudad: true }))}
                    disabled={!input.provincia}
                    className={`w-full px-4 py-3 pr-10 text-base border-2 rounded-lg bg-white focus:outline-none transition-all duration-200 appearance-none shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 ${
                      ciudadState === 'valid'
                        ? 'border-success focus:border-success focus:ring-2 focus:ring-success/20'
                        : ciudadState === 'error'
                        ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20'
                        : 'border-gray-200 focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 hover:border-gray-300'
                    }`}
                  >
                      <option value="">Elegí tu zona...</option>
                      {citiesInProvince.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    {ciudadState === 'valid' ? (
                      <CheckCircleIcon className="w-5 h-5 text-success" />
                    ) : ciudadState === 'error' ? (
                      <ExclamationCircleIcon className="w-5 h-5 text-error" />
                    ) : (
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                </div>
                {input.provincia && citiesInProvince.length === 0 && (
                   <p className="text-xs text-warning mt-1 animate-slide-down flex items-center gap-1">
                      <ExclamationCircleIcon className="w-3 h-3" />
                      No hay zonas activas para esta provincia
                   </p>
                )}
                {ciudadState === 'error' && citiesInProvince.length > 0 && (
                  <p className="text-xs text-error mt-1 animate-slide-down flex items-center gap-1">
                    <ExclamationCircleIcon className="w-3 h-3" />
                    Este campo es obligatorio
                  </p>
                )}
              </div>
           </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="relative overflow-hidden p-5 border-2 rounded-xl space-y-4 transition-all duration-300 bg-white shadow-soft hover:shadow-medium"
           style={{
             borderColor: hasItems ? '#10B981' : '#E5E7EB',
           }}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary"
             style={{ opacity: hasItems ? 1 : 0.3, transition: 'opacity 0.3s' }}></div>

        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
           <span className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold transition-all duration-300 ${
             hasItems
               ? 'bg-success text-white shadow-md scale-110'
               : 'bg-gradient-primary text-white'
           }`}>
             {hasItems ? <CheckCircleIcon className="w-4 h-4" /> : '2'}
           </span>
           <SparklesIcon className="w-5 h-5 text-brand-secondary" />
           ¿Qué necesitás limpiar?
           {hasItems && (
            <span className="ml-auto text-xs font-medium text-success animate-slide-in">
              {input.items.length} {input.items.length === 1 ? 'servicio' : 'servicios'}
            </span>
          )}
        </h3>

        <div className="flex flex-col sm:flex-row items-end gap-3">
            <div className="flex-grow w-full">
                <label htmlFor="serviceId" className="block text-sm font-bold text-gray-700 mb-2">
                  Servicio <span className="text-brand-secondary">*</span>
                </label>
                <div className="relative">
                  <select
                    id="serviceId"
                    value={currentItem.serviceId}
                    onChange={e => setCurrentItem(p => ({...p, serviceId: e.target.value}))}
                    className="w-full px-4 py-3 pr-10 text-base border-2 border-gray-200 rounded-lg bg-white focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 focus:outline-none transition-all duration-200 appearance-none hover:border-gray-300 shadow-sm"
                  >
                      <option value="">Elegí el servicio que necesitás...</option>
                      {Object.entries(groupedServices).map(([group, serviceItems]: [string, Service[]]) => (
                          <optgroup label={group} key={group}>
                              {serviceItems.map(s => <option key={s.servicio_id} value={s.servicio_id}>{s.servicio} - {s.subservicio}</option>)}
                          </optgroup>
                      ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
            </div>

            <div className="w-full sm:w-28">
                 <label htmlFor="quantity" className="block text-sm font-bold text-gray-700 mb-2">
                    {selectedService?.unidad === ServiceUnit.M2 ? 'Metros²' : 'Cant.'}
                 </label>
                 <input
                   type="number"
                   id="quantity"
                   value={currentItem.quantity}
                   onChange={e => setCurrentItem(p => ({...p, quantity: parseInt(e.target.value, 10) || 1}))}
                   min="1"
                   className="w-full px-4 py-3 text-base text-center font-semibold border-2 border-gray-200 rounded-lg bg-white focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 focus:outline-none transition-all duration-200 hover:border-gray-300 shadow-sm"
                 />
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              disabled={!currentItem.serviceId}
              className={`w-full sm:w-auto h-[50px] px-6 font-bold rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-2 ${
                currentItem.serviceId
                  ? 'bg-gradient-primary text-white hover:shadow-lg hover:scale-105 active:scale-95'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <PlusCircleIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Agregar</span>
              <span className="sm:hidden">Agregar Servicio</span>
            </button>
        </div>

        {/* Dynamic Extras Selection */}
        {availableExtras.length > 0 && (
            <div className="mt-4 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border-2 border-blue-200 shadow-sm animate-slide-down">
                <p className="text-xs font-bold text-brand-secondary uppercase mb-3 flex items-center gap-1">
                  <SparklesIcon className="w-4 h-4" />
                  Extras disponibles para {selectedService?.categoria}:
                </p>
                <div className="flex flex-wrap gap-2">
                    {availableExtras.map(extra => {
                        const isSelected = selectedExtraIds.has(extra.servicio_id);
                        return (
                            <button
                                key={extra.servicio_id}
                                type="button"
                                onClick={() => toggleExtra(extra.servicio_id)}
                                className={`text-sm px-4 py-2 rounded-lg border-2 transition-all duration-200 flex items-center gap-2 font-medium shadow-sm hover:shadow ${
                                    isSelected
                                        ? 'bg-brand-secondary border-brand-secondary text-white scale-105'
                                        : 'bg-white border-gray-200 text-gray-700 hover:border-brand-secondary hover:bg-blue-50'
                                }`}
                            >
                                <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                  isSelected ? 'bg-white border-white' : 'bg-gray-50 border-gray-300'
                                }`}>
                                    {isSelected && (
                                      <svg className="w-3 h-3 text-brand-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                </span>
                                <span>{extra.subservicio || "Extra"}</span>
                                <span className={`text-xs ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                                  +{formatCurrencySimple(extra.precio_base, extra.moneda)}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        )}

        {input.items.length > 0 ? (
            <div className="space-y-3 pt-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Items seleccionados
                </h4>
                <div className="space-y-2">
                  {input.items.map(item => {
                      const details = getServiceDetails(item.serviceId);
                      const isM2 = details?.unidad === ServiceUnit.M2;
                      const isExtra = details?.servicio === 'Extra';
                      const isJustAdded = item.key === justAddedItem;

                      return (
                          <div
                            key={item.key}
                            className={`group flex justify-between items-center p-4 rounded-lg border-2 transition-all duration-300 ${
                              isExtra
                                ? 'bg-gradient-to-r from-gray-50 to-blue-50/30 border-gray-200 pl-6'
                                : isJustAdded
                                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-success shadow-md animate-slide-in'
                                : 'bg-white border-gray-200 hover:border-brand-secondary hover:shadow-md'
                            }`}
                          >
                              <div className="flex-1">
                                <p className={`text-sm font-semibold ${isExtra ? 'text-gray-600' : 'text-gray-800'}`}>
                                    {isExtra && (
                                      <span className="inline-flex items-center text-xs text-brand-secondary font-bold mr-2 px-2 py-0.5 bg-blue-100 rounded">
                                        EXTRA
                                      </span>
                                    )}
                                    {details?.servicio !== 'Extra' ? details?.servicio : ''}
                                    {isExtra ? details?.subservicio : `- ${details?.subservicio}`}
                                </p>
                                <div className="flex items-center gap-3 mt-1">
                                  <p className="text-sm">
                                      <span className="font-bold text-brand-secondary">
                                          {isM2 ? `${item.quantity} m²` : `×${item.quantity}`}
                                      </span>
                                  </p>
                                   {details && (
                                     <p className="text-xs text-gray-500 font-medium">
                                        {formatCurrencySimple(details.precio_base, details.moneda)} c/u
                                     </p>
                                   )}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.key)}
                                className="ml-3 p-2 text-gray-400 hover:text-error hover:bg-error-light rounded-lg transition-all duration-200 opacity-60 group-hover:opacity-100"
                                title="Eliminar"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                              </button>
                          </div>
                      );
                  })}
                </div>
            </div>
        ) : (
          <div className="text-center py-8 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-dashed border-amber-300 rounded-xl animate-pulse-soft">
            <div className="flex flex-col items-center gap-2">
              <svg className="w-12 h-12 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-amber-700 font-semibold">Agregá al menos un servicio</p>
              <p className="text-amber-600 text-sm">Seleccioná un servicio arriba para comenzar</p>
            </div>
          </div>
        )}
      </div>

      {/* Payment Section */}
      <div className="relative overflow-hidden p-5 border-2 border-gray-200 rounded-xl space-y-4 bg-white shadow-soft hover:shadow-medium transition-all duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary opacity-30"></div>

        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-primary text-white text-sm font-bold">3</span>
            <CreditCardIcon className="w-5 h-5 text-brand-secondary" />
            Forma de Pago
         </h3>
          <div>
            <label htmlFor="paymentMethod" className="block text-sm font-bold text-gray-700 mb-2">
              ¿Cómo vas a pagar?
            </label>
            <div className="relative">
              <select
                id="paymentMethod"
                value={input.paymentMethod}
                onChange={e => setInput(p => ({...p, paymentMethod: e.target.value as any}))}
                className="w-full px-4 py-3 pr-10 text-base border-2 border-gray-200 rounded-lg bg-white focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 focus:outline-none transition-all duration-200 appearance-none hover:border-gray-300 shadow-sm"
              >
                  <option value="cash_transfer">💵 Contado / Transferencia</option>
                  <option value="other">💳 Otro medio</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-info mt-2 flex items-center gap-1 bg-info-light px-3 py-2 rounded-lg">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Los descuentos de zona aplican solo a Contado/Transferencia
            </p>
          </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
          <button
            type="submit"
            disabled={!isFormValid || isCalculating}
            className={`group relative w-full py-4 px-6 text-lg font-bold rounded-xl flex items-center justify-center gap-3 transition-all duration-300 overflow-hidden ${
                isFormValid && !isCalculating
                ? 'bg-gradient-primary text-white shadow-strong hover:shadow-glow active:scale-[0.98] cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-sm'
            }`}
          >
            {/* Animated background for enabled state */}
            {isFormValid && !isCalculating && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            )}

            <div className="relative flex items-center gap-3">
              {isCalculating ? (
                <>
                  <div className="w-6 h-6 border-3 border-gray-300 border-t-brand-secondary rounded-full animate-spin"></div>
                  <span>Calculando...</span>
                </>
              ) : (
                <>
                  <CalculatorIcon className="w-6 h-6" />
                  <span>Calcular Cotización</span>
                  {isFormValid && (
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  )}
                </>
              )}
            </div>
          </button>

          {/* Validation Message */}
          {!isFormValid && (
             <div className="text-center mt-4 animate-bounce-subtle">
               <div className="inline-flex items-center gap-2 bg-error-light text-error px-4 py-3 rounded-lg border-2 border-error/20 shadow-sm">
                  <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
                  <div className="text-sm font-semibold text-left">
                    Para calcular, completá:
                    {!isLocationComplete && <span className="block">✓ Tu ubicación</span>}
                    {!hasItems && <span className="block">✓ Al menos un servicio</span>}
                  </div>
               </div>
             </div>
          )}
      </div>
    </form>
  );
};
