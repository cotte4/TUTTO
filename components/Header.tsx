import React from 'react';
import { CopyIcon, CalculatorIcon, SheetIcon } from './IconComponents';

interface HeaderProps {
  onCopy: () => void;
  isResultReady: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onCopy, isResultReady }) => {
  return (
    <header className="relative bg-gradient-to-br from-brand-primary via-blue-900 to-brand-primary shadow-2xl border-b border-blue-800/50">
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Title Section */}
          <div className="flex items-center gap-3 group">
            <div className="relative">
              {/* Icon glow effect */}
              <div className="absolute inset-0 bg-brand-accent/30 rounded-xl blur-md group-hover:bg-brand-accent/50 transition-all duration-300"></div>
              <div className="relative bg-gradient-to-br from-brand-accent to-yellow-500 p-2.5 rounded-xl shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <CalculatorIcon className="h-7 w-7 text-brand-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Tutto Cotizador
              </h1>
              <p className="text-xs text-blue-300 font-medium hidden sm:block">Sistema de Cotizaciones Profesional</p>
            </div>
          </div>

          {/* Action Buttons Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Copy Button */}
            <button
              onClick={onCopy}
              disabled={!isResultReady}
              className={`
                group relative flex items-center gap-2 px-3 sm:px-5 py-2.5
                text-sm font-semibold rounded-xl
                transition-all duration-300 transform
                ${isResultReady
                  ? 'bg-gradient-to-r from-brand-secondary to-blue-500 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105 hover:-translate-y-0.5 active:scale-95'
                  : 'bg-gray-300/50 text-gray-500 cursor-not-allowed backdrop-blur-sm'
                }
              `}
            >
              {isResultReady && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
              )}
              <CopyIcon className={`h-5 w-5 ${isResultReady ? 'group-hover:scale-110 transition-transform duration-300' : ''}`} />
              <span className="hidden sm:inline relative">Copiar Resumen</span>
            </button>

            {/* Spreadsheet Button */}
            <a
              href="https://docs.google.com/spreadsheets/d/1b3IPPE0pQ0mYEDp296lCBDPMNqVhV0_Y6KZ729UjG2U/edit?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="
                group relative flex items-center gap-2 px-3 sm:px-5 py-2.5
                text-sm font-semibold rounded-xl
                bg-gradient-to-r from-green-600 to-emerald-600 text-white
                shadow-lg hover:shadow-xl hover:shadow-green-500/50
                transition-all duration-300 transform
                hover:scale-105 hover:-translate-y-0.5 active:scale-95
              "
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
              <SheetIcon className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="hidden sm:inline relative">Hoja de cálculo</span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-accent to-transparent opacity-60"></div>
    </header>
  );
};