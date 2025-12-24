import React, { useState, useEffect, useRef } from 'react';
import { Camera, Info, Eye, EyeOff, Shield, User, MapPin, MessageCircle, Settings, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import usePerihelionPolicy from '@/components/usePerihelionPolicy';
import useIdentitySnapshot from '@/components/identity/useIdentitySnapshot';
import CameraFeed from '@/components/perihelion/CameraFeed';
import IdentityStateCard from '@/components/identity/IdentityStateCard';
import GroupExplorer from '@/components/perihelion/GroupExplorer';
import TrifectaDiagram from '@/components/perihelion/TrifectaDiagram';
import StateOverlay from '@/components/perihelion/StateOverlay';
import AssistantPanel from '@/components/perihelion/AssistantPanel';
import CreateSessionModal from '@/components/video/CreateSessionModal';

export default function Perihelion() {
  const navigate = useNavigate();
  const { user, policy } = usePerihelionPolicy();
  const { snapshot, loading: identityLoading, setPublicPresence, startVerification } = useIdentitySnapshot();
  const [cameraPermission, setCameraPermission] = useState(null);
  const [standbyImage, setStandbyImage] = useState(null);
  const [showTrifecta, setShowTrifecta] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [chatMode, setChatMode] = useState('LARRZ');

  // ROUTING GUARD: Ensure user has completed welcome and onboarding
  useEffect(() => {
    let isMounted = true;
    
    const checkAccess = async () => {
      try {
        const currentUser = await base44.auth.me();
        
        if (!isMounted) return;
        
        // Hard gate: redirect if prerequisites not met
        if (!currentUser.hasSeenWelcome) {
          navigate(createPageUrl('Welcome'), { replace: true });
          return;
        }
        
        if (!currentUser.hasCompletedOnboarding) {
          navigate(createPageUrl('OnboardingNew'), { replace: true });
          return;
        }
      } catch (error) {
        console.error('Access check failed:', error);
        if (isMounted) {
          navigate(createPageUrl('Welcome'), { replace: true });
        }
      }
    };
    
    checkAccess();
    
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  useEffect(() => {
    // Request camera permission immediately
    const requestCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraPermission('granted');
        setIsInitialized(true);
        // Stop the test stream
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        setCameraPermission('denied');
        setIsInitialized(true);
      }
    };

    requestCamera();
  }, []);

  if (!isInitialized || identityLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Initializing presence...</p>
        </motion.div>
      </div>
    );
  }

  if (cameraPermission === 'denied') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md text-center"
        >
          <Camera className="w-16 h-16 text-gray-600 mx-auto mb-6" />
          <h1 className="text-2xl font-light text-white mb-3">Camera Access</h1>
          <p className="text-gray-400 leading-relaxed mb-6">
            Perihelion is a camera-centric identity platform. You can enable camera access or use a standby image.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Grant Camera Access
            </button>
            <button
              onClick={() => setCameraPermission('bypass')}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-colors"
            >
              Use Standby Image
            </button>
          </div>
        </motion.div>
      </div>
    );
    }

    const handleCreateSession = (invitedUserId) => {
    navigate(`${createPageUrl('Session')}?invite=${invitedUserId}`);
    };

    return (
    <div className="min-h-screen bg-[#0A0A0A] text-white overflow-hidden relative">
      {/* Ambient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/10 to-cyan-900/10 pointer-events-none" />
      
      {/* Geometric Accent - Triangle motif inspired by logo */}
      <div className="absolute top-0 right-0 w-96 h-96 opacity-5 pointer-events-none">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ff1493" />
              <stop offset="25%" stopColor="#ff69b4" />
              <stop offset="50%" stopColor="#ffd700" />
              <stop offset="75%" stopColor="#00ff7f" />
              <stop offset="100%" stopColor="#00bfff" />
            </linearGradient>
          </defs>
          <polygon points="100,20 20,180 180,180" fill="url(#logoGradient)" />
        </svg>
      </div>
      
      {/* Main Layout */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top Bar */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 flex items-center justify-between border-b border-white/5"
        >
          <div className="flex items-center gap-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694b4f2681a1c65e4989bb6f/96648a1a6_jjjjjdjjjjmm.png"
              alt="Perihelion"
              className="h-10 w-auto"
            />
            <div className="h-6 w-px bg-white/20" />
            <h1 className="text-xl font-light tracking-tight">Perihelion</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateSession(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:opacity-90 transition-opacity text-sm"
            >
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">Start Session</span>
            </button>

            <Link
              to={createPageUrl('ProfileSettings')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 hover:border-white/20 transition-colors text-sm"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </Link>

            <button
              onClick={() => setShowAssistant(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 hover:border-white/20 transition-colors text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Assistant</span>
            </button>

            <button
              onClick={() => setShowTrifecta(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 hover:border-white/20 transition-colors text-sm"
            >
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline">Trifecta</span>
            </button>
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6">
          {/* Left Panel - Camera Feed */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1 flex flex-col"
          >
            <CameraFeed 
              identityState={snapshot?.identityColorKey || 'anon'}
              bypassMode={cameraPermission === 'bypass'}
              standbyImage={standbyImage}
              setStandbyImage={setStandbyImage}
              chatMode={chatMode}
              cameraMode={snapshot?.cameraPresenceMode || 'MANUAL'}
            />
            <StateOverlay identityState={snapshot?.identityColorKey || 'anon'} />
          </motion.div>

          {/* Right Panel - Controls & Context */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full lg:w-96 flex flex-col gap-6"
          >
            <GroupExplorer />
            <IdentityStateCard 
              snapshot={snapshot}
              onSetPublicPresence={setPublicPresence}
              onStartVerification={startVerification}
            />
          </motion.div>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="p-6 border-t border-white/5 text-center text-xs text-gray-500"
        >
          <p>Presence-first identity architecture • Prototype v0.1</p>
        </motion.footer>
      </div>

      {/* Trifecta Modal */}
      <AnimatePresence>
        {showTrifecta && (
          <TrifectaDiagram onClose={() => setShowTrifecta(false)} />
        )}
      </AnimatePresence>

      {/* Assistant Panel */}
      <AnimatePresence>
        {showAssistant && (
          <AssistantPanel 
            onClose={() => setShowAssistant(false)}
            identityState={snapshot?.identityColorKey || 'anon'}
            user={user}
            policy={policy}
          />
        )}
      </AnimatePresence>

      {/* Create Session Modal */}
      <AnimatePresence>
        {showCreateSession && (
          <CreateSessionModal
            onClose={() => setShowCreateSession(false)}
            onCreateSession={handleCreateSession}
          />
        )}
      </AnimatePresence>
      </div>
      );
      }