'use client';

import * as React from 'react';
import { Globe, Type } from 'lucide-react';
import { usePreferences } from './PreferencesProvider';
import type { LanguagePreference, FontSize } from '@/lib/supabase/model';

export function PreferenceToggles() {
  const { preferences, setLanguage, setFontSize, isLoading } = usePreferences();

  // Cycle through languages: EN → ZH → MS → EN
  const cycleLanguage = () => {
    const languages: LanguagePreference[] = ['en', 'zh', 'ms'];
    const currentIndex = languages.indexOf(preferences.language);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex]);
  };

  // Cycle through font sizes: Small → Medium → Large → Small
  const cycleFontSize = () => {
    const sizes: FontSize[] = ['small', 'medium', 'large'];
    const currentIndex = sizes.indexOf(preferences.fontSize);
    const nextIndex = (currentIndex + 1) % sizes.length;
    setFontSize(sizes[nextIndex]);
  };

  // Get current language flag
  const getCurrentFlag = () => {
    const flags = {
      en: '🇸🇬',
      zh: '🇨🇳',
      ms: '🇲🇾'
    };
    return flags[preferences.language];
  };

  // Get current font size indicator
  const getFontSizeIndicator = () => {
    const indicators = {
      small: 'S',
      medium: 'M',
      large: 'L'
    };
    return indicators[preferences.fontSize];
  };

  return (
    <div className="flex items-center gap-1 md:gap-2">
      {/* Language Toggle - Single tap to cycle */}
      <button
        onClick={cycleLanguage}
        disabled={isLoading}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-zinc-100 transition-all active:scale-95 disabled:opacity-50"
        aria-label={`Change language (current: ${preferences.language.toUpperCase()})`}
        title={`Tap to change language (${preferences.language.toUpperCase()})`}
      >
        <Globe className="w-4 h-4 text-[#6B5A4E]" />
        <span className="text-base hidden sm:inline">
          {getCurrentFlag()}
        </span>
      </button>

      {/* Font Size Toggle - Single tap to cycle */}
      <button
        onClick={cycleFontSize}
        disabled={isLoading}
        className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-zinc-100 transition-all active:scale-95 disabled:opacity-50 min-w-[36px] justify-center"
        aria-label={`Change font size (current: ${preferences.fontSize})`}
        title={`Tap to change size (${getFontSizeIndicator()})`}
      >
        <Type className="w-4 h-4 text-[#6B5A4E]" />
        <span className="text-[10px] font-bold text-[#6B5A4E] hidden sm:inline">
          {getFontSizeIndicator()}
        </span>
      </button>
    </div>
  );
}
