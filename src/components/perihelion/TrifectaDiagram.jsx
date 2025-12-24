import React from 'react';
import { motion } from 'framer-motion';
import { X, Camera, User, MapPin } from 'lucide-react';

export default function TrifectaDiagram({ onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl w-full bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-12"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        {/* Title */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-light mb-4"
          >
            The Perihelion Trifecta
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 max-w-2xl mx-auto"
          >
            A unified real-time identity loop integrating three foundational pillars
          </motion.p>
        </div>

        {/* Trifecta Diagram */}
        <div className="relative">
          {/* Central Node */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center border-4 border-black">
              <div className="text-center">
                <div className="w-8 h-8 rounded-full bg-white mx-auto mb-1" />
                <span className="text-xs text-white font-light">YOU</span>
              </div>
            </div>
          </motion.div>

          {/* Connecting Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ height: '400px' }}>
            <motion.line
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.3 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              x1="50%"
              y1="50%"
              x2="20%"
              y2="20%"
              stroke="url(#gradient1)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            <motion.line
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.3 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              x1="50%"
              y1="50%"
              x2="80%"
              y2="20%"
              stroke="url(#gradient2)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            <motion.line
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.3 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              x1="50%"
              y1="50%"
              x2="50%"
              y2="85%"
              stroke="url(#gradient3)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
              <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <linearGradient id="gradient3" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>

          {/* Three Pillars */}
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8" style={{ minHeight: '400px' }}>
            {/* Local Camera Presence */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mb-4 border-2 border-purple-400/30">
                <Camera className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-light mb-2">Local Camera Presence</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Live video feed as primary interface. Presence over representation.
              </p>
            </motion.div>

            {/* Identity Protocol */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 border-2 border-blue-400/30">
                <User className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-light mb-2">Identity Protocol</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Fluid identity states: Anonymous, Verified, Verified-Anonymous.
              </p>
            </motion.div>

            {/* Spatial Context */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center mb-4 border-2 border-violet-400/30">
                <MapPin className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-light mb-2">Spatial Context</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Room-based communities where context determines interaction.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Bottom Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-gray-500 italic max-w-2xl mx-auto leading-relaxed">
            "A new communication standard where presence, identity, and context converge 
            into a unified architectural foundation—engineered for cultural evolution."
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}