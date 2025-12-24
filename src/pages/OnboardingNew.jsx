import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Loader2, Shield, Eye, Camera, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const steps = [
  { id: 'welcome', title: 'Welcome' },
  { id: 'account_type', title: 'Account Type' },
  { id: 'verification', title: 'Verification' },
  { id: 'personas', title: 'Personas' },
  { id: 'camera_mode', title: 'Camera Mode' },
  { id: 'profile', title: 'Profile' },
  { id: 'complete', title: 'Ready' }
];

export default function OnboardingNew() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const [onboardingData, setOnboardingData] = useState({
    accountType: null, // 'ANON' or 'VERIFIED'
    verificationId: null,
    personas: [],
    cameraPresenceMode: 'MANUAL',
    displayName: '',
    agreements: {
      terms_accepted: false,
      privacy_accepted: false
    }
  });

  useEffect(() => {
    let isMounted = true;
    
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        
        if (!isMounted) return;
        
        setUser(currentUser);
        
        // Guard: ensure user has seen welcome
        if (!currentUser.hasSeenWelcome) {
          navigate(createPageUrl('Welcome'), { replace: true });
          return;
        }
        
        // If already completed onboarding, skip to perihelion
        if (currentUser.hasCompletedOnboarding) {
          navigate(createPageUrl('Perihelion'), { replace: true });
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    };
    
    loadUser();
    
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Initialize identity if not done
      if (!user?.aliasId) {
        const initResponse = await base44.functions.invoke('initializeUserIdentity', {});
        console.log('Identity initialized:', initResponse.data);
      }

      // If verified, handle verification
      if (onboardingData.accountType === 'VERIFIED' && onboardingData.verificationId) {
        const verifyResponse = await base44.functions.invoke('completeVerification', { 
          verificationId: onboardingData.verificationId 
        });
        console.log('Verification completed:', verifyResponse.data);
      }

      // Update user profile
      const updateData = {
        displayName: onboardingData.displayName || user?.full_name || user?.email || 'User',
        display_name: onboardingData.displayName || user?.full_name || user?.email || 'User',
        cameraPresenceMode: onboardingData.cameraPresenceMode,
        hasCompletedOnboarding: true,
        onboarding_completed: true // Legacy flag
      };
      
      console.log('Updating user with:', updateData);
      await base44.auth.updateMe(updateData);

      // Navigate with replace to prevent back navigation to onboarding
      navigate(createPageUrl('Perihelion'), { replace: true });
    } catch (error) {
      console.error('Onboarding error:', error);
      alert('Error completing onboarding: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleStartVerification = async () => {
    try {
      const response = await base44.functions.invoke('startVerification', {});
      if (response.data.verificationId) {
        setOnboardingData({
          ...onboardingData,
          verificationId: response.data.verificationId
        });
      }
    } catch (error) {
      console.error('Start verification error:', error);
    }
  };

  const handleCompleteVerification = () => {
    // For testing: auto-generate verification ID
    const mockVerificationId = `vrf_mock_${Date.now()}`;
    setOnboardingData({
      ...onboardingData,
      accountType: 'VERIFIED',
      verificationId: mockVerificationId
    });
    setCurrentStep(3); // Go to personas
  };

  const handleCreatePersona = async (aliasName) => {
    try {
      const response = await base44.functions.invoke('createPersona', { aliasName });
      if (response.data.success) {
        setOnboardingData({
          ...onboardingData,
          personas: [...onboardingData.personas, response.data.persona]
        });
      }
    } catch (error) {
      console.error('Create persona error:', error);
    }
  };

  const canProgress = () => {
    switch (currentStep) {
      case 0: return true; // Welcome step
      case 1: return onboardingData.accountType !== null;
      case 2: return true; // Can always progress from verification screen
      case 3: return true; // Persona creation is optional
      case 4: return onboardingData.cameraPresenceMode !== null;
      case 5: return onboardingData.displayName.length > 0;
      default: return true;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694b4f2681a1c65e4989bb6f/96648a1a6_jjjjjdjjjjmm.png"
              alt="Perihelion"
              className="h-20 w-auto mx-auto mb-6 opacity-90"
            />
            <h1 className="text-3xl font-light mb-4">Welcome to Perihelion</h1>
            <p className="text-gray-400 leading-relaxed max-w-md mx-auto">
              A camera-centric identity platform where presence, policy, and spatial context converge.
            </p>
          </div>
        );

      case 1:
        return (
          <div>
            <h2 className="text-2xl font-light mb-6 text-center">Choose Account Type</h2>
            <div className="space-y-4 max-w-lg mx-auto">
              <button
                onClick={() => setOnboardingData({ ...onboardingData, accountType: 'ANON' })}
                className={`w-full text-left p-6 rounded-xl border-2 transition-all ${
                  onboardingData.accountType === 'ANON'
                    ? 'border-gray-500 bg-gray-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center flex-shrink-0">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-white mb-2">Continue as Anonymous</h3>
                    <p className="text-sm text-gray-400 mb-3">Present without attribution. Limited interaction capabilities.</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Check className="w-3 h-3" />
                        View public rooms
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Check className="w-3 h-3" />
                        Access basic content
                      </div>
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setOnboardingData({ ...onboardingData, accountType: 'VERIFIED' })}
                className={`w-full text-left p-6 rounded-xl border-2 transition-all ${
                  onboardingData.accountType === 'VERIFIED'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-white mb-2">Become Verified</h3>
                    <p className="text-sm text-gray-400 mb-3">Accountable presence. Full room access and identity-linked actions.</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Check className="w-3 h-3" />
                        Create content
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Check className="w-3 h-3" />
                        Host sessions
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Check className="w-3 h-3" />
                        Full social access
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        );

      case 2:
        if (onboardingData.accountType === 'ANON') {
          return (
            <div className="text-center">
              <Eye className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h2 className="text-2xl font-light mb-4">Anonymous Mode Selected</h2>
              <p className="text-gray-400 max-w-md mx-auto">
                You'll start with anonymous access. You can upgrade to verified later from settings.
              </p>
            </div>
          );
        }

        return (
          <div>
            <h2 className="text-2xl font-light mb-6 text-center">Identity Verification</h2>
            {!onboardingData.verificationId ? (
              <div className="max-w-md mx-auto text-center">
                <Shield className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-6">
                  Start the verification process to unlock full platform capabilities.
                </p>
                <button
                  onClick={handleStartVerification}
                  className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors text-white"
                >
                  Start Verification
                </button>
                <div className="mt-8 p-4 rounded-lg bg-white/5 border border-white/10 text-left">
                  <p className="text-sm text-gray-400 mb-2">For testing purposes:</p>
                  <button
                    onClick={handleCompleteVerification}
                    className="text-sm text-purple-400 hover:text-purple-300"
                  >
                    → Complete Verification (Mock)
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto text-center">
                <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">Verification Initiated</h3>
                <p className="text-gray-400 mb-4">Verification ID: {onboardingData.verificationId}</p>
                <p className="text-sm text-gray-500">You can now create verified-anonymous personas.</p>
              </div>
            )}
          </div>
        );

      case 3:
        if (onboardingData.accountType === 'ANON') {
          return (
            <div className="text-center">
              <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h2 className="text-2xl font-light mb-4">Personas (Verified Only)</h2>
              <p className="text-gray-400 max-w-md mx-auto">
                Verified-anonymous personas are available only for verified users.
              </p>
            </div>
          );
        }

        return (
          <div>
            <h2 className="text-2xl font-light mb-6 text-center">Create Verified-Anonymous Persona</h2>
            <p className="text-sm text-gray-400 text-center mb-6 max-w-md mx-auto">
              Personas let you interact with verified trust level while keeping your identity masked.
            </p>

            <div className="max-w-md mx-auto space-y-4">
              {onboardingData.personas.map((p, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                  <p className="text-sm text-white">{p.aliasName}</p>
                  <p className="text-xs text-gray-500">Persona ID: {p.personaId}</p>
                </div>
              ))}

              <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <input
                  type="text"
                  placeholder="Enter persona name..."
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 mb-4"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      handleCreatePersona(e.target.value.trim());
                      e.target.value = '';
                    }
                  }}
                />
                <p className="text-xs text-gray-500">Press Enter to create persona</p>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h2 className="text-2xl font-light mb-6 text-center">Camera Presence Mode</h2>
            <p className="text-sm text-gray-400 text-center mb-6 max-w-md mx-auto">
              Choose how your camera behaves when entering rooms and sessions.
            </p>

            <div className="space-y-3 max-w-lg mx-auto">
              {[
                { 
                  id: 'AOS', 
                  name: 'Always On (AOS)', 
                  desc: 'Camera activates automatically when you enter rooms',
                  icon: Camera
                },
                { 
                  id: 'AUTO', 
                  name: 'Auto (Rules-based)', 
                  desc: 'Camera auto-starts based on room/user rules you define',
                  icon: Camera
                },
                { 
                  id: 'MANUAL', 
                  name: 'Manual', 
                  desc: 'Camera never starts automatically - you control when',
                  icon: Camera
                }
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setOnboardingData({ ...onboardingData, cameraPresenceMode: mode.id })}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    onboardingData.cameraPresenceMode === mode.id
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <mode.icon className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-sm font-medium text-white">{mode.name}</p>
                      <p className="text-xs text-gray-400">{mode.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 max-w-lg mx-auto p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-gray-500">
                💡 You can override with the Eye kill switch on any feed at any time.
              </p>
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <h2 className="text-2xl font-light mb-6 text-center">Profile</h2>
            <div className="max-w-md mx-auto space-y-4">
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Display Name</label>
                <input
                  type="text"
                  value={onboardingData.displayName}
                  onChange={(e) => setOnboardingData({ ...onboardingData, displayName: e.target.value })}
                  placeholder={user?.full_name || user?.email || "Your name"}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-b from-pink-500 via-purple-500 to-cyan-500 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-light mb-4">Ready to Enter</h2>
            <p className="text-gray-400 leading-relaxed max-w-md mx-auto">
              Your identity is configured. Welcome to Perihelion.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  const handleNext = () => {
    // Step 1: Account type selected
    if (currentStep === 1) {
      if (onboardingData.accountType === 'ANON') {
        // Skip verification and personas, go to camera mode
        setCurrentStep(4);
      } else {
        // Go to verification
        setCurrentStep(2);
      }
      return;
    }
    
    // Step 2: Verification screen
    if (currentStep === 2) {
      // Go to personas
      setCurrentStep(3);
      return;
    }
    
    // Step 3: Personas screen
    if (currentStep === 3) {
      // Go to camera mode
      setCurrentStep(4);
      return;
    }
    
    // Default: next step
    setCurrentStep(currentStep + 1);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/10 to-cyan-900/10 pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-2xl">
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((step, idx) => (
              <div
                key={step.id}
                className={`flex-1 h-1 rounded-full mx-1 transition-all ${
                  idx <= currentStep ? 'bg-gradient-to-r from-pink-500 to-cyan-500' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500 text-center">
            Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
          </p>
        </div>

        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white/5 rounded-2xl border border-white/10 p-8 mb-6 min-h-[400px] flex items-center justify-center"
        >
          {renderStep()}
        </motion.div>

        <div className="flex justify-between">
          <button
            onClick={() => {
              // Smart back navigation
              if (currentStep === 4 && onboardingData.accountType === 'ANON') {
                // From camera mode, go back to account type for anon users
                setCurrentStep(1);
              } else if (currentStep === 4 && onboardingData.accountType === 'VERIFIED') {
                // From camera mode, go back to personas for verified users
                setCurrentStep(3);
              } else {
                setCurrentStep(Math.max(0, currentStep - 1));
              }
            }}
            disabled={currentStep === 0}
            className="px-6 py-3 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!canProgress()}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={loading}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  Enter Perihelion
                  <Check className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}