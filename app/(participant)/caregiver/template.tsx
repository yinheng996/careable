import * as React from 'react';
import { getUserPreferences } from '@/app/actions/preferences';
import { PreferencesProvider, type UserPreferences } from '@/components/PreferencesProvider';

export default async function CaregiverTemplate({
  children
}: {
  children: React.ReactNode;
}) {
  // Fetch user preferences server-side
  const result = await getUserPreferences();
  
  const initialPreferences: UserPreferences = result.success && result.data
    ? {
        language: result.data.language,
        fontSize: result.data.fontSize
      }
    : {
        language: 'en',
        fontSize: 'medium'
      };

  return (
    <PreferencesProvider initialPreferences={initialPreferences}>
      {children}
    </PreferencesProvider>
  );
}
