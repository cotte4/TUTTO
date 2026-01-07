import { useState, useEffect } from 'react';
import { Service, Zone, PostalCode, DiscountRule } from '../types';
import { parseCSV, mapServices, mapZones, mapPostalCodes, mapDiscounts, mapExtras } from '../utils/csvParser';
import { SERVICIOS, ZONAS, POSTAL_CODES } from '../data/mockData';

// --- CONFIGURATION ---
const SHEET_ID = '14Pp2ddMEz-crq9XSzkvJNcCM71627_6a5NLIOxPKgrc'; 

// We use the Google Visualization API endpoint (gviz) because it handles CORS 
// much better than the standard /export endpoint for public/shared sheets.
// tqx=out:csv tells it to return raw CSV data.
const BASE_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;

export const useGoogleSheetsData = () => {
  // Initialize with mock data so the app has content immediately (or if fetch fails)
  const [services, setServices] = useState<Service[]>(SERVICIOS);
  const [zones, setZones] = useState<Zone[]>(ZONAS);
  const [postalCodes, setPostalCodes] = useState<PostalCode[]>(POSTAL_CODES);
  const [discounts, setDiscounts] = useState<DiscountRule[]>([]);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!SHEET_ID) {
      console.warn("Google Sheets ID is missing. Using local mock data.");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log("Fetching data from Google Sheets (GVIZ)...");
        
        // Cache busting to ensure we get fresh data
        const timestamp = new Date().getTime();

        // credentials: 'omit' is CRITICAL for public/shared sheets to avoid CORS errors
        const fetchOptions: RequestInit = {
            method: 'GET',
            credentials: 'omit',
            headers: {
                'Content-Type': 'text/csv'
            }
        };

        // Updated Sheet Names based on user input
        const [servicesRes, extrasRes, zonesRes, postalRes, discountsRes] = await Promise.all([
          fetch(`${BASE_URL}&sheet=Servicios&t=${timestamp}`, fetchOptions),
          fetch(`${BASE_URL}&sheet=Extras&t=${timestamp}`, fetchOptions),
          fetch(`${BASE_URL}&sheet=Zonas&t=${timestamp}`, fetchOptions),
          fetch(`${BASE_URL}&sheet=CodigoPostal&t=${timestamp}`, fetchOptions),
          fetch(`${BASE_URL}&sheet=Descuentos&t=${timestamp}`, fetchOptions)
        ]);

        if (!servicesRes.ok || !zonesRes.ok || !postalRes.ok) {
          throw new Error(`Error de red al conectar con Google Sheets (Status: ${servicesRes.status}).`);
        }

        const servicesText = await servicesRes.text();
        const extrasText = extrasRes.ok ? await extrasRes.text() : "";
        const zonesText = await zonesRes.text();
        const postalText = await postalRes.text();
        const discountsText = discountsRes.ok ? await discountsRes.text() : "";

        // Check for common GVIZ errors
        if (servicesText.includes("<!DOCTYPE html") || servicesText.includes("google.com/accounts")) {
          throw new Error("Acceso denegado. Verifique que el Sheet esté compartido como 'Cualquiera con el enlace puede ver'.");
        }

        // Parse CSVs with new mappers
        const parsedServices = mapServices(parseCSV(servicesText));
        const parsedExtras = extrasRes.ok ? mapExtras(parseCSV(extrasText)) : [];
        const parsedZones = mapZones(parseCSV(zonesText));
        const parsedPostalCodes = mapPostalCodes(parseCSV(postalText));
        const parsedDiscounts = discountsRes.ok ? mapDiscounts(parseCSV(discountsText)) : [];

        // Merge Services and Extras
        // Extras are treated as Services in the app logic
        const allServices = [...parsedServices, ...parsedExtras];

        if (allServices.length > 0) setServices(allServices);
        if (parsedZones.length > 0) setZones(parsedZones);
        if (parsedPostalCodes.length > 0) setPostalCodes(parsedPostalCodes);
        if (parsedDiscounts.length > 0) setDiscounts(parsedDiscounts);
        
        console.log("Data fetched successfully:", { 
            services: parsedServices.length, 
            extras: parsedExtras.length,
            zones: parsedZones.length, 
            postalCodes: parsedPostalCodes.length,
            discounts: parsedDiscounts.length
        });

      } catch (err: any) {
        console.error("Error fetching Google Sheets data:", err);
        
        if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
             setError("Error de conexión (CORS). Intente abrir el enlace del Sheet en una pestaña privada para verificar permisos.");
        } else {
             setError(err.message || "Error cargando datos. Usando versión offline.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { services, zones, postalCodes, discounts, loading, error };
};