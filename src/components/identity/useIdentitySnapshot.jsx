import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Hook to fetch and manage user identity snapshot
 * Single source of truth for identity state
 */
export default function useIdentitySnapshot() {
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSnapshot = async () => {
    try {
      setLoading(true);
      const response = await base44.functions.invoke('getUserIdentitySnapshot', {});
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }

      setSnapshot(response.data.snapshot);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch identity snapshot:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSnapshot();
  }, []);

  const setPublicPresence = async (mode) => {
    try {
      const response = await base44.functions.invoke('setPublicPresence', { mode });
      
      if (response.data.error) {
        throw new Error(response.data.message || response.data.error);
      }

      setSnapshot(response.data.snapshot);
      return { success: true };
    } catch (err) {
      console.error('Failed to set public presence:', err);
      return { success: false, error: err.message };
    }
  };

  const startVerification = async () => {
    try {
      const response = await base44.functions.invoke('startVerification', {});
      return response.data;
    } catch (err) {
      console.error('Failed to start verification:', err);
      return { error: err.message };
    }
  };

  const completeVerification = async (verificationId) => {
    try {
      const response = await base44.functions.invoke('completeVerification', { verificationId });
      
      if (response.data.error) {
        throw new Error(response.data.message || response.data.error);
      }

      setSnapshot(response.data.snapshot);
      return { success: true };
    } catch (err) {
      console.error('Failed to complete verification:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    snapshot,
    loading,
    error,
    refresh: fetchSnapshot,
    setPublicPresence,
    startVerification,
    completeVerification
  };
}