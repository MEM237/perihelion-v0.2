import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Trash2, User, Bot, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AssistantPanel({ onClose, identityState, user, policy }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Context data
  const context = {
    identityState: identityState || 'anonymous',
    roomPath: 'Global Commons > Creative Vanguard > Prototype Lab',
    aos: 'balanced',
    fx: policy?.defaultFx || 'authentic',
    displayName: user?.display_name || user?.full_name || 'User',
    profileMatrix: policy?.paraMetrics || {},
    trustLevel: policy?.trustLevel || 'standard'
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const handleClear = () => {
    setMessages([]);
    setStreamingContent('');
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsStreaming(true);
    setStreamingContent('');

    try {
      abortControllerRef.current = new AbortController();

      const response = await base44.functions.invoke('assistantRespond', {
        messages: newMessages,
        context
      });

      // Check if response is successful
      if (response.status !== 200) {
        throw new Error('Failed to get response from assistant');
      }

      // Parse SSE stream
      const reader = response.data.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            try {
              const parsed = JSON.parse(data);
              
              if (parsed.done) {
                // Finalize message
                setMessages(prev => [...prev, { role: 'assistant', content: assistantContent }]);
                setStreamingContent('');
                setIsStreaming(false);
                return;
              }

              if (parsed.content) {
                assistantContent += parsed.content;
                setStreamingContent(assistantContent);
              }

              if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE data:', parseError);
            }
          }
        }
      }

    } catch (error) {
      console.error('Assistant error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ Error: ${error.message || 'Failed to get response. Please try again.'}`
      }]);
      setStreamingContent('');
      setIsStreaming(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-end p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        className="w-full max-w-lg h-full bg-[#0A0A0A] rounded-2xl border border-white/10 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-b from-pink-500 via-yellow-400 to-cyan-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-light text-white">Assistant</h2>
              <p className="text-xs text-gray-500">Perihelion Guide</p>
            </div>
          </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Context Bar */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-white/5 border border-white/5">
              <span className="text-gray-500">Identity:</span>
              <span className="ml-1 text-white font-medium capitalize">{context.identityState}</span>
            </div>
            <div className="p-2 rounded-lg bg-white/5 border border-white/5">
              <span className="text-gray-500">Trust:</span>
              <span className="ml-1 text-white font-medium capitalize">{context.trustLevel}</span>
            </div>
            <div className="p-2 rounded-lg bg-white/5 border border-white/5">
              <span className="text-gray-500">FX:</span>
              <span className="ml-1 text-white font-medium capitalize">{context.fx}</span>
            </div>
            <div className="p-2 rounded-lg bg-white/5 border border-white/5">
              <span className="text-gray-500">Display:</span>
              <span className="ml-1 text-white text-[10px] truncate">{context.displayName}</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && !streamingContent && (
            <div className="text-center py-12">
              <Bot className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Ask me about Perihelion</p>
              <p className="text-gray-600 text-xs mt-2">Identity tiers, rooms, AOS, or features</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-pink-500 via-yellow-400 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-gray-200 border border-white/10'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {/* Streaming message */}
          {isStreaming && streamingContent && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-pink-500 via-yellow-400 to-cyan-500 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="max-w-[80%] p-3 rounded-2xl bg-white/5 text-gray-200 border border-white/10">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {streamingContent}
                  <span className="inline-block w-1 h-4 bg-purple-500 ml-1 animate-pulse" />
                </p>
              </div>
            </div>
          )}

          {/* Loading indicator when streaming starts */}
          {isStreaming && !streamingContent && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-pink-500 via-yellow-400 to-cyan-500 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10">
          <div className="flex gap-2 mb-2">
            <button
              onClick={handleClear}
              disabled={messages.length === 0 || isStreaming}
              className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs text-gray-400 flex items-center gap-2"
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isStreaming}
              placeholder="Ask about Perihelion..."
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 disabled:opacity-50 text-sm"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              className="px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isStreaming ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Send className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}