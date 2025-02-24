'use client';
import { useAuth } from '@/lib/services/auth/auth.service';
import { redirect } from 'next/navigation';
import AuthButton from '@/components/AuthButton';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

export default function AuthPage() {
  const { user } = useAuth();
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  if (user) {
    redirect('/dashboard');
  }

  const features = [
    {
      title: 'AI-Powered Resume Tailoring',
      description: 'Automatically optimize your resume for each job application using advanced AI',
      icon: '✨',
      stat: '85% higher callback rate'
    },
    {
      title: 'Smart Keyword Matching',
      description: 'Get higher ATS scores by matching your skills with job requirements',
      icon: '🎯',
      stat: '95% ATS pass rate'
    },
    {
      title: 'Real-time Optimization',
      description: 'See instant improvements as you customize your resume',
      icon: '⚡',
      stat: '2x faster editing'
    }
  ];

  const testimonials = [
    { text: '"Got 3 interviews in my first week"', author: 'Sarah K.' },
    { text: '"Perfect ATS optimization"', author: 'Mike R.' },
    { text: '"Landed my dream job"', author: 'Alex M.' },
  ];

  const FeatureCard = ({ feature, index }: { feature: typeof features[0], index: number }) => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Card className="relative transition-all duration-300 hover:shadow-lg hover:border-primary/30">
          <CardHeader>
            <div className="text-3xl mb-2" role="img" aria-label={feature.title}>
              {feature.icon}
            </div>
            <CardTitle className="text-lg">{feature.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {feature.description}
            </p>
            <div className="mt-3">
              <Button variant="secondary" className="text-sm font-medium">
                {feature.stat}
              </Button>
            </div>
          </CardContent>
        </Card>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">{feature.title}</h4>
          <p className="text-sm text-muted-foreground">
            Learn how {feature.description.toLowerCase()}
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Section */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 animate-in slide-in-from-left">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Welcome to qontxt
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Create AI-powered resumes that stand out
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <AuthButton />
            </CardContent>
          </Card>

          {/* Mobile Features */}
          <div className="lg:hidden space-y-4">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </div>

          {/* Testimonials */}
          <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
            {testimonials.map((testimonial, i) => (
              <Card key={i} className="flex-none animate-in fade-in" style={{ animationDelay: `${i * 200}ms` }}>
                <CardContent className="p-4">
                  <p className="text-sm font-medium whitespace-nowrap">{testimonial.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">{testimonial.author}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-sm text-center text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>

      {/* Right Section - Desktop Features */}
      <div className="hidden lg:flex flex-1 flex-col justify-center items-center p-8 animate-in slide-in-from-right">
        <div className="max-w-md space-y-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

