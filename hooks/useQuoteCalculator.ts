import { useState, useCallback } from 'react';
import { QuoteInput, QuoteResult, Service, Modifier, Zone, PostalCode } from '../types';
import { calculateQuote } from '../services/pricingEngine';

const initialInput: QuoteInput = {
  cp: '',
  provincia: '',
  ciudad: '',
  serviceId: '',
  quantity: 1,
  flags: {},
};

interface UseQuoteCalculatorProps {
    services: Service[];
    modifiers: Modifier[];
    zones: Zone[];
    postalCodes: PostalCode[];
}

export const useQuoteCalculator = ({ services, modifiers, zones, postalCodes }: UseQuoteCalculatorProps) => {
  const [input, setInput] = useState<QuoteInput>(initialInput);
  const [result, setResult] = useState<QuoteResult | null>(null);
  const [isCalculated, setIsCalculated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const activeServices = services.filter(s => s.active);

  const calculate = useCallback(() => {
    setIsCalculated(true);
    setError(null);

    // Basic validation
    const hasLocation = input.cp.trim() !== '' || (input.provincia.trim() !== '' && input.ciudad.trim() !== '');
    const hasService = input.serviceId.trim() !== '';
    if (!hasLocation || !hasService || input.quantity <= 0) {
      setError("Por favor, complete el código postal (o provincia y ciudad), seleccione un servicio y asegúrese que la cantidad sea mayor a 0.");
      setResult(null);
      return;
    }

    const quoteResult = calculateQuote(input, activeServices, modifiers, zones, postalCodes);
    
    if (quoteResult === null || typeof quoteResult === 'string') {
        let errorMessage = 'Ocurrió un error inesperado al calcular la cotización.';
        if (quoteResult === 'ZONE_NOT_FOUND') {
            const locationIdentifier = input.cp || `${input.provincia}, ${input.ciudad}`;
            errorMessage = `La zona especificada ("${locationIdentifier}") no fue encontrada en nuestra base de datos.`;
        } else if (quoteResult === 'ZONE_INACTIVE') {
            errorMessage = `La zona especificada no se encuentra activa para cotizaciones en este momento.`;
        } else if (quoteResult === 'SERVICE_NOT_FOUND') {
            // This should not happen if UI is correct, but good to have
            errorMessage = `El servicio seleccionado no es válido o está inactivo.`;
        }
        setError(errorMessage);
        setResult(null);
    } else {
        setResult(quoteResult);
        setError(null);
    }
  }, [input, activeServices, modifiers, zones, postalCodes]);

  const reset = useCallback(() => {
    setInput(initialInput);
    setResult(null);
    setIsCalculated(false);
    setError(null);
  }, []);

  return {
    input,
    setInput,
    result,
    calculate,
    services: activeServices, // Return active services for the form dropdown
    modifiers,
    isCalculated,
    error,
    reset,
  };
};