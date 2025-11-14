import React, { useState } from 'react';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { QuoteResult } from './components/QuoteResult';
import { useQuoteCalculator } from './hooks/useQuoteCalculator';
import { AdminPage } from './components/AdminPage';
import { SERVICIOS, ZONAS, POSTAL_CODES } from './data/mockData';
import { Service, Zone, PostalCode } from './types';
import useLocalStorageState from './hooks/useLocalStorageState';


function App() {
  const [view, setView] = useState<'calculator' | 'admin'>('calculator');
  
  // --- Persistent State Management ---
  const [servicesData, setServicesData] = useLocalStorageState<Service[]>('servicesData', SERVICIOS);
  const [zonesData, setZonesData] = useLocalStorageState<Zone[]>('zonesData', ZONAS);
  const [postalCodesData, setPostalCodesData] = useLocalStorageState<PostalCode[]>('postalCodesData', POSTAL_CODES);

  const { 
    input, 
    setInput, 
    result, 
    calculate, 
    services, 
    modifiers,
    isCalculated,
    error,
    reset,
  } = useQuoteCalculator({
    services: servicesData,
    zones: zonesData,
    postalCodes: postalCodesData,
  });

  const handleCopy = () => {
    if (!result || !result.summary) return;
    navigator.clipboard.writeText(result.summary).then(() => {
      alert('Resumen copiado al portapapeles!');
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      alert('Error al copiar el resumen.');
    });
  };
  
  const handleSave = () => {
    if(!isCalculated) return;
    console.log("Saving quote:", {
      inputs: input,
      result: result
    });
    alert('Cotización guardada (simulado).');
  };

  const handleResetData = () => {
    if (window.confirm('¿Está seguro de que desea restablecer TODOS los datos a sus valores originales? Esta acción no se puede deshacer.')) {
        localStorage.removeItem('servicesData');
        localStorage.removeItem('zonesData');
        localStorage.removeItem('postalCodesData');
        setServicesData(SERVICIOS);
        setZonesData(ZONAS);
        setPostalCodesData(POSTAL_CODES);
        alert('Los datos han sido restablecidos a los valores originales.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <Header 
        onSave={handleSave} 
        onCopy={handleCopy} 
        isResultReady={isCalculated && !!result && view === 'calculator'}
        view={view}
        setView={setView}
      />

      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {view === 'calculator' ? (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <InputForm
                  input={input}
                  setInput={setInput}
                  onCalculate={calculate}
                  onReset={reset}
                  services={services}
                  modifiers={modifiers}
                  zones={zonesData}
                  postalCodes={postalCodesData}
                />
              </div>
            </div>
            <div className="lg:col-span-3">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 sticky top-8">
                <h2 className="text-2xl font-bold text-brand-primary mb-6">Resultado de Cotización</h2>
                <QuoteResult result={result} isCalculated={isCalculated} error={error} />
              </div>
            </div>
          </div>
        ) : (
          <AdminPage 
            services={servicesData}
            setServices={setServicesData}
            zones={zonesData}
            setZones={setZonesData}
            postalCodes={postalCodesData}
            setPostalCodes={setPostalCodesData}
            onResetData={handleResetData}
          />
        )}
      </main>
      <footer className="text-center py-4 text-gray-500 text-sm">
        <p>Tutto Cotizador MVP &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;
