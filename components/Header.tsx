import React from 'react';
import { SaveIcon, CopyIcon, CalculatorIcon, WrenchScrewdriverIcon } from './IconComponents';

interface HeaderProps {
  onSave: () => void;
  onCopy: () => void;
  isResultReady: boolean;
  view: 'calculator' | 'admin';
  setView: (view: 'calculator' | 'admin') => void;
}

export const Header: React.FC<HeaderProps> = ({ onSave, onCopy, isResultReady, view, setView }) => {
  const buttonClass = "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors";
  const disabledClass = "bg-gray-200 text-gray-500 cursor-not-allowed";
  const enabledClass = "bg-brand-secondary text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500";
  
  const navButtonClass = (isActive: boolean) => 
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-brand-accent text-brand-primary'
        : 'text-white hover:bg-brand-secondary hover:bg-opacity-75'
    }`;


  return (
    <header className="bg-brand-primary shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <CalculatorIcon className="h-8 w-8 text-brand-accent" />
            <h1 className="ml-3 text-2xl font-bold text-white tracking-tight">
              Tutto Cotizador
            </h1>
            <div className="hidden md:flex items-baseline space-x-4 ml-10">
               <button onClick={() => setView('calculator')} className={navButtonClass(view === 'calculator')}>
                Calculadora
              </button>
              <button onClick={() => setView('admin')} className={navButtonClass(view === 'admin')}>
                Admin
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
             {view === 'calculator' ? (
              <>
                <button
                  onClick={onCopy}
                  disabled={!isResultReady}
                  className={`${buttonClass} ${isResultReady ? enabledClass : disabledClass}`}
                >
                  <CopyIcon className="h-5 w-5" />
                  Copiar Resumen
                </button>
                <button
                  onClick={onSave}
                  disabled={!isResultReady}
                  className={`${buttonClass} ${isResultReady ? enabledClass.replace('bg-brand-secondary', 'bg-green-600').replace('hover:bg-blue-700', 'hover:bg-green-700') : disabledClass}`}
                >
                  <SaveIcon className="h-5 w-5" />
                  Guardar
                </button>
              </>
            ) : (
               <div className="flex items-center gap-2 text-brand-accent">
                 <WrenchScrewdriverIcon className="h-6 w-6" />
                 <span className="font-semibold">Panel de Administración</span>
               </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};