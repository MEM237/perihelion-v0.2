import React from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Eye, AlertCircle, Check } from 'lucide-react';

/**
 * Canonical identity state display
 * Renders based on server-derived identity snapshot
 */

const tierConfig = {
  ANON: {
    name: 'Anonymous',
    icon: Eye,
    description: 'Present without attribution',
    color: 'gray',
    gradient: 'from-gray-500 to-gray-600',
    borderColor: '#6b7280',
    bgColor: 'rgba(107, 114, 128, 0.1)',
    capabilities: ['Access public rooms', 'View content', 'Limited interaction']
  },
  VERIFIED: {
    name: 'Verified',
    icon: Shield,
    description: 'Accountable presence',
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600',
    borderColor: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    capabilities: ['Create content', 'Full room access', 'Identity-linked actions', 'Host sessions']
  },
  VERIFIED_ANON: {
    name: 'Verified Anonymous',
    icon: User,
    description: 'Accountability without exposure',
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600',
    borderColor: '#a855f7',
    bgColor: 'rgba(168, 85, 247, 0.1)',
    capabilities: ['Verified trust level', 'Anonymous display', 'Protected identity', 'Host sessions']
  }
};

export default function IdentityStateCard({ snapshot, onSetPublicPresence, onStartVerification }) {
  if (!snapshot) {
    return (
      <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
        <div className="flex items-center gap-3 text-gray-500">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">Loading identity...</span>
        </div>
      </div>
    );
  }

  const { tier, isVerified, isPublic } = snapshot;
  const config = tierConfig[tier];

  if (!config) {
    return (
      <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
        <div className="flex items-center gap-3 text-red-500">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">Invalid identity tier: {tier}</span>
        </div>
      </div>
    );
  }

  const Icon = config.icon;

  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
      <h2 className="text-lg font-light mb-4">Identity State</h2>

      {/* Current Tier Display */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 rounded-xl border-2 mb-4"
        style={{
          borderColor: config.borderColor,
          backgroundColor: config.bgColor
        }}
      >
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-white">{config.name}</h3>
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
            <p className="text-xs text-gray-400 mb-3">{config.description}</p>
            
            <div className="space-y-1">
              {config.capabilities.map((capability, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-gray-400">{capability}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Controls */}
      <div className="space-y-3">
        {/* Verification Status */}
        {!isVerified && (
          <button
            onClick={onStartVerification}
            className="w-full px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors text-sm text-white flex items-center justify-center gap-2"
          >
            <Shield className="w-4 h-4" />
            Start Verification
          </button>
        )}

        {/* Public/Masked Toggle (only for verified users) */}
        {isVerified && (
          <div className="flex gap-2">
            <button
              onClick={() => onSetPublicPresence('PUBLIC')}
              disabled={isPublic}
              className={`flex-1 px-4 py-3 rounded-lg border text-sm transition-colors ${
                isPublic
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              Public
            </button>
            <button
              onClick={() => onSetPublicPresence('MASKED')}
              disabled={!isPublic}
              className={`flex-1 px-4 py-3 rounded-lg border text-sm transition-colors ${
                !isPublic
                  ? 'bg-purple-600 border-purple-600 text-white'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              Masked
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-white/10">
        <p className="text-xs text-gray-500 leading-relaxed">
          Identity state determines visibility, permissions, and social gravity within rooms.
        </p>
      </div>
    </div>
  );
}