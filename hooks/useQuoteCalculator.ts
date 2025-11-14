import { useState, useCallback, useMemo } from 'react';
import { QuoteInput, QuoteResult, Service, Zone, PostalCode } from '../types';
import { calculateQuote, CalculateQuoteResult } from '../services/pricingEngine';

const initialInput: QuoteInput = {
  pais: 'AR',
  cp: '',
  provincia: '',
  ciudad: '',
  items: [],
  paymentMethod: 'cash_transfer',
};

interface UseQuoteCalculatorProps {
    services: Service[];
    zones: Zone[];
    postalCodes: PostalCode[];
}

export const useQuoteCalculator = ({ services, zones, postalCodes }: UseQuoteCalculatorProps) => {
  const [input, setInput] = useState<QuoteInput>(initialInput);
  const [result, setResult] = useState<QuoteResult | null>(null);
  const [isCalculated, setIsCalculated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const servicesForCountry = useMemo(() => {
    return services.filter(s => s.pais === input.pais && s.active);
  }, [services, input.pais]);

  const calculate = useCallback(() => {
    setIsCalculated(true);
    setError(null);

    // Basic validation
    if (input.pais !== 'AR' && input.pais !== 'BO') {
        setError("Por favor, seleccione un país válido.");
        setResult(null);
        return;
    }
    
    // **Location is only required for Argentina**
    if (input.pais === 'AR') {
        const hasLocation = input.cp.trim() !== '' || (input.provincia.trim() !== '' && input.ciudad.trim() !== '');
        if (!hasLocation) {
            setError("Para Argentina, por favor complete el código postal o seleccione provincia y ciudad.");
            setResult(null);
            return;
        }
    }

    if (input.items.length === 0) {
        setError("Por favor, agregue al menos un servicio para cotizar.");
        setResult(null);
        return;
    }

    const quoteResult: CalculateQuoteResult | null = calculateQuote(input, services, zones, postalCodes);
    
    if (quoteResult === null || typeof quoteResult === 'string') {
        let errorMessage = 'Ocurrió un error inesperado al calcular la cotización.';
        if (quoteResult === 'ZONE_NOT_FOUND') {
            const locationIdentifier = input.cp || `${input.provincia}, ${input.ciudad}`;
            errorMessage = `La zona especificada ("${locationIdentifier}") no fue encontrada para el país seleccionado.`;
        } else if (quoteResult === 'ZONE_INACTIVE') {
            errorMessage = `La zona especificada no se encuentra activa para cotizaciones en este momento.`;
        } else if (quoteResult === 'SERVICE_NOT_FOUND') {
            errorMessage = `Uno de los servicios seleccionados no es válido o está inactivo.`;
        }
        setError(errorMessage);
        setResult(null);
    } else {
        setResult(quoteResult);
        setError(null);
    }
  }, [input, services, zones, postalCodes]);

  const reset = useCallback(() => {
    // Resets to initial state but keeps the selected country
    setInput(prev => ({
        ...initialInput,
        pais: prev.pais
    }));
    setResult(null);
    setIsCalculated(false);
    setError(null);
  }, []);

  return {
    input,
    setInput,
    result,
    calculate,
    services: servicesForCountry,
    modifiers: [], // Modifiers are deprecated
    isCalculated,
    error,
    reset,
  };
};