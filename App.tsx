import React, { useState } from 'react';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { QuoteResult } from './components/QuoteResult';
import { useQuoteCalculator } from './hooks/useQuoteCalculator';
import { useGoogleSheetsData } from './hooks/useGoogleSheetsData';
import { InfoIcon } from './components/IconComponents';

function App() {
  // --- Data Management (Google Sheets) ---
  const { services, zones, postalCodes, discounts, loading, error: fetchError } = useGoogleSheetsData();
  const [showRules, setShowRules] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  const { 
    input, 
    setInput, 
    result, 
    calculate, 
    services: filteredServices, 
    modifiers,
    isCalculated,
    error: calcError,
    reset,
  } = useQuoteCalculator({
    services,
    zones,
    postalCodes,
    discounts
  });

  // Wrapper to simulate calculation time and allow for smooth UI transitions
  const handleCalculateWithDelay = () => {
    setIsCalculating(true);
    // 600ms delay to allow the user to see the "Thinking" state and reset animations
    setTimeout(() => {
        calculate();
        setIsCalculating(false);
    }, 600);
  };

  const handleCopy = () => {
    if (!result || !result.summary) return;
    navigator.clipboard.writeText(result.summary).then(() => {
      alert('Resumen copiado al portapapeles!');
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      alert('Error al copiar el resumen.');
    });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-light">
        <div className="text-center">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
           <p className="text-gray-600">Actualizando lista de precios...</p>
        </div>
      </div>
    );
  }

  // Filter rules for the current country to display in the modal
  const activeDiscounts = discounts.filter(d => (d.pais === input.pais || d.pais === 'ALL') && d.active);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans relative">
      <Header 
        onCopy={handleCopy} 
        isResultReady={isCalculated && !!result && !isCalculating}
      />

      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {fetchError && (
          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 rounded-r shadow-sm flex items-center">
             <InfoIcon className="h-5 w-5 mr-2" />
             <span>{fetchError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <InputForm
                input={input}
                setInput={setInput}
                onCalculate={handleCalculateWithDelay}
                isCalculating={isCalculating}
                onReset={reset}
                services={filteredServices}
                modifiers={modifiers}
                zones={zones}
                postalCodes={postalCodes}
              />
              
              {/* Active Rules Toggle */}
              <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                 <button 
                    onClick={() => setShowRules(!showRules)}
                    className="text-sm text-brand-secondary font-medium hover:underline flex items-center justify-center gap-1 mx-auto"
                 >
                    <InfoIcon className="w-4 h-4" />
                    {showRules ? 'Ocultar reglas vigentes' : 'Ver reglas y descuentos vigentes'}
                 </button>
              </div>
              
              {showRules && (
                 <div className="mt-4 bg-blue-50 p-4 rounded-lg text-sm space-y-2 border border-blue-100">
                    <h4 className="font-bold text-brand-primary mb-2">Reglas activas ({input.pais}):</h4>
                    
                    {activeDiscounts.length > 0 ? (
                        <div className="mb-3">
                           <ul className="list-disc pl-4 space-y-1 text-gray-700">
                               {activeDiscounts.map((rule) => (
                                   <li key={rule.id}>
                                       {rule.description || `${rule.category}: ${rule.discount_pct * 100}% OFF llevando ${rule.min_qty} o más.`}
                                   </li>
                               ))}
                           </ul>
                        </div>
                    ) : (
                        <p className="italic text-gray-500">No hay reglas personalizadas cargadas.</p>
                    )}
                 </div>
              )}
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 sticky top-8 min-h-[500px]">
              <h2 className="text-2xl font-bold text-brand-primary mb-6">Resultado de Cotización</h2>
              <QuoteResult 
                result={result} 
                isCalculated={isCalculated} 
                isCalculating={isCalculating}
                error={calcError} 
                input={input} // Passing input state for the Assistant view
              />
            </div>
          </div>
        </div>
      </main>
      <footer className="text-center py-4 text-gray-500 text-sm">
        <p>Tutto Cotizador MVP &copy; {new Date().getFullYear()}</p>
        <p className="text-xs mt-1">Precios sincronizados con Google Sheets</p>
      </footer>
    </div>
  );
}

export default App;