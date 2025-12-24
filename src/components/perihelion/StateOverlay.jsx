import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Shield, Lock, Unlock, MessageCircle, Camera } from 'lucide-react';

export default function StateOverlay({ identityState }) {
  const getStateInfo = () => {
    switch (identityState) {
      case 'anon':
        return {
          title: 'Anonymous Mode',
          description: 'You are present but not attributed',
          permissions: [
            { icon: Eye, text: 'Can view public content', enabled: true },
            { icon: MessageCircle, text: 'Limited interaction', enabled: true },
            { icon: Camera, text: 'No content creation', enabled: false },
            { icon: Lock, text: 'Some rooms restricted', enabled: false }
          ],
          color: 'gray'
        };
      case 'verified':
        return {
          title: 'Verified Mode',
          description: 'Full accountability and attribution',
          permissions: [
            { icon: Shield, text: 'Full room access', enabled: true },
            { icon: Camera, text: 'Content creation enabled', enabled: true },
            { icon: MessageCircle, text: 'All interactions available', enabled: true },
            { icon: Unlock, text: 'Identity-linked actions', enabled: true }
          ],
          color: 'blue'
        };
      case 'verifiedAnon':
        return {
          title: 'Verified Anonymous',
          description: 'Trust without exposure',
          permissions: [
            { icon: Shield, text: 'Verified trust level', enabled: true },
            { icon: Eye, text: 'Anonymous display', enabled: true },
            { icon: Camera, text: 'Protected content creation', enabled: true },
            { icon: Lock, text: 'Identity shielded', enabled: true }
          ],
          color: 'purple'
        };
      default:
        return null;
    }
  };

  const stateInfo = getStateInfo();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mt-6 bg-white/5 rounded-2xl border border-white/10 p-6"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={identityState}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-lg font-light mb-2">{stateInfo.title}</h3>
          <p className="text-sm text-gray-400 mb-4">{stateInfo.description}</p>

          <div className="space-y-2">
            {stateInfo.permissions.map((permission, idx) => {
              const Icon = permission.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className="flex items-center gap-3"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      permission.enabled
                        ? stateInfo.color === 'gray'
                          ? 'bg-gray-500/20'
                          : stateInfo.color === 'blue'
                          ? 'bg-blue-500/20'
                          : 'bg-purple-500/20'
                        : 'bg-gray-800/50'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        permission.enabled
                          ? stateInfo.color === 'gray'
                            ? 'text-gray-400'
                            : stateInfo.color === 'blue'
                            ? 'text-blue-400'
                            : 'text-purple-400'
                          : 'text-gray-600'
                      }`}
                    />
                  </div>
                  <span
                    className={`text-sm ${
                      permission.enabled ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    {permission.text}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}