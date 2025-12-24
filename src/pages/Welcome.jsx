import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';

export default function Welcome() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (hasChecked) return;
    
    // Check if user has already seen welcome
    const checkWelcome = async () => {
      try {
        const user = await base44.auth.me();
        setHasChecked(true);
        
        if (user.hasSeenWelcome) {
          // Already seen welcome, check onboarding
          if (user.hasCompletedOnboarding) {
            navigate(createPageUrl('Perihelion'), { replace: true });
          } else {
            navigate(createPageUrl('OnboardingNew'), { replace: true });
          }
        }
      } catch (error) {
        console.error('Welcome check failed:', error);
        setHasChecked(true);
      }
    };
    
    checkWelcome();
  }, [navigate, hasChecked]);

  const handleGetStarted = async () => {
    setLoading(true);
    try {
      await base44.auth.updateMe({ hasSeenWelcome: true });
      navigate(createPageUrl('OnboardingNew'));
    } catch (error) {
      console.error('Failed to update welcome status:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative flex items-center justify-center">
      {/* Deep Purple Gradient Background */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            background: [
              'radial-gradient(ellipse at 20% 30%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
              'radial-gradient(ellipse at 80% 70%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
              'radial-gradient(ellipse at 40% 80%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
              'radial-gradient(ellipse at 20% 30%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)'
            ]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute inset-0"
        />
        <motion.div
          animate={{
            background: [
              'radial-gradient(ellipse at 80% 20%, rgba(168, 85, 247, 0.2) 0%, transparent 60%)',
              'radial-gradient(ellipse at 30% 60%, rgba(168, 85, 247, 0.2) 0%, transparent 60%)',
              'radial-gradient(ellipse at 70% 90%, rgba(168, 85, 247, 0.2) 0%, transparent 60%)',
              'radial-gradient(ellipse at 80% 20%, rgba(168, 85, 247, 0.2) 0%, transparent 60%)'
            ]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute inset-0"
        />
      </div>

      {/* Soft Shapes */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.15, 0.1]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-20 left-20 w-96 h-96 rounded-full bg-purple-600 blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.08, 0.12, 0.08]
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-32 right-32 w-[500px] h-[500px] rounded-full bg-purple-700 blur-3xl"
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-12"
        >
          <motion.img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694b4f2681a1c65e4989bb6f/96648a1a6_jjjjjdjjjjmm.png"
            alt="Perihelion"
            className="w-40 h-40 mx-auto mb-8"
            animate={{
              filter: [
                'drop-shadow(0 0 20px rgba(168, 85, 247, 0.3))',
                'drop-shadow(0 0 40px rgba(168, 85, 247, 0.5))',
                'drop-shadow(0 0 20px rgba(168, 85, 247, 0.3))'
              ]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="text-6xl font-light tracking-tight mb-2"
          >
            Perihelion
          </motion.h1>
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="mb-16"
        >
          <p className="text-3xl font-light mb-8 text-white/90">
            A camera-first social architecture.
          </p>
          <div className="space-y-4 text-lg text-white/70 max-w-2xl mx-auto">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              Perihelion is built around presence, not profiles.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
            >
              Your camera. Your control.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
            >
              Identity, visibility, and trust — on your terms.
            </motion.p>
          </div>
        </motion.div>

        {/* Feature Hints */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="mb-16 flex justify-center gap-8 text-sm text-white/50"
        >
          <span>Always-On or on-demand presence</span>
          <span className="text-purple-400">•</span>
          <span>Personality-aware interactions</span>
          <span className="text-purple-400">•</span>
          <span>Anonymous, Verified, Verified-Anonymous</span>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 1 }}
        >
          <button
            onClick={handleGetStarted}
            disabled={loading}
            className="px-12 py-5 rounded-full bg-white text-black font-medium text-lg hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-purple-500/20 hover:scale-105 active:scale-100"
          >
            {loading ? 'Loading...' : 'Get Started'}
          </button>
        </motion.div>

        {/* Subtle Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.1 }}
          className="mt-16 text-xs text-white/30"
        >
          A new threshold for digital presence
        </motion.p>
      </div>
    </div>
  );
}