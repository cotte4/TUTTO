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

// Additional Icons
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
  </svg>
);

const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z" clipRule="evenodd" />
  </svg>
);

const MapPinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
  </svg>
);

const ListBulletIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M2.625 6.75a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0A.75.75 0 018.25 6h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75zM2.625 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zM7.5 12a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12A.75.75 0 017.5 12zm-4.875 5.25a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75z" clipRule="evenodd" />
  </svg>
);

const CurrencyDollarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 01-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004zM12.75 15.662v-2.824c.347.085.664.228.921.421.427.32.579.686.579.991 0 .305-.152.671-.579.991a2.534 2.534 0 01-.921.42z" />
    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v.816a3.836 3.836 0 00-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v2.978a2.536 2.536 0 01-.921-.421l-.879-.66a.75.75 0 00-.9 1.2l.879.66c.533.4 1.169.645 1.821.75V18a.75.75 0 001.5 0v-.81a4.124 4.124 0 001.821-.749c.745-.559 1.179-1.344 1.179-2.191 0-.847-.434-1.632-1.179-2.191a4.122 4.122 0 00-1.821-.75V8.354c.29.082.559.213.786.393l.415.33a.75.75 0 00.933-1.175l-.415-.33a3.836 3.836 0 00-1.719-.755V6z" clipRule="evenodd" />
  </svg>
);

