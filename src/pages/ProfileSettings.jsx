import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Save, Loader2, ChevronLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';

export default function ProfileSettings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    display_name: '',
    profile_matrix: {
      creative_expression: 50,
      community_orientation: 50,
      cultural_alignment: 50,
      identity_flexibility: 50
    },
    preferences: {
      prefers_verified_anonymous: false,
      default_fx: 'authentic'
    }
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        setFormData({
          display_name: currentUser.display_name || '',
          profile_matrix: currentUser.profile_matrix || {
            creative_expression: 50,
            community_orientation: 50,
            cultural_alignment: 50,
            identity_flexibility: 50
          },
          preferences: currentUser.preferences || {
            prefers_verified_anonymous: false,
            default_fx: 'authentic'
          }
        });
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe(formData);
      navigate('/perihelion');
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/10 to-cyan-900/10 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 border-b border-white/10">
        <div className="max-w-4xl mx-auto p-6">
          <button
            onClick={() => navigate('/perihelion')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Perihelion
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-b from-pink-500 via-purple-500 to-cyan-500 flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-light">Profile Settings</h1>
              <p className="text-sm text-gray-400">Manage your capability signals and preferences</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto p-6 space-y-6">
        {/* Identity Info */}
        <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
          <h2 className="text-lg font-light mb-4">Identity</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Full Name (Base44 Account)</label>
              <input
                type="text"
                value={user?.full_name || ''}
                disabled
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Display Name <span className="text-gray-600">(shown when not anonymous)</span>
              </label>
              <input
                type="text"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                placeholder={user?.full_name || "Your display name"}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
              />
            </div>
          </div>
        </div>

        {/* Profile Matrix */}
        <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
          <h2 className="text-lg font-light mb-2">Profile Matrix</h2>
          <p className="text-xs text-gray-500 mb-6">
            These signals inform access, affinity, and PARA-Engine metrics. They are not rankings or scores.
          </p>

          <div className="space-y-6">
            {[
              { key: 'creative_expression', label: 'Creative Expression', sublabel: 'gender expression', markers: { 1: 'female', 50: 'agender/fluid', 100: 'male' } },
              { key: 'community_orientation', label: 'Community Orientation', sublabel: 'gender presentation', markers: { 1: 'feminine', 50: 'androgynous', 100: 'masculine' } },
              { key: 'cultural_alignment', label: 'Cultural Alignment', sublabel: 'sexual identity', markers: { 1: 'straight', 50: 'bisexual', 100: 'queer' } },
              { key: 'identity_flexibility', label: 'Identity Flexibility', sublabel: 'sexual role', markers: { 1: 'top/dom', 50: 'versatile/switch', 100: 'bottom/sub' } }
            ].map(({ key, label, sublabel, markers }) => {
              const value = formData.profile_matrix[key];
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
                  onChange={(e) => setFormData({
                    ...formData,
                    profile_matrix: {
                      ...formData.profile_matrix,
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

        {/* Preferences */}
        <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
          <h2 className="text-lg font-light mb-4">Preferences</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
              <div>
                <p className="text-sm font-medium text-white">Prefer Verified Anonymous</p>
                <p className="text-xs text-gray-500">Default to verified anonymous mode when possible</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.preferences.prefers_verified_anonymous}
                  onChange={(e) => setFormData({
                    ...formData,
                    preferences: {
                      ...formData.preferences,
                      prefers_verified_anonymous: e.target.checked
                    }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-3 block">Default FX Mode</label>
              <div className="grid grid-cols-2 gap-2">
                {['authentic', 'ethereal', 'cyberpunk', 'masked'].map((fx) => (
                  <button
                    key={fx}
                    onClick={() => setFormData({
                      ...formData,
                      preferences: {
                        ...formData.preferences,
                        default_fx: fx
                      }
                    })}
                    className={`p-3 rounded-lg border transition-all capitalize ${
                      formData.preferences.default_fx === fx
                        ? 'border-purple-500 bg-purple-500/20 text-white'
                        : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    {fx}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                <div>
                  <p className="text-sm font-medium text-white">Enable Profile Matching</p>
                  <p className="text-xs text-gray-500">Find users with similar profile signals</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.matching_enabled || false}
                    onChange={(e) => setFormData({ ...formData, matching_enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                <div>
                  <p className="text-sm font-medium text-white">Admin Contact Permission</p>
                  <p className="text-xs text-gray-500">Allow platform administrators to contact you</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.preferences?.contact_admin_ok !== false}
                    onChange={(e) => setFormData({
                      ...formData,
                      preferences: {
                        ...formData.preferences,
                        contact_admin_ok: e.target.checked
                      }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Signals (Read-only) */}
        {user?.trust_signals && (
          <div className="bg-white/5 rounded-2xl border border-yellow-500/30 p-6">
            <h2 className="text-lg font-light mb-2 text-yellow-400">Trust Signals</h2>
            <p className="text-xs text-gray-500 mb-4">System-managed policy data (read-only)</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-xs text-gray-500 mb-1">Trust Level</p>
                <p className="text-sm text-white capitalize">{user.trust_signals.trust_level || 'standard'}</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-xs text-gray-500 mb-1">Moderation Flags</p>
                <p className="text-sm text-white">{user.trust_signals.moderation_flags || 0}</p>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}