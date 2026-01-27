'use client';

import * as React from 'react';
import type { LanguagePreference, FontSize } from '@/lib/supabase/model';
import { getTranslations, type Translations } from '@/lib/i18n/translations';
import { updateLanguage, updateFontSize } from '@/app/actions/preferences';

export interface UserPreferences {
  language: LanguagePreference;
  fontSize: FontSize;
}

interface PreferencesContextType {
  preferences: UserPreferences;
  translations: Translations;
  setLanguage: (lang: LanguagePreference) => Promise<void>;
  setFontSize: (size: FontSize) => Promise<void>;
  isLoading: boolean;
}

const PreferencesContext = React.createContext<PreferencesContextType | null>(null);

export function PreferencesProvider({
  children,
  initialPreferences
}: {
  children: React.ReactNode;
  initialPreferences: UserPreferences;
}) {
  const [preferences, setPreferences] = React.useState<UserPreferences>(initialPreferences);
  const [isLoading, setIsLoading] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const translations = React.useMemo(() => getTranslations(preferences.language), [preferences.language]);

  // Prevent hydration mismatch by only running after mount
  // Always force light mode regardless of system preference
  React.useEffect(() => {
    setMounted(true);
    
    const root = document.documentElement;
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }, []);

  // Apply font size to document
  React.useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    root.setAttribute('data-font-size', preferences.fontSize);
    
    // Apply font scale CSS variable
    const fontScales = {
      small: '0.875',  // 87.5% - 14px base
      medium: '1',     // 100% - 16px base
      large: '1.125'   // 112.5% - 18px base
    };
    root.style.setProperty('--font-scale', fontScales[preferences.fontSize]);
  }, [preferences.fontSize, mounted]);

  const setLanguage = React.useCallback(async (lang: LanguagePreference) => {
    // Optimistic update - change UI immediately
    setPreferences(prev => ({ ...prev, language: lang }));
    
    // Save to database in background
    try {
      await updateLanguage(lang);
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  }, []);

  const setFontSize = React.useCallback(async (size: FontSize) => {
    // Optimistic update - change UI immediately
    setPreferences(prev => ({ ...prev, fontSize: size }));
    
    // Save to database in background
    try {
      await updateFontSize(size);
    } catch (error) {
      console.error('Failed to save font size preference:', error);
    }
  }, []);

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        translations,
        setLanguage,
        setFontSize,
        isLoading
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = React.useContext(PreferencesContext);
  if (!context) {
    // Return default context for pages without provider
    return {
      preferences: {
        language: 'en' as LanguagePreference,
        fontSize: 'medium' as FontSize
      },
      translations: getTranslations('en'),
      setLanguage: async () => {},
      setFontSize: async () => {},
      isLoading: false
    };
  }
  return context;
}

export function useTranslations() {
  const { translations } = usePreferences();
  return translations;
}
