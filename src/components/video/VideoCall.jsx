import React, { useEffect, useRef, useState } from 'react';
import DailyIframe from '@daily-co/daily-js';
import { motion } from 'framer-motion';
import { PhoneOff, AlertCircle, Video, VideoOff } from 'lucide-react';

export default function VideoCall({ token, sessionId, isCreator, onCallEnded, onError, onEnd }) {
  const callFrameRef = useRef(null);
  const containerRef = useRef(null);
  const [callObject, setCallObject] = useState(null);
  const [participants, setParticipants] = useState({});
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [localCameraError, setLocalCameraError] = useState(null);
  const [roomError, setRoomError] = useState(null);

  useEffect(() => {
    // Create Daily call object
    const initCall = async () => {
      try {
        // Check for secure context
        if (!window.isSecureContext) {
          throw new Error('Video requires HTTPS or localhost');
        }

        const daily = DailyIframe.createCallObject({
          audioSource: false, // No audio
          videoSource: true,
          dailyConfig: {
            experimentalChromeVideoMuteLightOff: true
          }
        });

        setCallObject(daily);

        // Set up event listeners
        daily
          .on('joined-meeting', handleJoinedMeeting)
          .on('participant-joined', handleParticipantJoined)
          .on('participant-updated', handleParticipantUpdated)
          .on('participant-left', handleParticipantLeft)
          .on('left-meeting', handleLeftMeeting)
          .on('error', handleError)
          .on('camera-error', handleCameraError);

        // Join the call
        await daily.join({ token, url: null });

        // Ensure camera is on, audio is off
        await daily.setLocalAudio(false);
        await daily.setLocalVideo(true);

      } catch (err) {
        console.error('Failed to initialize call:', err);
        
        if (err.message?.includes('HTTPS') || err.message?.includes('secure')) {
          onError('Video sessions require a secure connection (HTTPS)');
        } else if (err.message?.includes('permission')) {
          onError('Camera permission denied. Please enable camera access.');
        } else {
          onError(err.message || 'Failed to join video session');
        }
      }
    };

    initCall();

    // Cleanup
    return () => {
      if (callObject) {
        callObject.destroy().catch(console.error);
      }
    };
  }, [token]);

  const handleJoinedMeeting = (event) => {
    console.log('Joined meeting:', event);
    const localParticipant = event?.participants?.local;
    if (localParticipant) {
      setParticipants(prev => ({ ...prev, local: localParticipant }));
    }
  };

  const handleParticipantJoined = (event) => {
    console.log('Participant joined:', event);
    setParticipants(prev => ({ ...prev, [event.participant.session_id]: event.participant }));
  };

  const handleParticipantUpdated = (event) => {
    setParticipants(prev => ({ ...prev, [event.participant.session_id]: event.participant }));
  };

  const handleParticipantLeft = (event) => {
    console.log('Participant left:', event);
    setParticipants(prev => {
      const updated = { ...prev };
      delete updated[event.participant.session_id];
      return updated;
    });

    // If the other participant left, end the call
    if (!event.participant.local) {
      setTimeout(() => {
        onCallEnded();
      }, 1000);
    }
  };

  const handleLeftMeeting = () => {
    console.log('Left meeting');
    onCallEnded();
  };

  const handleError = (event) => {
    console.error('Daily call error:', event);
    
    if (event.errorMsg?.includes('room') || event.errorMsg?.includes('deleted')) {
      setRoomError('The session has been ended');
      setTimeout(() => onCallEnded(), 2000);
    } else {
      onError(event.errorMsg || 'An error occurred during the call');
    }
  };

  const handleCameraError = (event) => {
    console.error('Camera error:', event);
    setLocalCameraError('Camera access error. Please check your permissions.');
  };

  const toggleCamera = async () => {
    if (!callObject) return;

    try {
      await callObject.setLocalVideo(!cameraEnabled);
      setCameraEnabled(!cameraEnabled);
    } catch (err) {
      console.error('Failed to toggle camera:', err);
    }
  };

  const handleEndCall = async () => {
    if (!callObject) return;

    try {
      await callObject.leave();
      
      // If creator, end the session server-side
      if (isCreator && onEnd) {
        await onEnd();
      }
    } catch (err) {
      console.error('Failed to end call:', err);
    }
  };

  // Render video tiles
  const renderVideoTiles = () => {
    const participantList = Object.values(participants);
    
    return participantList.map((participant) => (
      <div
        key={participant.session_id}
        className="relative aspect-video bg-black rounded-xl overflow-hidden border-2 border-purple-500/30"
      >
        <video
          ref={(el) => {
            if (el && participant.video) {
              el.srcObject = new MediaStream([participant.videoTrack]);
            }
          }}
          autoPlay
          playsInline
          muted={participant.local}
          className="w-full h-full object-cover"
        />
        
        {/* Participant label */}
        <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-black/60 backdrop-blur-sm">
          <p className="text-xs text-white">
            {participant.local ? 'You' : participant.user_name || 'Participant'}
          </p>
        </div>

        {/* Video off indicator */}
        {!participant.video && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <VideoOff className="w-12 h-12 text-gray-600" />
          </div>
        )}
      </div>
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-6xl mx-auto"
    >
      <div ref={containerRef} className="relative">
        {/* Video Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {renderVideoTiles()}
        </div>

        {/* Error Overlays */}
        {localCameraError && (
          <div className="mb-4 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-500 font-medium">Camera Error</p>
              <p className="text-xs text-yellow-400/80 mt-1">{localCameraError}</p>
            </div>
          </div>
        )}

        {roomError && (
          <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-500 font-medium">Session Error</p>
              <p className="text-xs text-red-400/80 mt-1">{roomError}</p>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={toggleCamera}
            className={`p-4 rounded-full transition-all ${
              cameraEnabled
                ? 'bg-white/10 hover:bg-white/20 border border-white/20'
                : 'bg-red-500/20 border border-red-500/50'
            }`}
            title={cameraEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {cameraEnabled ? (
              <Video className="w-6 h-6 text-white" />
            ) : (
              <VideoOff className="w-6 h-6 text-red-500" />
            )}
          </button>

          <button
            onClick={handleEndCall}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
            title="End call"
          >
            <PhoneOff className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Session Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Session ID: {sessionId} • Video Only • End-to-End Encrypted
          </p>
        </div>
      </div>
    </motion.div>
  );
}