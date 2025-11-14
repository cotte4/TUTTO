import React from 'react';
import { QuoteResult as QuoteResultType } from '../types';
import { InfoIcon } from './IconComponents';

interface QuoteResultProps {
  result: QuoteResultType | null;
  isCalculated: boolean;
  error?: string | null;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const QuoteResult: React.FC<QuoteResultProps> = ({ result, isCalculated, error }) => {

  if (!isCalculated) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center text-gray-500">
        <InfoIcon className="w-16 h-16 mb-4 text-gray-300" />
        <h3 className="text-xl font-semibold">Esperando cálculo</h3>
        <p className="mt-1">Complete los datos y presione "Cotizar" para ver el resultado.</p>
      </div>
    );
  }
  
  if (error || !result) {
     return (
      <div className="flex flex-col items-center justify-center h-96 text-center text-red-600">
        <InfoIcon className="w-16 h-16 mb-4 text-red-400" />
        <h3 className="text-xl font-semibold">No se pudo calcular</h3>
        <p className="mt-1 max-w-md">{error || 'Verifique que la zona y el servicio sean válidos y la cantidad sea mayor a 0.'}</p>
      </div>
    );
  }

  const { min, max, detail, notes } = result;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <p className="text-sm font-medium text-gray-500">Estimado Final</p>
        <p className="text-4xl sm:text-5xl font-extrabold text-brand-primary tracking-tight">
          {formatCurrency(min)} – {formatCurrency(max)}
        </p>
        <p className="text-sm text-gray-500">Rango de precios orientativo (ARS)</p>
      </div>

      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-200">Desglose de la Cotización</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center py-1">
            <p>Precio Base (Lista Nacional)</p>
            <p className="font-mono font-medium">{formatCurrency(detail.basePrice)}</p>
          </div>
          
          {detail.appliedModifiers.length > 0 && (
            <div className="pl-4 border-l-2 border-amber-300 my-2 py-1">
              <p className="font-semibold text-gray-600 mb-1">Modificadores:</p>
              {detail.appliedModifiers.map(mod => (
                  <div key={mod.clave} className="flex justify-between items-center py-1 text-gray-600">
                    <p>{mod.label}</p>
                    <p className="font-mono">{`+${(mod.pct * 100).toFixed(0)}%`}</p>
                  </div>
              ))}
            </div>
          )}
          
          <div className="flex justify-between items-center py-2 font-semibold text-brand-primary border-t border-gray-200 mt-2">
            <p>Subtotal por Trabajo</p>
            <p className="font-mono">{formatCurrency(detail.workloadPrice)}</p>
          </div>
          
          {detail.zoneDiscountAmount !== 0 && (
             <div className="flex justify-between items-center py-1 text-green-700">
                <p>{`Descuento Zona (${detail.zoneId} @ ${(detail.zoneDiscountPct * 100).toFixed(0)}%)`}</p>
                <p className="font-mono font-medium">{formatCurrency(-detail.zoneDiscountAmount)}</p>
             </div>
          )}
          {detail.operaryName && (
             <div className="flex justify-between items-center py-1 text-gray-600">
                <p>Operario Disponible</p>
                <p className="font-medium">{detail.operaryName}</p>
             </div>
          )}

          <div className="border-t-2 border-gray-300 my-2"></div>

          <div className="flex justify-between items-center py-1 text-lg font-bold text-brand-dark">
            <p>Total Estimado</p>
            <p className="font-mono">{formatCurrency(detail.finalPrice)}</p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-4 italic">Fórmula: {detail.formula}</p>
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