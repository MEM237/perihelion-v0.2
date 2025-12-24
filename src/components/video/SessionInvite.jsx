import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Clock, Copy, Check, X } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function SessionInvite({ sessionId, expiresAt, onEnd }) {
  const [copied, setCopied] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    if (!expiresAt) return;

    const updateTime = () => {
      const now = new Date();
      const expiry = new Date(expiresAt);
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeRemaining('Expired');
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const inviteUrl = `${window.location.origin}${createPageUrl('Session')}/${sessionId}`;

  const handleCopyInvite = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="max-w-md w-full"
    >
      <div className="bg-white/5 rounded-2xl border border-white/10 p-8">
        {/* Ringing Animation */}
        <div className="relative mb-6">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl"
          />
          <div className="relative w-20 h-20 mx-auto bg-gradient-to-b from-pink-500 via-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
            <Phone className="w-10 h-10 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-light text-center mb-2">Waiting for Participant</h1>
        <p className="text-sm text-gray-400 text-center mb-6">
          Share the invite link to start the session
        </p>

        {/* Invite Link */}
        <div className="mb-6">
          <label className="text-xs text-gray-500 mb-2 block">Invite Link</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inviteUrl}
              readOnly
              className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm truncate"
            />
            <button
              onClick={handleCopyInvite}
              className="px-4 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Session Info */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
            <span className="text-sm text-gray-400">Session ID</span>
            <span className="text-sm text-white font-mono">{sessionId?.slice(-8)}</span>
          </div>

          {timeRemaining && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-sm text-gray-400 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time Remaining
              </span>
              <span className="text-sm text-white font-mono">{timeRemaining}</span>
            </div>
          )}

          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <p className="text-xs text-blue-400">
              ℹ️ The session will begin automatically when the invited participant joins
            </p>
          </div>
        </div>

        {/* Cancel Button */}
        <button
          onClick={onEnd}
          className="w-full px-6 py-3 rounded-lg bg-red-600/20 border border-red-500/50 hover:bg-red-600/30 transition-colors flex items-center justify-center gap-2 text-red-400"
        >
          <X className="w-4 h-4" />
          Cancel Session
        </button>
      </div>
    </motion.div>
  );
}