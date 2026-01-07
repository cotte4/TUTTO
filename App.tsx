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
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="text-center">
           <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-brand-secondary mx-auto mb-6 shadow-glow"></div>
           <p className="text-gray-700 font-medium text-lg">Actualizando lista de precios...</p>
        </div>
      </div>
    );
  }

  // Filter rules for the current country to display in the modal
  const activeDiscounts = discounts.filter(d => (d.pais === input.pais || d.pais === 'ALL') && d.active);

  return (
    <div className="min-h-screen bg-mesh-pattern text-gray-800 font-sans relative">
      <Header
        onCopy={handleCopy}
        isResultReady={isCalculated && !!result && !isCalculating}
      />

      <main className="p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto">
        {fetchError && (
          <div className="mb-8 p-5 bg-warning-light border-l-4 border-warning text-amber-900 rounded-r-lg shadow-soft flex items-center backdrop-blur-sm">
             <InfoIcon className="h-5 w-5 mr-3 flex-shrink-0" />
             <span className="font-medium">{fetchError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10">
          <div className="lg:col-span-2">
            <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-medium border border-gray-100/50 hover:shadow-strong transition-shadow duration-300">
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
              <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                 <button
                    onClick={() => setShowRules(!showRules)}
                    className="text-sm text-brand-secondary font-semibold hover:text-brand-secondary/80 flex items-center justify-center gap-2 mx-auto transition-colors duration-200 group"
                 >
                    <InfoIcon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                    {showRules ? 'Ocultar reglas vigentes' : 'Ver reglas y descuentos vigentes'}
                 </button>
              </div>

              {showRules && (
                 <div className="mt-5 bg-gradient-to-br from-info-light to-blue-50 p-5 rounded-xl text-sm space-y-2 border border-info/20 shadow-soft">
                    <h4 className="font-bold text-brand-primary mb-3 text-base">Reglas activas ({input.pais}):</h4>

                    {activeDiscounts.length > 0 ? (
                        <div className="mb-3">
                           <ul className="list-disc pl-5 space-y-2 text-gray-700">
                               {activeDiscounts.map((rule) => (
                                   <li key={rule.id} className="leading-relaxed">
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
            <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-medium border border-gray-100/50 sticky top-8 min-h-[500px] hover:shadow-strong transition-shadow duration-300">
              <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-8">Resultado de Cotización</h2>
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
      <footer className="text-center py-8 text-gray-600 text-sm mt-12 border-t border-gray-200/50 backdrop-blur-sm">
        <p className="font-semibold text-brand-primary">Tutto Cotizador MVP &copy; {new Date().getFullYear()}</p>
        <p className="text-xs mt-2 text-gray-500">Precios sincronizados con Google Sheets</p>
      </footer>
    </div>
  );
}

export default App;