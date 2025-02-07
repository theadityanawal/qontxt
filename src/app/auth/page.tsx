'use client';
import { useAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AuthButton from '@/components/AuthButton';
import { useState } from 'react';

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

  const FeatureCard = ({ feature, index, isMobile = false }) => (
    <div
      className={`relative p-6 bg-background/50 backdrop-blur-sm rounded-lg border border-primary/10 transition-all duration-300 ${
        isMobile ? '' : 'hover:scale-105 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5'
      }`}
      onMouseEnter={() => !isMobile && setHoveredFeature(index)}
      onMouseLeave={() => !isMobile && setHoveredFeature(null)}
      style={{
        transform: !isMobile && hoveredFeature === index ? 'translateX(10px)' : 'none',
      }}
      role="article"
      aria-label={`Feature: ${feature.title}`}
    >
      <div className="text-3xl mb-3" role="img" aria-label={feature.title}>
        {feature.icon}
      </div>
      <h3 className="text-lg font-semibold mb-2 text-foreground">
        {feature.title}
      </h3>
      <p className="text-muted-foreground">
        {feature.description}
      </p>
      <div className="mt-3 inline-block px-3 py-1 bg-primary/10 rounded-full">
        <p className="text-sm font-medium text-primary">
          {feature.stat}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-b from-background to-background/95">
      {/* Left Section */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-8 animate-in slide-in-from-left duration-500">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent animate-in fade-in duration-700">
              Welcome to qontxt
            </h1>
            <p className="mt-4 text-lg text-muted-foreground animate-in fade-in duration-1000">
              Create AI-powered resumes that stand out
            </p>
          </div>

          <div className="mt-8 space-y-6 animate-in fade-in duration-1000">
            <AuthButton />

            {/* Mobile Features */}
            <div className="lg:hidden space-y-4">
              {features.map((feature, index) => (
                <FeatureCard key={index} feature={feature} index={index} isMobile={true} />
              ))}
            </div>

            {/* Testimonials */}
            <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide select-none">
              {testimonials.map((testimonial, i) => (
                <div
                  key={i}
                  className="flex-none animate-in fade-in duration-700"
                  style={{ animationDelay: `${i * 200}ms` }}
                >
                  <div className="px-4 py-2 bg-muted/5 rounded-lg border border-primary/10">
                    <p className="text-sm font-medium whitespace-nowrap">{testimonial.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">{testimonial.author}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-sm text-center text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>

      {/* Right Section - Desktop Features */}











}  );    </div>      </div>        </div>          ))}            <FeatureCard key={index} feature={feature} index={index} />          {features.map((feature, index) => (        <div className="max-w-md space-y-8"></div>      <div className="hidden lg:flex flex-1 flex-col justify-center items-center bg-muted/5 p-8 animate-in slide-in-from-right duration-700">
