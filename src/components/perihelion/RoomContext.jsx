import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Users, MapPin } from 'lucide-react';

export default function RoomContext() {
  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-4 h-4 text-gray-400" />
        <h2 className="text-lg font-light">Spatial Context</h2>
      </div>

      {/* Hierarchical Path */}
      <div className="space-y-3">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 text-sm"
        >
          <div className="w-2 h-2 rounded-full bg-purple-500/50" />
          <span className="text-gray-400 font-light">System Group</span>
          <ChevronRight className="w-3 h-3 text-gray-600" />
          <span className="text-white font-medium">Global Commons</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 text-sm pl-4"
        >
          <div className="w-2 h-2 rounded-full bg-blue-500/50" />
          <span className="text-gray-400 font-light">Group</span>
          <ChevronRight className="w-3 h-3 text-gray-600" />
          <span className="text-white font-medium">Creative Vanguard</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2 text-sm pl-8"
        >
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-gray-400 font-light">Room</span>
          <ChevronRight className="w-3 h-3 text-gray-600" />
          <span className="text-white font-medium">Prototype Lab</span>
        </motion.div>
      </div>

      {/* Room Stats */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-500">Present Now</span>
            </div>
            <p className="text-2xl font-light text-white">12</p>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-purple-500/50" />
              <span className="text-xs text-gray-500">Room Type</span>
            </div>
            <p className="text-sm font-light text-white">Public</p>
          </div>
        </div>
      </div>

      {/* Context Note */}
      <div className="mt-4 p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
        <p className="text-xs text-gray-400 leading-relaxed">
          <span className="text-purple-400 font-medium">Context shifts behavior.</span> Your identity state 
          determines visibility and permissions within this room's unique configuration.
        </p>
      </div>
    </div>
  );
}