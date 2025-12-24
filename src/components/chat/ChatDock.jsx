import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, ChevronDown, ChevronUp, Bot, Users, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ChatDock({ remoteHumanCount = 0, sessionId = null, onChatModeChange }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [larrzThreadId, setLarrzThreadId] = useState(null);
  const [roomThreadId, setRoomThreadId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [lastMode, setLastMode] = useState(null);
  const messagesEndRef = useRef(null);

  // Determine chat mode
  const chatMode = remoteHumanCount >= 1 ? 'ROOM' : 'LARRZ';

  useEffect(() => {
    // Load persisted LARRZ thread ID from user profile
    const loadThreadId = async () => {
      try {
        const user = await base44.auth.me();
        if (user.larrz_thread_id) {
          setLarrzThreadId(user.larrz_thread_id);
        }
      } catch (err) {
        console.error('Failed to load thread ID:', err);
      }
    };

    loadThreadId();
  }, []);

  useEffect(() => {
    // Handle mode switching
    if (lastMode && lastMode !== chatMode) {
      const modeSwitchMessage = {
        type: 'system',
        content: chatMode === 'LARRZ' 
          ? '🤖 Switched to LARRZ mode - chatting with AI assistant'
          : '👥 Switched to ROOM mode - chatting with humans in session',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, modeSwitchMessage]);
    }
    setLastMode(chatMode);
    
    // Notify parent of chat mode changes
    if (onChatModeChange) {
      onChatModeChange(chatMode);
    }
  }, [chatMode, onChatModeChange]);

  useEffect(() => {
    // Update unread count when collapsed and new messages arrive
    if (!isExpanded && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role !== 'user') {
        setUnreadCount(prev => prev + 1);
      }
    }
  }, [messages, isExpanded]);

  useEffect(() => {
    // Clear unread when expanded
    if (isExpanded) {
      setUnreadCount(0);
    }
  }, [isExpanded]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (chatMode === 'LARRZ') {
        await handleLarrzMessage(userMessage);
      } else {
        await handleRoomMessage(userMessage);
      }
    } catch (err) {
      console.error('Send message error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Failed to send message. Please try again.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLarrzMessage = async (userMessage) => {
    // Create conversation if needed
    let threadId = larrzThreadId;
    
    if (!threadId) {
      const conversation = await base44.agents.createConversation({
        agent_name: 'larrz',
        metadata: { name: 'LARRZ Chat', type: 'dock' }
      });
      threadId = conversation.id;
      setLarrzThreadId(threadId);
      
      // Persist thread ID
      try {
        await base44.auth.updateMe({ larrz_thread_id: threadId });
      } catch (err) {
        console.error('Failed to persist thread ID:', err);
      }
    }

    // Get conversation
    const conversation = await base44.agents.getConversation(threadId);

    // Add message and get response
    await base44.agents.addMessage(conversation, {
      role: 'user',
      content: userMessage.content
    });

    // Subscribe to updates
    const unsubscribe = base44.agents.subscribeToConversation(threadId, (data) => {
      const lastMessage = data.messages[data.messages.length - 1];
      if (lastMessage && lastMessage.role === 'assistant') {
        setMessages(prev => {
          const existing = prev.find(m => m.id === lastMessage.id);
          if (existing) {
            return prev.map(m => m.id === lastMessage.id ? {
              ...lastMessage,
              timestamp: new Date().toISOString()
            } : m);
          }
          return [...prev, {
            ...lastMessage,
            timestamp: new Date().toISOString()
          }];
        });
      }
    });

    // Cleanup after a delay
    setTimeout(() => unsubscribe(), 30000);
  };

  const handleRoomMessage = async (userMessage) => {
    // For room messages, we'd integrate with room/session chat system
    // For now, just echo back (placeholder for real room chat implementation)
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `[Room chat not fully implemented - received: "${userMessage.content}"]`,
      timestamp: new Date().toISOString()
    }]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <motion.div
      initial={false}
      animate={{
        height: isExpanded ? 480 : 56,
        width: isExpanded ? 380 : 180
      }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed bottom-6 right-6 bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-40 flex flex-col"
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-4 border-b border-white/10 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          {chatMode === 'LARRZ' ? (
            <Bot className="w-4 h-4 text-purple-400" />
          ) : (
            <Users className="w-4 h-4 text-blue-400" />
          )}
          <span className="text-sm font-medium text-white">{chatMode}</span>
          {unreadCount > 0 && !isExpanded && (
            <span className="ml-1 px-1.5 py-0.5 bg-purple-600 text-white text-xs rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Messages */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto p-4 space-y-3"
          >
            {messages.length === 0 && (
              <div className="text-center py-8">
                {chatMode === 'LARRZ' ? (
                  <>
                    <Bot className="w-10 h-10 text-purple-500 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Chat with LARRZ AI assistant</p>
                  </>
                ) : (
                  <>
                    <Users className="w-10 h-10 text-blue-500 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Room chat with humans</p>
                  </>
                )}
              </div>
            )}

            {messages.map((msg, idx) => {
              if (msg.type === 'system') {
                return (
                  <div key={idx} className="text-center py-2">
                    <div className="inline-block px-3 py-1 rounded-full bg-white/5 text-xs text-gray-400">
                      {msg.content}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id || idx}
                  className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/5 text-gray-200 border border-white/10'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-white">U</span>
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3 h-3 text-white" />
                </div>
                <div className="px-3 py-2 rounded-2xl bg-white/5 border border-white/10">
                  <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Composer */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="border-t border-white/10 p-3"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                placeholder={`Message ${chatMode === 'LARRZ' ? 'LARRZ' : 'room'}...`}
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 disabled:opacity-50 text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <Send className="w-4 h-4 text-white" />
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}