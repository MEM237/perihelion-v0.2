import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, Phone, PhoneOff } from 'lucide-react';
import VideoCall from '@/components/video/VideoCall';
import SessionInvite from '@/components/video/SessionInvite';

/**
 * Call State Machine:
 * idle -> creating -> ringing -> joining -> in_call -> ended
 *                                      \-> error
 */
export default function Session() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  
  const [callState, setCallState] = useState('idle');
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);
  const [token, setToken] = useState(null);
  const [isCreator, setIsCreator] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        if (sessionId) {
          // Joining an existing session
          await handleJoinSession(sessionId);
        } else {
          // Idle state, waiting for user action
          setCallState('idle');
        }
      } catch (err) {
        console.error('Session init error:', err);
        setError('Failed to initialize session');
        setCallState('error');
      }
    };

    init();
  }, [sessionId]);

  const handleJoinSession = async (sid) => {
    setCallState('joining');
    setError(null);

    try {
      const response = await base44.functions.invoke('joinVideoSession', {
        session_id: sid,
        accept_invite: true
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      setSession(response.data.session);
      setToken(response.data.participant_token);
      setIsCreator(false);
      setCallState('in_call');
    } catch (err) {
      console.error('Join session error:', err);
      const errorMsg = err.response?.data?.error || err.message;
      
      if (errorMsg.includes('expired')) {
        setError('This session has expired');
      } else if (errorMsg.includes('ended')) {
        setError('This session has ended');
      } else if (errorMsg.includes('not authorized')) {
        setError('You are not invited to this session');
      } else {
        setError(errorMsg);
      }
      
      setCallState('error');
    }
  };

  const handleCreateSession = async (invitedUserId) => {
    setCallState('creating');
    setError(null);

    try {
      const response = await base44.functions.invoke('createVideoSession', {
        invited_user_id: invitedUserId,
        identity_requirement: 'anonymous',
        trust_requirement: 'standard',
        session_duration_minutes: 60
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      setSession({ id: response.data.session_id, expires_at: response.data.expires_at });
      setToken(response.data.creator_token);
      setIsCreator(true);
      setCallState('ringing');
      
      // Update URL to include session ID
      navigate(`/session/${response.data.session_id}`, { replace: true });
    } catch (err) {
      console.error('Create session error:', err);
      setError(err.response?.data?.error || err.message);
      setCallState('error');
    }
  };

  const handleEndSession = async () => {
    if (!session?.id || !isCreator) return;

    try {
      await base44.functions.invoke('endVideoSession', {
        session_id: session.id
      });
      setCallState('ended');
    } catch (err) {
      console.error('End session error:', err);
    }
  };

  const handleCallEnded = () => {
    setCallState('ended');
  };

  const handleCallError = (errorMsg) => {
    setError(errorMsg);
    setCallState('error');
  };

  const handleReturnHome = () => {
    navigate('/perihelion');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/10 to-cyan-900/10 pointer-events-none" />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {callState === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <Phone className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <h1 className="text-2xl font-light mb-6">Start a Video Session</h1>
              <p className="text-gray-400 mb-8">Video-only, 1:1 sessions with identity verification</p>
              <button
                onClick={handleReturnHome}
                className="px-6 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                Return to Perihelion
              </button>
            </motion.div>
          )}

          {(callState === 'creating' || callState === 'joining') && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <Loader2 className="w-16 h-16 text-purple-500 mx-auto mb-4 animate-spin" />
              <h1 className="text-2xl font-light mb-2">
                {callState === 'creating' ? 'Creating Session...' : 'Joining Session...'}
              </h1>
              <p className="text-gray-400">Please wait</p>
            </motion.div>
          )}

          {callState === 'ringing' && (
            <SessionInvite
              sessionId={session?.id}
              expiresAt={session?.expires_at}
              onEnd={handleEndSession}
            />
          )}

          {callState === 'in_call' && token && (
            <VideoCall
              token={token}
              sessionId={session?.id}
              isCreator={isCreator}
              onCallEnded={handleCallEnded}
              onError={handleCallError}
              onEnd={handleEndSession}
            />
          )}

          {callState === 'ended' && (
            <motion.div
              key="ended"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <PhoneOff className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h1 className="text-2xl font-light mb-2">Session Ended</h1>
              <p className="text-gray-400 mb-8">The video session has been closed</p>
              <button
                onClick={handleReturnHome}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:opacity-90 transition-opacity"
              >
                Return to Perihelion
              </button>
            </motion.div>
          )}

          {callState === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center max-w-md"
            >
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-light mb-2">Session Error</h1>
              <p className="text-gray-400 mb-8">{error || 'An unexpected error occurred'}</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleReturnHome}
                  className="px-6 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  Return to Perihelion
                </button>
                {sessionId && (
                  <button
                    onClick={() => handleJoinSession(sessionId)}
                    className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}