'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { SettingsPanel } from '@/components/SettingsPanel';
import { UserSettings } from '@/types/settings';
import { useAuth } from '@/lib/services/auth/auth.service';

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchSettings = useCallback(async () => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/settings', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updateSettings = async (updates: Partial<UserSettings>) => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      const updatedSettings = await response.json();
      setSettings(updatedSettings);
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user, fetchSettings]);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Failed to load settings</p>
        <button
          onClick={fetchSettings}
          className="mt-4 text-sm text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      <SettingsPanel settings={settings} onUpdate={updateSettings} />
    </div>
  );
}

