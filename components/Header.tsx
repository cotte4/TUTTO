import React from 'react';
import { CopyIcon, CalculatorIcon, SheetIcon } from './IconComponents';

interface HeaderProps {
  onCopy: () => void;
  isResultReady: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onCopy, isResultReady }) => {
  const buttonClass = "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors";
  const disabledClass = "bg-gray-200 text-gray-500 cursor-not-allowed";
  const enabledClass = "bg-brand-secondary text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500";
  
  return (
    <header className="bg-brand-primary shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <CalculatorIcon className="h-8 w-8 text-brand-accent" />
            <h1 className="ml-3 text-2xl font-bold text-white tracking-tight">
              Tutto Cotizador
            </h1>
          </div>
          <div className="flex items-center gap-3">
              <>
                <button
                  onClick={onCopy}
                  disabled={!isResultReady}
                  className={`${buttonClass} ${isResultReady ? enabledClass : disabledClass}`}
                >
                  <CopyIcon className="h-5 w-5" />
                  <span className="hidden sm:inline">Copiar Resumen</span>
                </button>
                <a
                  href="https://docs.google.com/spreadsheets/d/1b3IPPE0pQ0mYEDp296lCBDPMNqVhV0_Y6KZ729UjG2U/edit?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${buttonClass} bg-green-600 text-white hover:bg-green-700`}
                >
                  <SheetIcon className="h-5 w-5" />
                  <span className="hidden sm:inline">Hoja de cálculo</span>
                </a>
              </>
          </div>
        </div>
      </div>
    </header>
  );
};