export const QuoteResult: React.FC<QuoteResultProps> = ({ result, isCalculated, isCalculating = false, error, input }) => {

  // --- Determine Completion Steps ---
  const step1Complete = Boolean(input.pais && input.provincia && input.ciudad);
  const step2Complete = input.items.length > 0;
  // Step 3 is calculation done

  // --- Helper to render checklist item ---
  const renderStep = (stepNumber: number, title: string, description: string, isComplete: boolean, isActive: boolean, icon: React.ReactNode) => (
    <div className={`relative flex items-start gap-4 p-5 rounded-xl transition-all duration-500 transform hover:scale-[1.02]
      ${isActive ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-lg' :
      isComplete ? 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200' :
      'bg-gray-50 border border-gray-200 opacity-60'}`}>

      {/* Decorative Corner Accent */}
      {isActive && (
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-200/30 to-transparent rounded-bl-full"></div>
      )}

      <div className={`relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base transition-all duration-500 shadow-md
        ${isComplete ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white scale-110 rotate-6' :
        isActive ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white animate-pulse-subtle' :
        'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-600'}`}>
        {isComplete ? <CheckCircleIcon className="w-7 h-7" /> : icon}
      </div>

      <div className="flex-1 relative z-10">
        <h5 className={`font-bold text-base mb-1.5 transition-colors duration-300
          ${isActive || isComplete ? 'text-gray-900' : 'text-gray-600'}`}>
          {title}
        </h5>
        <p className={`text-sm leading-relaxed transition-colors duration-300
          ${isActive ? 'text-gray-700' : 'text-gray-500'}`}>
          {description}
        </p>

        {/* Progress indicator for active step */}
        {isActive && (
          <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-blue-600">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-ping"></div>
            En progreso
          </div>
        )}
      </div>
    </div>
  );

  // --- VIEW: Calculating Spinner ---
  if (isCalculating) {
      return (
        <div className="h-full flex flex-col justify-center items-center animate-fade-in min-h-[400px]">
          <div className="relative">
            {/* Outer spinning ring */}
            <div className="w-20 h-20 border-4 border-gray-200 rounded-full animate-spin"></div>
            {/* Inner spinning gradient ring */}
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-brand-secondary border-r-blue-400 rounded-full animate-spin"></div>
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <CalculatorIcon className="w-8 h-8 text-brand-secondary animate-pulse" />
            </div>
          </div>

          {/* Loading text with animated dots */}
          <div className="mt-6 flex flex-col items-center gap-2">
            <p className="text-gray-700 font-semibold text-lg">Procesando cotización</p>
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-brand-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-brand-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-brand-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>

          {/* Skeleton preview */}
          <div className="mt-8 w-full max-w-md space-y-3 opacity-40">
            <div className="h-4 bg-gray-200 rounded-full w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded-full w-full animate-pulse" style={{ animationDelay: '100ms' }}></div>
            <div className="h-4 bg-gray-200 rounded-full w-5/6 animate-pulse" style={{ animationDelay: '200ms' }}></div>
          </div>
        </div>
      )
  }

  // --- VIEW: Checklist Assistant ---
  if (!isCalculated) {
    return (
      <div className="h-full flex flex-col justify-center animate-fade-in py-8">
        {/* Header with gradient background */}
        <div className="text-center mb-10 relative">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full blur-3xl opacity-30"></div>
          </div>

          <div className="inline-flex items-center justify-center relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl blur-lg opacity-30 animate-pulse"></div>
            <div className="relative p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg">
              <CalculatorIcon className="w-10 h-10 text-brand-secondary" />
            </div>
          </div>

          <h3 className="text-2xl font-bold text-gray-800 mb-2">Asistente de Cotización</h3>
          <p className="text-gray-600 text-sm max-w-sm mx-auto">Sigue estos pasos para obtener tu precio personalizado</p>

          {/* Progress bar */}
          <div className="mt-6 max-w-xs mx-auto">
            <div className="flex justify-between mb-2 text-xs font-semibold text-gray-500">
              <span>Progreso</span>
              <span>{step1Complete && step2Complete ? '67%' : step1Complete ? '33%' : '0%'}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-700 ease-out rounded-full"
                style={{ width: step1Complete && step2Complete ? '67%' : step1Complete ? '33%' : '0%' }}
              ></div>
            </div>
          </div>
        </div>

        <div className="space-y-5 max-w-lg mx-auto w-full px-4">
            {renderStep(
                1,
                "Define la Ubicación",
                "Selecciona País, Provincia y Ciudad para determinar la zona tarifaria.",
                step1Complete,
                !step1Complete,
                <MapPinIcon className="w-6 h-6" />
            )}

            {renderStep(
                2,
                "Agrega Servicios",
                "Selecciona los ítems a limpiar y sus cantidades.",
                step2Complete,
                step1Complete && !step2Complete,
                <ListBulletIcon className="w-6 h-6" />
            )}

            {renderStep(
                3,
                "Calcula el Total",
                "Presiona el botón 'Calcular Cotización' para ver el desglose final.",
                false,
                step1Complete && step2Complete,
                <CurrencyDollarIcon className="w-6 h-6" />
            )}
        </div>

        {/* Motivational footer */}
        {step1Complete && step2Complete && (
          <div className="mt-8 text-center animate-bounce-slow">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full shadow-sm">
              <SparklesIcon className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-green-700">Listo para calcular</span>
            </div>
          </div>
        )}
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
        .animate-pulse-subtle {
          animation: pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulseSubtle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.95; transform: scale(1.02); }
        }
        .animate-bounce-slow {
          animation: bounceSlow 2s infinite;
        }
        @keyframes bounceSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .item-enter {
          animation: itemEnter 0.4s ease-out forwards;
        }
        @keyframes itemEnter {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {/* Success Badge */}
      <div className="flex items-center justify-center gap-2 mb-2 animate-pop-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full shadow-sm">
          <CheckCircleIcon className="w-5 h-5 text-green-600" />
          <span className="text-sm font-semibold text-green-700">Cotización Calculada</span>
        </div>
      </div>

      <div className="border-2 border-gray-200 rounded-2xl p-6 bg-white shadow-lg relative overflow-hidden">
        {/* Decorative gradient background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl opacity-40 -z-0"></div>

        {/* Operary Badge - Enhanced */}
        {detail.operaryName && (
           <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-100 p-4 -mx-6 -mt-6 mb-6 flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white">
                    <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Operario Asignado</span>
              </div>
              <span className="text-sm font-bold text-brand-secondary bg-white px-3 py-1.5 rounded-lg border border-blue-200 shadow-sm flex items-center gap-1.5">
                <SparklesIcon className="w-4 h-4" />
                {detail.operaryName}
              </span>
           </div>
        )}

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
              <ListBulletIcon className="w-5 h-5 text-brand-secondary" />
            </div>
            <h4 className="text-xl font-bold text-brand-primary">Desglose de la Cotización</h4>
          </div>

          <div className="space-y-3 text-sm">
            {detail.items.map((item, index) => {
               const isM2 = item.service.unidad === ServiceUnit.M2;
               return (
                <div
                  key={item.service.servicio_id}
                  className="flex justify-between items-start py-3 px-4 rounded-lg bg-gradient-to-r from-gray-50 to-transparent hover:from-blue-50 hover:to-indigo-50/30 transition-all duration-300 border border-transparent hover:border-blue-100 item-enter"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="pr-4 flex-1">
                      <p className="text-gray-900 font-semibold mb-1">{item.service.subservicio}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-gray-100 rounded-md font-medium">{item.service.servicio}</span>
                          <span className="text-gray-400">•</span>
                          <span className="font-mono">{isM2 ? `${item.quantity} m²` : `x${item.quantity}`}</span>
                      </p>
                  </div>
                  <p className="font-mono font-bold text-gray-800 whitespace-nowrap text-base">{formatCurrency(item.basePrice, moneda)}</p>
                </div>
              );
            })}

            <div className="border-t-2 border-dashed border-gray-300 my-6"></div>

            <div className="flex justify-between items-center py-2 px-4 text-gray-700">
              <p className="font-semibold">Subtotal</p>
              <p className="font-mono font-bold text-lg">{formatCurrency(detail.workloadSubtotal, moneda)}</p>
            </div>

            {detail.appliedDiscount && (
               <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-md">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white">
                        <path fillRule="evenodd" d="M5.5 3A2.5 2.5 0 003 5.5v2.879a2.5 2.5 0 00.732 1.767l6.5 6.5a2.5 2.5 0 003.536 0l2.878-2.878a2.5 2.5 0 000-3.536l-6.5-6.5A2.5 2.5 0 008.38 3H5.5zM6 7a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-green-800">{detail.appliedDiscount.description}</p>
                  </div>
                  <p className="font-mono font-bold text-green-700 text-base">-{formatCurrency(detail.appliedDiscount.amount, moneda)}</p>
               </div>
            )}

            {/* Enhanced Total Section */}
            <div className="mt-8 pt-2 animate-pop-in">
               <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                  {/* Decorative pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
                  </div>

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <CurrencyDollarIcon className="w-6 h-6 text-white" />
                        <p className="text-white/90 font-bold text-sm uppercase tracking-wider">Total Estimado</p>
                      </div>
                    </div>

                    <div className="text-right mb-4">
                       <p className="text-4xl lg:text-5xl font-extrabold text-white leading-none tracking-tight drop-shadow-lg">
                         {formatCurrency(detail.finalPrice, moneda)}
                       </p>
                    </div>

                    <div className="border-t-2 border-white/20 pt-4"></div>

                    <div className="flex justify-between items-center">
                        <p className="text-[10px] text-white/70 uppercase font-semibold tracking-wide">
                           Zona Ref: <span className="text-white/90 font-bold">{detail.zoneId}</span>
                        </p>

                        {/* Tooltip implementation */}
                        <div className="group relative flex items-center gap-1 cursor-help">
                             <InfoIcon className="w-4 h-4 text-white/80" />
                             <p className="text-xs text-white/90 font-medium">
                                Sujeto a confirmación
                            </p>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full right-0 mb-3 w-56 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-2xl z-10 pointer-events-none leading-relaxed">
                                El precio final puede variar según el estado real de los tapizados al momento de la visita.
                                <div className="absolute top-full right-6 -mt-1 border-[6px] border-transparent border-t-gray-900"></div>
                            </div>
                        </div>
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