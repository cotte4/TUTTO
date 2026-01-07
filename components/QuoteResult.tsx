import React from 'react';
import { QuoteResult as QuoteResultType, Moneda, ServiceUnit, QuoteInput } from '../types';
import { InfoIcon, CalculatorIcon } from './IconComponents';

interface QuoteResultProps {
  result: QuoteResultType | null;
  isCalculated: boolean;
  isCalculating?: boolean;
  error?: string | null;
  input: QuoteInput;
}

const formatCurrency = (value: number, currency: Moneda) => {
  if (currency === 'ARS') {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
  return `Bs ${new Intl.NumberFormat('es-BO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
  }).format(value)}`;
};

export const QuoteResult: React.FC<QuoteResultProps> = ({ result, isCalculated, isCalculating = false, error, input }) => {

  // --- Determine Completion Steps ---
  const step1Complete = Boolean(input.pais && input.provincia && input.ciudad);
  const step2Complete = input.items.length > 0;
  // Step 3 is calculation done

  // --- Helper to render checklist item ---
  const renderStep = (stepNumber: number, title: string, description: string, isComplete: boolean, isActive: boolean) => (
    <div className={`flex items-start gap-4 p-4 rounded-lg transition-all duration-300 ${isActive ? 'bg-blue-50 border border-blue-100 shadow-sm' : 'opacity-70'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300
        ${isComplete ? 'bg-green-500 text-white' : isActive ? 'bg-brand-secondary text-white animate-pulse' : 'bg-gray-200 text-gray-500'}`}>
        {isComplete ? '✓' : stepNumber}
      </div>
      <div>
        <h5 className={`font-semibold ${isActive || isComplete ? 'text-gray-900' : 'text-gray-500'}`}>{title}</h5>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  );

  // --- VIEW: Calculating Spinner ---
  if (isCalculating) {
      return (
        <div className="h-full flex flex-col justify-center items-center animate-fade-in min-h-[400px]">
           <div className="w-16 h-16 border-4 border-gray-200 border-t-brand-secondary rounded-full animate-spin mb-4"></div>
           <p className="text-gray-500 font-medium">Procesando cotización...</p>
        </div>
      )
  }

  // --- VIEW: Checklist Assistant ---
  if (!isCalculated) {
    return (
      <div className="h-full flex flex-col justify-center animate-fade-in">
        <div className="text-center mb-8">
           <div className="inline-block p-3 bg-brand-light rounded-full mb-3">
              <CalculatorIcon className="w-8 h-8 text-brand-secondary" />
           </div>
           <h3 className="text-xl font-bold text-gray-800">Asistente de Cotización</h3>
           <p className="text-gray-500 text-sm">Sigue los pasos para obtener el precio</p>
        </div>

        <div className="space-y-4 max-w-md mx-auto w-full">
            {renderStep(
                1, 
                "Define la Ubicación", 
                "Selecciona País, Provincia y Ciudad para determinar la zona tarifaria.", 
                step1Complete, 
                !step1Complete
            )}
            
            {renderStep(
                2, 
                "Agrega Servicios", 
                "Selecciona los ítems a limpiar y sus cantidades.", 
                step2Complete, 
                step1Complete && !step2Complete
            )}
            
            {renderStep(
                3, 
                "Calcula el Total", 
                "Presiona el botón 'Calcular Cotización' para ver el desglose final.", 
                false, 
                step1Complete && step2Complete
            )}
        </div>
      </div>
    );
  }
  
  // --- VIEW: Error State ---
  if (error || !result) {
     return (
      <div className="flex flex-col items-center justify-center h-full min-h-96 text-center text-gray-500 animate-fade-in">
        <InfoIcon className="w-16 h-16 mb-4 text-gray-300" />
        <h3 className="text-xl font-semibold text-gray-700">Todavía no podemos calcular tu cotización</h3>
        <p className="mt-2 max-w-md text-sm text-gray-500">{error || 'Por favor, completá los datos del formulario para ver el precio final.'}</p>
      </div>
    );
  }

  const { detail } = result;
  const { moneda } = detail;

  // --- VIEW: Final Result ---
  return (
    <div className="space-y-6 animate-slide-up">
      {/* Dynamic Style Injection for Animations */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slide-up {
          animation: slideUp 0.5s ease-out forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .animate-pop-in {
             animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm relative overflow-hidden">
        {/* Operary Badge - Now Prominent */}
        {detail.operaryName && (
           <div className="bg-brand-light border-b border-gray-100 p-3 -mx-5 -mt-5 mb-5 flex justify-between items-center px-5">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Operario Asignado</span>
              <span className="text-xs font-bold text-brand-secondary bg-blue-50 px-2 py-1 rounded border border-blue-100 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" />
                </svg>
                {detail.operaryName}
              </span>
           </div>
        )}

        <h4 className="text-lg font-bold text-brand-primary mb-4 pb-2 border-b border-gray-100">Desglose de la Cotización</h4>
        <div className="space-y-3 text-sm">
          {detail.items.map(item => {
             const isM2 = item.service.unidad === ServiceUnit.M2;
             return (
              <div key={item.service.servicio_id} className="flex justify-between items-start py-1">
                <div className="pr-4">
                    <p className="text-gray-800 font-medium">{item.service.subservicio}</p>
                    <p className="text-xs text-gray-500">
                        {item.service.servicio} • {isM2 ? `${item.quantity} m²` : `x${item.quantity}`}
                    </p>
                </div>
                <p className="font-mono font-medium text-gray-700 whitespace-nowrap">{formatCurrency(item.basePrice, moneda)}</p>
              </div>
            );
          })}

          <div className="border-t border-dashed border-gray-300 my-4"></div>
          
          <div className="flex justify-between items-center py-1 text-gray-600">
            <p>Subtotal</p>
            <p className="font-mono">{formatCurrency(detail.workloadSubtotal, moneda)}</p>
          </div>
          
          {detail.appliedDiscount && (
             <div className="flex justify-between items-center py-1 text-green-700 bg-green-50 px-2 rounded -mx-2">
                <p className="text-xs font-semibold">{detail.appliedDiscount.description}</p>
                <p className="font-mono font-medium">-{formatCurrency(detail.appliedDiscount.amount, moneda)}</p>
             </div>
          )}

          {/* New Highlighted Total Section */}
          <div className="mt-6 pt-2 animate-pop-in">
             <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-end mb-1">
                  <p className="text-brand-secondary font-bold text-xs uppercase tracking-wider mb-1">Total Estimado</p>
                  <div className="text-right">
                     <p className="text-3xl lg:text-4xl font-extrabold text-brand-primary leading-none tracking-tight">
                       {formatCurrency(detail.finalPrice, moneda)}
                     </p>
                  </div>
                </div>
                {/* Stronger Divider */}
                <div className="border-t-2 border-blue-200/50 mt-3 pt-2"></div>
                
                <div className="flex justify-between items-center mt-1">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">
                       Ref: <span className="text-gray-500">{detail.zoneId}</span>
                    </p>
                    
                    {/* Tooltip implementation */}
                    <div className="group relative flex items-center gap-1 cursor-help">
                         <p className="text-xs text-gray-500 font-medium italic border-b border-dotted border-gray-400">
                            Confirmación in situ
                        </p>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-800 text-white text-[10px] rounded shadow-lg z-10 pointer-events-none">
                            El precio final puede variar según el estado real de los tapizados al momento de la visita.
                            <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-gray-800"></div>
                        </div>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};