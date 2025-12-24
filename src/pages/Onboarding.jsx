import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';

const steps = [
  { id: 'welcome', title: 'Welcome to Perihelion' },
  { id: 'agreements', title: 'Terms & Privacy' },
  { id: 'identity', title: 'Identity Framework' },
  { id: 'groups', title: 'System Groups' },
  { id: 'signals', title: 'Profile Signals' },
  { id: 'verification', title: 'Verification' },
  { id: 'complete', title: 'Ready' }
];

const systemGroupOptions = [
  { id: 'global_commons', name: 'Global Commons', description: 'Open public space' },
  { id: 'creative_vanguard', name: 'Creative Vanguard', description: 'Experimental & artistic' },
  { id: 'research_collective', name: 'Research Collective', description: 'Academic & analytical' },
  { id: 'social_nexus', name: 'Social Nexus', description: 'Community & events' }
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const [profileData, setProfileData] = useState({
    display_name: '',
    birthdate: '',
    profile_matrix: {
      creative_expression: 50,
      community_orientation: 50,
      cultural_alignment: 50,
      identity_flexibility: 50
    },
    system_groups: [],
    verification_method: 'none',
    geo_permissions: {
      allow_location: false,
      share_city: false,
      share_country: true
    },
    matching_enabled: false,
    agreements: {
      terms_accepted: false,
      privacy_accepted: false
    }
  });

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      if (currentUser.onboarding_completed) {
        navigate('/perihelion');
      }
    };
    loadUser();
  }, [navigate]);

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Initialize canonical identity first
      await base44.functions.invoke('initializeUserIdentity', {});

      // Then complete onboarding
      await base44.auth.updateMe({
        display_name: profileData.display_name || user.full_name,
        displayName: profileData.display_name || user.full_name,
        birthdate: profileData.birthdate,
        profile_matrix: profileData.profile_matrix,
        system_groups: profileData.system_groups,
        matching_enabled: profileData.matching_enabled,
        geo_permissions: profileData.geo_permissions,
        verification: {
          method: profileData.verification_method,
          verified: false
        },
        agreements: {
          terms_accepted: profileData.agreements.terms_accepted,
          terms_accepted_at: new Date().toISOString(),
          privacy_accepted: profileData.agreements.privacy_accepted,
          privacy_accepted_at: new Date().toISOString()
        },
        onboarding_completed: true,
        preferences: {
          prefers_verified_anonymous: false,
          default_fx: 'authentic',
          contact_admin_ok: true
        },
        visibility_settings: {
          show_profile_to_public: true,
          show_profile_to_verified_only: false,
          visibility_preset: 'selective'
        },
        trust_signals: {
          verified_at: null,
          moderation_flags: 0,
          trust_level: 'standard'
        }
      });
      navigate('/perihelion');
    } catch (error) {
      console.error('Onboarding error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6948b2cb6dfa247b8d9e8ad6/94a930944_group3.png"
              alt="qveerculture"
              className="h-24 w-auto mx-auto mb-6 opacity-90"
            />
            <h1 className="text-3xl font-light mb-4">Welcome to Perihelion</h1>
            <p className="text-gray-400 leading-relaxed max-w-md mx-auto">
              A camera-centric identity platform where presence, policy, and spatial context 
              converge. Your profile here is not about performance — it's about capability and signal.
            </p>
          </div>
        );

      case 1:
        return (
          <div>
            <h2 className="text-2xl font-light mb-6 text-center">Terms & Privacy</h2>
            <div className="max-w-lg mx-auto space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileData.agreements.terms_accepted}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      agreements: { ...profileData.agreements, terms_accepted: e.target.checked }
                    })}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-sm text-white mb-2">I accept the User Agreement</p>
                    <p className="text-xs text-gray-500">
                      By using Perihelion, you agree to our community guidelines and acceptable use policy.
                    </p>
                  </div>
                </label>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileData.agreements.privacy_accepted}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      agreements: { ...profileData.agreements, privacy_accepted: e.target.checked }
                    })}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-sm text-white mb-2">I accept the Privacy Statement</p>
                    <p className="text-xs text-gray-500">
                      Your data is used to provide identity, affinity, and policy decisions. Profile signals are not shared publicly.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 className="text-2xl font-light mb-6 text-center">Identity Framework</h2>
            <p className="text-xs text-gray-500 text-center mb-6">You will start as Anonymous and can upgrade later</p>
            <div className="space-y-4 max-w-lg mx-auto">
              <div className="p-4 rounded-xl bg-white/5 border border-purple-500/30">
                <h3 className="text-sm font-medium text-purple-400 mb-2">Anonymous</h3>
                <p className="text-xs text-gray-400">Present without attribution. Limited interaction capabilities.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-blue-500/30">
                <h3 className="text-sm font-medium text-blue-400 mb-2">Verified</h3>
                <p className="text-xs text-gray-400">Accountable presence. Full room access and identity-linked actions.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-pink-500/30">
                <h3 className="text-sm font-medium text-pink-400 mb-2">Verified Anonymous</h3>
                <p className="text-xs text-gray-400">Accountability without exposure. Protected identity with verified trust level.</p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 className="text-2xl font-light mb-3 text-center">Profile Signals</h2>
            <p className="text-sm text-gray-400 text-center mb-6 max-w-md mx-auto">
              These values shape your access, affinity, and policy decisions — not popularity. 
              They feed the PARA-Engine and inform room eligibility.
            </p>

            <div className="max-w-lg mx-auto space-y-6">
              <div>
                <label className="text-sm text-gray-300 mb-2 block">
                  Display Name <span className="text-gray-500">(optional)</span>
                </label>
                <input
                  type="text"
                  value={profileData.display_name}
                  onChange={(e) => setProfileData({ ...profileData, display_name: e.target.value })}
                  placeholder={user?.full_name || "Your display name"}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div>
                <label className="text-sm text-gray-300 mb-2 block">
                  Birthdate <span className="text-gray-500">(required)</span>
                </label>
                <input
                  type="date"
                  value={profileData.birthdate}
                  onChange={(e) => setProfileData({ ...profileData, birthdate: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
                />
              </div>

              {[
                { key: 'creative_expression', label: 'Creative Expression', sublabel: 'gender expression', markers: { 1: 'female', 50: 'agender/fluid', 100: 'male' } },
                { key: 'community_orientation', label: 'Community Orientation', sublabel: 'gender presentation', markers: { 1: 'feminine', 50: 'androgynous', 100: 'masculine' } },
                { key: 'cultural_alignment', label: 'Cultural Alignment', sublabel: 'sexual identity', markers: { 1: 'straight', 50: 'bisexual', 100: 'queer' } },
                { key: 'identity_flexibility', label: 'Identity Flexibility', sublabel: 'sexual role', markers: { 1: 'top/dom', 50: 'versatile/switch', 100: 'bottom/sub' } }
              ].map(({ key, label, sublabel, markers }) => {
                const value = profileData.profile_matrix[key];
                return (
                <div key={key}>
                  <div className="flex justify-between mb-1">
                    <div>
                      <label className="text-sm text-gray-300">{label}</label>
                      <p className="text-xs text-gray-500">({sublabel})</p>
                    </div>
                    <span className="text-sm text-gray-500">{value}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1 px-1">
                    <span>{markers[1]}</span>
                    <span>{markers[50]}</span>
                    <span>{markers[100]}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={value}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      profile_matrix: {
                        ...profileData.profile_matrix,
                        [key]: parseInt(e.target.value)
                      }
                    })}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, 
                        rgb(236, 72, 153) 0%, 
                        rgb(168, 85, 247) 33%, 
                        rgb(59, 130, 246) 66%, 
                        rgb(34, 211, 238) 100%)`
                    }}
                  />
                </div>
              );
            })}
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <h2 className="text-2xl font-light mb-3 text-center">Verification Method</h2>
            <p className="text-sm text-gray-400 text-center mb-6 max-w-md mx-auto">
              Choose a verification method for verified or verified-anonymous access.
            </p>

            <div className="max-w-lg mx-auto space-y-3">
              {[
                { id: 'internet_identity', name: 'Internet Identity', desc: 'Decentralized identity protocol' },
                { id: 'google', name: 'Google', desc: 'Sign in with Google' },
                { id: 'facebook', name: 'Facebook', desc: 'Sign in with Facebook' },
                { id: 'apple', name: 'Apple', desc: 'Sign in with Apple' },
                { id: 'none', name: 'Skip for now', desc: 'Remain anonymous' }
              ].map(method => (
                <button
                  key={method.id}
                  onClick={() => setProfileData({ ...profileData, verification_method: method.id })}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    profileData.verification_method === method.id
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <p className="text-sm font-medium text-white">{method.name}</p>
                  <p className="text-xs text-gray-400">{method.desc}</p>
                </button>
              ))}
            </div>

            <div className="max-w-lg mx-auto mt-6 space-y-3">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileData.geo_permissions.allow_location}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      geo_permissions: { ...profileData.geo_permissions, allow_location: e.target.checked }
                    })}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-sm text-white">Allow location access</p>
                    <p className="text-xs text-gray-500">Used for proximity-based features</p>
                  </div>
                </label>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileData.matching_enabled}
                    onChange={(e) => setProfileData({ ...profileData, matching_enabled: e.target.checked })}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-sm text-white">Enable profile matrix matching</p>
                    <p className="text-xs text-gray-500">Find users with similar signals</p>
                  </div>
                </label>
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
            <h2 className="text-2xl font-light mb-4">Profile Configured</h2>
            <p className="text-gray-400 leading-relaxed max-w-md mx-auto mb-6">
              Your capability profile is ready. You can update your signals anytime from Profile Settings.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/10 to-cyan-900/10 pointer-events-none" />
      
      {/* Triangle Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 opacity-5 pointer-events-none">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <defs>
            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ff1493" />
              <stop offset="50%" stopColor="#ffd700" />
              <stop offset="100%" stopColor="#00bfff" />
            </linearGradient>
          </defs>
          <polygon points="100,20 20,180 180,180" fill="url(#logoGrad)" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Progress Bar */}
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

        {/* Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white/5 rounded-2xl border border-white/10 p-8 mb-6 min-h-[400px] flex items-center justify-center"
        >
          {renderStep()}
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-6 py-3 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={
                (currentStep === 1 && (!profileData.agreements.terms_accepted || !profileData.agreements.privacy_accepted)) ||
                (currentStep === 3 && profileData.system_groups.length === 0) ||
                (currentStep === 4 && !profileData.birthdate)
              }
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