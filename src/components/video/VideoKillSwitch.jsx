import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Eye in the Sky Kill Switch
 * Overlay control for local and remote video feeds
 */
export default function VideoKillSwitch({ isLocal, onToggle, initialActive = true }) {
  const [isActive, setIsActive] = useState(initialActive);

  const handleToggle = () => {
    const newState = !isActive;
    setIsActive(newState);
    onToggle(newState);
  };

  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={handleToggle}
      className={`absolute top-4 left-1/2 -translate-x-1/2 z-20 px-3 py-2 rounded-lg backdrop-blur-md border transition-all ${
        isActive
          ? 'bg-black/40 border-white/20 hover:bg-black/60'
          : 'bg-red-900/80 border-red-500/50 hover:bg-red-900'
      }`}
      title={isActive ? 'Stop feed' : 'Feed stopped'}
    >
      <div className="flex items-center gap-2">
        {isActive ? (
          <Eye className="w-4 h-4 text-white" />
        ) : (
          <EyeOff className="w-4 h-4 text-white" />
        )}
        <span className="text-xs text-white font-medium">
          {isActive ? (isLocal ? 'Local' : 'Remote') : 'Stopped'}
        </span>
      </div>
    </motion.button>
  );
}