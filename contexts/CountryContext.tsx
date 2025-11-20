'use client';

import { createContext, useContext, ReactNode } from 'react';

interface Language {
  code: string;
  name: string;
  isDefault: boolean;
}

interface CountryAISettings {
  filterPrompt: string;
  categorizationPrompt: string;
  summaryPrompt: string;
}

export interface Country {
  id: string;
  code: string;
  name: string;
  slug: string;
  isActive: boolean;
  languages: Language[];
  aiSettings?: CountryAISettings;
}

interface CountryContextType {
  country: Country;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

export function CountryProvider({ 
  country, 
  children 
}: { 
  country: Country; 
  children: ReactNode;
}) {
  return (
    <CountryContext.Provider value={{ country }}>
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  const context = useContext(CountryContext);
  if (context === undefined) {
    throw new Error('useCountry must be used within CountryProvider');
  }
  return context;
}

