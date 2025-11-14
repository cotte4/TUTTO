import React from 'react';
import { QuoteResult as QuoteResultType, Moneda } from '../types';
import { InfoIcon } from './IconComponents';

interface QuoteResultProps {
  result: QuoteResultType | null;
  isCalculated: boolean;
  error?: string | null;
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
  // Simple format for Boliviano
  return `Bs ${new Intl.NumberFormat('es-BO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
  }).format(value)}`;
};

export const QuoteResult: React.FC<QuoteResultProps> = ({ result, isCalculated, error }) => {

  if (!isCalculated) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-96 text-center text-gray-500">
        <InfoIcon className="w-16 h-16 mb-4 text-gray-300" />
        <h3 className="text-xl font-semibold">Esperando cálculo</h3>
        <p className="mt-1">Complete los datos y presione "Cotizar" para ver el resultado.</p>
      </div>
    );
  }
  
  if (error || !result) {
     return (
      <div className="flex flex-col items-center justify-center h-full min-h-96 text-center text-red-600">
        <InfoIcon className="w-16 h-16 mb-4 text-red-400" />
        <h3 className="text-xl font-semibold">No se pudo calcular</h3>
        <p className="mt-1 max-w-md">{error || 'Verifique los datos ingresados.'}</p>
      </div>
    );
  }

  const { min, max, detail, notes } = result;
  const { moneda } = detail;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <p className="text-sm font-medium text-gray-500">Estimado Final</p>
        <p className="text-4xl sm:text-5xl font-extrabold text-brand-primary tracking-tight">
          {formatCurrency(min, moneda)} – {formatCurrency(max, moneda)}
        </p>
        <p className="text-sm text-gray-500">Rango de precios orientativo ({moneda})</p>
      </div>

      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-200">Desglose de la Cotización</h4>
        <div className="space-y-2 text-sm">
          {detail.items.map(item => (
            <div key={item.service.servicio_id} className="flex justify-between items-center py-1">
              <p className="text-gray-700 max-w-[80%]">{item.service.subservicio} (x{item.quantity})</p>
              <p className="font-mono font-medium">{formatCurrency(item.basePrice, moneda)}</p>
            </div>
          ))}

          <div className="border-t border-gray-200 my-2"></div>
          
          <div className="flex justify-between items-center py-1 font-semibold">
            <p>Subtotal</p>
            <p className="font-mono">{formatCurrency(detail.workloadSubtotal, moneda)}</p>
          </div>
          
          {detail.appliedDiscount && (
             <div className="flex justify-between items-center py-1 text-green-700">
                <p>{detail.appliedDiscount.description}</p>
                <p className="font-mono font-medium">-{formatCurrency(detail.appliedDiscount.amount, moneda)}</p>
             </div>
          )}

          {detail.minimumChargeApplied > 0 && (
             <div className="flex justify-between items-center py-1 text-blue-700">
                <p>Ajuste por monto mínimo</p>
                <p className="font-mono font-medium">+{formatCurrency(detail.minimumChargeApplied, moneda)}</p>
             </div>
          )}

          {detail.operaryName && (
             <div className="flex justify-between items-center py-1 text-gray-600 border-t border-gray-100 mt-2 pt-2">
                <p>Operario Asignado</p>
                <p className="font-medium">{detail.operaryName}</p>
             </div>
          )}

          <div className="border-t-2 border-gray-300 my-2"></div>

          <div className="flex justify-between items-center py-1 text-lg font-bold text-brand-dark">
            <p>Total Estimado</p>
            <p className="font-mono">{formatCurrency(detail.finalPrice, moneda)}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Notas Importantes</h4>
        <ul className="space-y-2 text-sm list-disc list-inside text-gray-600">
          {notes.map((note, index) => <li key={index}>{note}</li>)}
        </ul>
      </div>
    </div>
  );
};
