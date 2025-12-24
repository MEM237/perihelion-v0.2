import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Video, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function CreateSessionModal({ onClose, onCreateSession }) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const me = await base44.auth.me();
        setCurrentUser(me);
        
        const allUsers = await base44.asServiceRole.entities.User.list();
        // Filter out current user
        const otherUsers = allUsers.filter(u => u.id !== me.id);
        setUsers(otherUsers);
        setFilteredUsers(otherUsers);
      } catch (error) {
        console.error('Failed to load users:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(user => 
        user.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const handleCreateSession = () => {
    if (selectedUser) {
      onCreateSession(selectedUser.id);
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0A0A0A] border border-white/10 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-light">Start Video Session</h2>
            <p className="text-xs text-gray-500 mt-1">Select a user to invite</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
            />
          </div>
        </div>

        {/* User List */}
        <div className="overflow-y-auto max-h-96">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-purple-500 mx-auto mb-3 animate-spin" />
              <p className="text-sm text-gray-500">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm text-gray-500">No users found</p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    selectedUser?.id === user.id
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-b from-pink-500 via-purple-500 to-cyan-500 flex items-center justify-center text-white font-medium">
                      {(user.display_name || user.full_name || user.email)?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {user.display_name || user.full_name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateSession}
            disabled={!selectedUser}
            className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
          >
            <Video className="w-4 h-4" />
            Start Session
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}