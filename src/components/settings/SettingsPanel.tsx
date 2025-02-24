'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AI_MODEL_OPTIONS, TIER_LIMITS, type UserSettings } from '@/types/settings';
import { useAuth } from '@/lib/services/auth/auth.service';

interface SettingsPanelProps {
  settings: UserSettings;
  onUpdate: (updates: Partial<UserSettings>) => Promise<void>;
}

export function SettingsPanel({ settings, onUpdate }: SettingsPanelProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuth();

  const handleModelChange = async (modelId: string) => {
    try {
      setIsUpdating(true);
      const modelOption = AI_MODEL_OPTIONS.find(opt => opt.id === modelId);
      if (!modelOption) {
        toast.error('Invalid model selection');
        return;
      }

      if (modelOption.tier === 'pro' && settings.usage.tier === 'free') {
        toast('Pro feature', {
          description: 'Upgrade to Pro to use this model'
        });
        return;
      }

      await onUpdate({
        ai: {
          ...settings.ai,
          currentModel: {
            provider: modelOption.provider,
            modelName: modelOption.id
          }
        }
      });

      toast.success('AI model updated');
    } catch (error) {
      toast.error('Failed to update AI model');
      console.error('Model update error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleProfileUpdate = async (
    updates: Partial<UserSettings['profile']>
  ) => {
    try {
      setIsUpdating(true);
      await onUpdate({ profile: { ...settings.profile, ...updates } });
      toast.success('Profile updated');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Profile update error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-2">
              <div className="text-sm font-medium">Name</div>
              <input
                type="text"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={settings.profile.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleProfileUpdate({ name: e.target.value })}
                disabled={isUpdating}
              />
            </div>
            <div className="grid gap-2">
              <div className="text-sm font-medium">Email</div>
              <input
                type="email"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={settings.profile.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleProfileUpdate({ email: e.target.value })}
                disabled={isUpdating || !user?.emailVerified}
              />
              {!user?.emailVerified && (
                <p className="text-sm text-yellow-600">
                  Verify your email to update this field
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Model Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {AI_MODEL_OPTIONS.map((model) => (
              <div
                key={model.id}
                className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium">{model.name}</h3>
                    {model.tier === 'pro' && (
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                        Pro
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {model.description}
                  </p>
                </div>
                <Button
                  variant={settings.ai.currentModel?.modelName === model.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleModelChange(model.id)}
                  disabled={isUpdating || (model.tier === 'pro' && settings.usage.tier === 'free')}
                >
                  {settings.ai.currentModel?.modelName === model.id ? 'Active' : 'Select'}
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t pt-6">
            <h4 className="text-sm font-medium mb-2">Usage</h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">AI Requests</span>
                  <span>{settings.usage.aiRequests} / {TIER_LIMITS[settings.usage.tier].aiRequests}</span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full w-full flex-1 bg-primary transition-all"
                    style={{ transform: `translateX(-${100 - (settings.usage.aiRequests / TIER_LIMITS[settings.usage.tier].aiRequests * 100)}%)` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Current Tier: {settings.usage.tier === 'free' ? 'Free' : 'Pro'}
                </span>
                {settings.usage.tier === 'free' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.info('Upgrade feature coming soon')}
                  >
                    Upgrade to Pro
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

