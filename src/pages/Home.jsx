import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';

export default function Home() {
  const navigate = useNavigate();
  const [hasChecked, setHasChecked] = React.useState(false);

  useEffect(() => {
    if (hasChecked) return;
    
    // ROUTING ORDER: Welcome → Onboarding → Perihelion
    const checkRouting = async () => {
      try {
        const user = await base44.auth.me();
        setHasChecked(true);
        
        // 1. Check if user has seen welcome
        if (!user.hasSeenWelcome) {
          navigate(createPageUrl('Welcome'), { replace: true });
          return;
        }
        
        // 2. Check if user has completed onboarding
        if (!user.hasCompletedOnboarding) {
          navigate(createPageUrl('OnboardingNew'), { replace: true });
          return;
        }
        
        // 3. All checks passed, can go to Perihelion
        navigate(createPageUrl('Perihelion'), { replace: true });
      } catch (error) {
        console.error('Failed to check routing:', error);
        setHasChecked(true);
      }
    };
    checkRouting();
  }, [navigate, hasChecked]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center p-6">
      <div className="text-center">
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694b4f2681a1c65e4989bb6f/96648a1a6_jjjjjdjjjjmm.png"
          alt="Perihelion"
          className="h-32 w-auto mx-auto mb-8 opacity-90"
        />
        <h1 className="text-4xl font-light text-white mb-6">Perihelion</h1>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Camera-centric identity platform where presence meets policy
        </p>
        <Link
          to={createPageUrl('Perihelion')}
          className="inline-block px-8 py-4 rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white font-medium hover:opacity-90 transition-opacity"
        >
          Enter Perihelion
        </Link>
      </div>
    </div>
  );
}