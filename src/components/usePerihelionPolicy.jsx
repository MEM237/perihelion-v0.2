import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Hook to manage Perihelion identity policy decisions
 * Reads profile_matrix, preferences, and trust_signals to inform:
 * - Identity state eligibility
 * - PARA-Engine metrics
 * - Room access decisions
 */
export default function usePerihelionPolicy() {
  const [user, setUser] = useState(null);
  const [policy, setPolicy] = useState({
    canUseVerified: false,
    canUseVerifiedAnonymous: false,
    suggestedIdentity: 'anonymous',
    paraMetrics: {
      creative_expression: 50,
      community_orientation: 50,
      cultural_alignment: 50,
      identity_flexibility: 50
    },
    defaultFx: 'authentic',
    trustLevel: 'standard'
  });

  useEffect(() => {
    const loadPolicy = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Calculate policy from user data
        const trustSignals = currentUser.trust_signals || {};
        const preferences = currentUser.preferences || {};
        const profileMatrix = currentUser.profile_matrix || {};

        // Determine eligibility based on trust level
        const trustLevel = trustSignals.trust_level || 'standard';
        const canUseVerified = trustLevel !== 'low';
        const canUseVerifiedAnonymous = trustLevel === 'high' || trustLevel === 'standard';

        // Suggest identity based on preferences
        let suggestedIdentity = 'anonymous';
        if (preferences.prefers_verified_anonymous && canUseVerifiedAnonymous) {
          suggestedIdentity = 'verified-anonymous';
        } else if (canUseVerified) {
          suggestedIdentity = 'verified';
        }

        setPolicy({
          canUseVerified,
          canUseVerifiedAnonymous,
          suggestedIdentity,
          paraMetrics: {
            creative_expression: profileMatrix.creative_expression || 50,
            community_orientation: profileMatrix.community_orientation || 50,
            cultural_alignment: profileMatrix.cultural_alignment || 50,
            identity_flexibility: profileMatrix.identity_flexibility || 50
          },
          defaultFx: preferences.default_fx || 'authentic',
          trustLevel
        });
      } catch (error) {
        console.error('Failed to load policy:', error);
      }
    };

    loadPolicy();
  }, []);

  return { user, policy };
}