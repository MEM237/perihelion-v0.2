import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Users, MapPin, MessageSquare, X, Plus } from 'lucide-react';

const systemGroups = [
  {
    id: 1,
    name: 'Global Commons',
    type: 'System Group',
    color: 'purple',
    members: 324,
    rooms: [
      { id: 1, name: 'Welcome Plaza', active: 45, type: 'Public' },
      { id: 2, name: 'Info Hub', active: 23, type: 'Public' },
      { id: 3, name: 'General Discussion', active: 67, type: 'Public' }
    ],
    posts: [
      { id: 1, author: 'System', text: 'Welcome to Perihelion! Check out the new features.', time: '1h ago' },
      { id: 2, author: 'Alice', text: 'Excited to try the verified anonymous mode!', time: '3h ago' }
    ]
  },
  {
    id: 2,
    name: 'Creative Vanguard',
    type: 'Group',
    color: 'blue',
    members: 156,
    rooms: [
      { id: 4, name: 'Prototype Lab', active: 12, type: 'Public' },
      { id: 5, name: 'Design Studio', active: 8, type: 'Private' },
      { id: 6, name: 'Brainstorm', active: 15, type: 'Public' }
    ],
    posts: [
      { id: 3, author: 'Bob', text: 'New design mockups are ready for review', time: '30m ago' },
      { id: 4, author: 'Carol', text: 'Can we schedule a sync for tomorrow?', time: '2h ago' }
    ]
  },
  {
    id: 3,
    name: 'Research Collective',
    type: 'Group',
    color: 'green',
    members: 89,
    rooms: [
      { id: 7, name: 'Data Lab', active: 5, type: 'Private' },
      { id: 8, name: 'Theory Room', active: 11, type: 'Public' }
    ],
    posts: [
      { id: 5, author: 'Dave', text: 'Published the latest findings on identity mechanics', time: '4h ago' }
    ]
  },
  {
    id: 4,
    name: 'Social Nexus',
    type: 'Group',
    color: 'pink',
    members: 412,
    rooms: [
      { id: 9, name: 'Lounge', active: 89, type: 'Public' },
      { id: 10, name: 'Events Hall', active: 34, type: 'Public' },
      { id: 11, name: 'Game Room', active: 56, type: 'Public' }
    ],
    posts: [
      { id: 6, author: 'Eve', text: 'Virtual meetup this Friday at 7PM!', time: '1h ago' },
      { id: 7, author: 'Frank', text: 'Anyone up for a game night?', time: '5h ago' }
    ]
  }
];

export default function GroupExplorer() {
  const [selectedGroup, setSelectedGroup] = useState(null);

  const getColorClasses = (color) => {
    const colors = {
      purple: 'from-pink-500 via-purple-500 to-indigo-600',
      blue: 'from-cyan-500 via-blue-500 to-indigo-600',
      green: 'from-green-400 via-teal-500 to-cyan-600',
      pink: 'from-pink-500 via-rose-500 to-orange-500'
    };
    return colors[color] || colors.purple;
  };

  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-4 h-4 text-gray-400" />
        <h2 className="text-lg font-light">Spatial Context</h2>
      </div>

      {/* Horizontal Group Scroll */}
      <div className="overflow-x-auto pb-4 -mx-2 px-2">
        <div className="flex gap-3 min-w-max">
          {systemGroups.map(group => (
            <motion.button
              key={group.id}
              onClick={() => setSelectedGroup(group)}
              whileHover={{ scale: 1.02 }}
              className="w-48 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-left"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getColorClasses(group.color)} flex items-center justify-center mb-3`}>
                <Users className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-medium text-white mb-1">{group.name}</h3>
              <p className="text-xs text-gray-400 mb-2">{group.type}</p>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>{group.members} members</span>
                <span>•</span>
                <span>{group.rooms.length} rooms</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Group Detail Modal */}
      <AnimatePresence>
        {selectedGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedGroup(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-4xl max-h-[80vh] bg-[#0A0A0A] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getColorClasses(selectedGroup.color)} flex items-center justify-center`}>
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-light text-white">{selectedGroup.name}</h2>
                    <p className="text-sm text-gray-400">{selectedGroup.members} members</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedGroup(null)}
                  className="w-9 h-9 rounded-lg hover:bg-white/5 flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Content Grid */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Postwall */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-white flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-gray-400" />
                        Postwall
                      </h3>
                      <button className="text-xs text-purple-400 hover:text-purple-300">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      {selectedGroup.posts.map(post => (
                        <div key={post.id} className="p-3 rounded-lg bg-white/5 border border-white/5">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-white">{post.author}</span>
                            <span className="text-xs text-gray-500">{post.time}</span>
                          </div>
                          <p className="text-sm text-gray-300">{post.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rooms List */}
                  <div>
                    <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      Available Rooms
                    </h3>
                    <div className="space-y-2">
                      {selectedGroup.rooms.map(room => (
                        <button
                          key={room.id}
                          className="w-full p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors text-left"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-white">{room.name}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              room.type === 'Public' 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-orange-500/20 text-orange-400'
                            }`}>
                              {room.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span>{room.active} present</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Current Users Section */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    Currently Present ({selectedGroup.rooms.reduce((sum, r) => sum + r.active, 0)})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: Math.min(selectedGroup.rooms.reduce((sum, r) => sum + r.active, 0), 20) }).map((_, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs text-white font-medium"
                      >
                        {String.fromCharCode(65 + i)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}