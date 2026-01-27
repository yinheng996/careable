import * as React from 'react';
import { getUserPreferences } from '@/app/actions/preferences';
import { PreferencesProvider } from '@/components/PreferencesProvider';
import type { UserPreferences } from '@/components/PreferencesProvider';
import PortalClientLayout from './PortalClientLayout';

export default async function PortalLayout({
  children,
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
      <PortalClientLayout>
        {children}
      </PortalClientLayout>
    </PreferencesProvider>
  );
}
