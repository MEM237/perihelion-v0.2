import React from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Eye } from 'lucide-react';

const identityTiers = [
  {
    id: 'anonymous',
    name: 'Anonymous',
    icon: Eye,
    description: 'Present without attribution',
    capabilities: ['Access public rooms', 'View content', 'Limited interaction'],
    color: 'gray',
    gradient: 'from-gray-500 to-gray-600'
  },
  {
    id: 'verified',
    name: 'Verified',
    icon: Shield,
    description: 'Accountable presence',
    capabilities: ['Create content', 'Full room access', 'Identity-linked actions'],
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    id: 'verified-anonymous',
    name: 'Verified Anonymous',
    icon: User,
    description: 'Accountability without exposure',
    capabilities: ['Verified trust level', 'Anonymous display', 'Protected identity'],
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600'
  }
];

export default function IdentitySelector({ identityState, setIdentityState, policy }) {
  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
      <h2 className="text-lg font-light mb-4">Identity State</h2>
      
      <div className="space-y-3">
        {identityTiers.map((tier) => {
          const Icon = tier.icon;
          const isActive = identityState === tier.id;

          // Check eligibility based on policy
          const isEligible = tier.id === 'anonymous' || 
            (tier.id === 'verified' && policy?.canUseVerified) ||
            (tier.id === 'verified-anonymous' && policy?.canUseVerifiedAnonymous);

          const isSuggested = policy?.suggestedIdentity === tier.id;

          return (
            <motion.button
              key={tier.id}
              onClick={() => isEligible && setIdentityState(tier.id)}
              disabled={!isEligible}
              whileHover={{ scale: isEligible ? 1.02 : 1 }}
              whileTap={{ scale: isEligible ? 0.98 : 1 }}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 relative ${
                isActive
                  ? `border-${tier.color}-500 bg-${tier.color}-500/10`
                  : isEligible 
                    ? 'border-white/10 hover:border-white/20 bg-white/5'
                    : 'border-white/5 bg-white/5 opacity-40 cursor-not-allowed'
              }`}
              style={
                isActive
                  ? {
                      borderColor: tier.color === 'gray' ? '#6b7280' : tier.color === 'blue' ? '#3b82f6' : '#a855f7',
                      backgroundColor: tier.color === 'gray' ? 'rgba(107, 114, 128, 0.1)' : tier.color === 'blue' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(168, 85, 247, 0.1)'
                    }
                  : {}
              }
            >
              {isSuggested && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-xs text-purple-400">
                  Suggested
                </div>
              )}

              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tier.gradient} flex items-center justify-center flex-shrink-0`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-white">{tier.name}</h3>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 rounded-full bg-green-500"
                      />
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-400 mb-2">{tier.description}</p>
                  
                  <div className="space-y-1">
                    {tier.capabilities.map((capability, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className={`w-1 h-1 rounded-full ${
                          isActive ? `bg-${tier.color}-400` : 'bg-gray-600'
                        }`}
                        style={
                          isActive
                            ? {
                                backgroundColor: tier.color === 'gray' ? '#9ca3af' : tier.color === 'blue' ? '#60a5fa' : '#c084fc'
                              }
                            : {}
                        }
                        />
                        <span className="text-xs text-gray-500">{capability}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-white/10">
        <p className="text-xs text-gray-500 leading-relaxed">
          Identity state determines visibility, permissions, and social gravity within rooms. 
          Switch freely to experience different interaction models.
        </p>
      </div>
    </div>
  );
}