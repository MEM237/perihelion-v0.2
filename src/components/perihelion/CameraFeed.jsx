import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, AlertCircle, Upload, Bot, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import VideoKillSwitch from '../video/VideoKillSwitch';

export default function CameraFeed({ identityState, bypassMode, standbyImage, setStandbyImage, chatMode = 'LARRZ', cameraMode = 'MANUAL' }) {
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    if (bypassMode) return;

    let currentStream = null;

    const startCamera = async () => {
      try {
        // Only auto-start if camera mode is AOS
        if (cameraMode !== 'AOS' && !cameraActive) {
          return;
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: false
        });

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          currentStream = mediaStream;
          setStream(mediaStream);
          setCameraActive(true);
        }
      } catch (err) {
        console.error('Camera access error:', err);
        setError(err.message);
      }
    };

    if (cameraMode === 'AOS' || cameraActive) {
      startCamera();
    }

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [bypassMode, cameraMode, cameraActive]);

  const handleKillSwitch = (isActive) => {
    if (!isActive) {
      // Stop camera
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setCameraActive(false);
    } else {
      // Restart camera
      setCameraActive(true);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setStandbyImage(file_url);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  // Get overlay styling based on identity color key
  const getOverlayStyle = () => {
    switch (identityState) {
      case 'anon':
        return {
          border: 'border-gray-500/30',
          glow: 'shadow-[0_0_50px_rgba(156,163,175,0.15)]',
          corner: 'bg-gray-500'
        };
      case 'verified':
        return {
          border: 'border-blue-500/40',
          glow: 'shadow-[0_0_50px_rgba(59,130,246,0.2)]',
          corner: 'bg-blue-500'
        };
      case 'verifiedAnon':
        return {
          border: 'border-purple-500/40',
          glow: 'shadow-[0_0_50px_rgba(168,85,247,0.2)]',
          corner: 'bg-purple-500'
        };
      default:
        return {
          border: 'border-gray-500/30',
          glow: '',
          corner: 'bg-gray-500'
        };
    }
  };

  const overlayStyle = getOverlayStyle();

  if (error && !bypassMode) {
    return (
      <div className="w-full aspect-video rounded-2xl bg-gray-900 border border-red-500/30 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Camera Error</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      key={identityState}
      initial={{ opacity: 0.8 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full aspect-video rounded-2xl overflow-hidden"
    >
      {/* Camera Feed or Standby Image */}
      {bypassMode ? (
        standbyImage ? (
          <img
            src={standbyImage}
            alt="Standby presence"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-900 flex items-center justify-center">
            <div className="text-center">
              <Upload className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-sm mb-4">Upload a standby image</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg transition-colors text-sm"
              >
                {uploading ? 'Uploading...' : 'Choose Image'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>
        )
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      )}

      {/* Identity State Border & Glow */}
      <div
        className={`absolute inset-0 border-2 rounded-2xl pointer-events-none transition-all duration-700 ${overlayStyle.border} ${overlayStyle.glow}`}
      />

      {/* Corner Indicators */}
      <div className="absolute top-4 left-4 flex gap-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`w-2 h-2 rounded-full ${overlayStyle.corner} animate-pulse`}
        />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
          className={`w-2 h-2 rounded-full ${overlayStyle.corner} opacity-60`}
        />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4 }}
          className={`w-2 h-2 rounded-full ${overlayStyle.corner} opacity-30`}
        />
      </div>

      {/* Presence Indicator */}
      {standbyImage && (
        <div className="absolute bottom-4 left-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/60 backdrop-blur-md border border-white/10"
          >
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-xs text-gray-200 font-light">Standby Presence</span>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="ml-2 text-xs text-purple-400 hover:text-purple-300"
            >
              Change
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </motion.div>
        </div>
      )}
      {!bypassMode && (
        <div className="absolute bottom-4 left-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/60 backdrop-blur-md border border-white/10"
          >
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-gray-200 font-light">Live Presence</span>
          </motion.div>
        </div>
      )}

      {/* Identity Badge */}
      <div className="absolute bottom-4 right-4">
        <motion.div
          key={identityState}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className={`px-3 py-2 rounded-lg backdrop-blur-md border text-xs font-light ${
            identityState === 'anon'
              ? 'bg-gray-900/80 border-gray-500/30 text-gray-300'
              : identityState === 'verified'
              ? 'bg-blue-900/80 border-blue-500/30 text-blue-200'
              : 'bg-purple-900/80 border-purple-500/30 text-purple-200'
          }`}
        >
          {identityState === 'anon' && 'Anonymous'}
          {identityState === 'verified' && 'Verified'}
          {identityState === 'verifiedAnon' && 'Verified Anonymous'}
        </motion.div>
      </div>

      {/* Chat Target Indicator */}
      <div className="absolute top-4 right-4">
        <motion.div
          key={chatMode}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/60 backdrop-blur-md border border-white/10"
        >
          {chatMode === 'LARRZ' ? (
            <>
              <Bot className="w-3 h-3 text-purple-400" />
              <span className="text-xs text-purple-300">LARRZ</span>
            </>
          ) : (
            <>
              <Users className="w-3 h-3 text-blue-400" />
              <span className="text-xs text-blue-300">Room</span>
            </>
          )}
        </motion.div>
      </div>

      {/* Kill Switch */}
      {!bypassMode && stream && (
        <VideoKillSwitch 
          isLocal={true}
          onToggle={handleKillSwitch}
          initialActive={cameraActive}
        />
      )}
    </motion.div>
  );
}