import React, { createContext, useContext, useState } from 'react';

interface LayoutContextType {
  tamanhoCalendario: 'pequeno' | 'medio' | 'grande';
  setTamanhoCalendario: (tamanho: 'pequeno' | 'medio' | 'grande') => void;
  tamanhoDashboard: 'compacto' | 'normal' | 'grande';
  setTamanhoDashboard: (tamanho: 'compacto' | 'normal' | 'grande') => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [tamanhoCalendario, setTamanhoCalendario] = useState<'pequeno' | 'medio' | 'grande'>('pequeno');
  const [tamanhoDashboard, setTamanhoDashboard] = useState<'compacto' | 'normal' | 'grande'>('compacto');

  return (
    <LayoutContext.Provider
      value={{
        tamanhoCalendario,
        setTamanhoCalendario,
        tamanhoDashboard,
        setTamanhoDashboard,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout deve ser usado dentro de LayoutProvider');
  }
  return context;
}
