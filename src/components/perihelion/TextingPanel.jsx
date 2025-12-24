import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, ChevronDown, Plus } from 'lucide-react';

export default function TextingPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([
  { id: 1, name: 'Creative Vanguard', unread: 3, lastMessage: 'Hey, checking in on the prototype...' },
  { id: 2, name: 'Prototype Lab', unread: 0, lastMessage: 'Sounds good! Let\'s sync later.' }]
  );
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState({
    1: [
    { id: 1, sender: 'Alice', text: 'Hey, checking in on the prototype...', time: '2:34 PM' },
    { id: 2, sender: 'me', text: 'Looking good so far!', time: '2:35 PM' }],

    2: [
    { id: 1, sender: 'Bob', text: 'Ready for the demo?', time: '1:20 PM' },
    { id: 2, sender: 'me', text: 'Sounds good! Let\'s sync later.', time: '1:22 PM' }]

  });
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim() || !activeConvo) return;

    const newMessage = {
      id: Date.now(),
      sender: 'me',
      text: input.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    };

    setMessages((prev) => ({
      ...prev,
      [activeConvo]: [...(prev[activeConvo] || []), newMessage]
    }));
    setInput('');
  };

  return (
    <div className="absolute bottom-4 right-4 z-20">
      {/* Floating Button */}
      {!isOpen &&
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setIsOpen(true)} className="bg-gradient-to-b mx-1 my-12 rounded-full w-14 h-14 from-pink-500 via-purple-500 to-cyan-500 hover:opacity-90 shadow-lg flex items-center justify-center relative transition-opacity">


          <MessageSquare className="w-6 h-6 text-white" />
          {conversations.some((c) => c.unread > 0) &&
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
              {conversations.reduce((sum, c) => sum + c.unread, 0)}
            </div>
        }
        </motion.button>
      }

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen &&
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="w-80 h-96 bg-[#0A0A0A] rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">

            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-medium text-white">Messages</h3>
              </div>
              <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center">

                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Conversation List or Active Chat */}
            {!activeConvo ?
          <div className="flex-1 overflow-y-auto">
                {conversations.map((convo) =>
            <button
              key={convo.id}
              onClick={() => setActiveConvo(convo.id)}
              className="w-full p-3 border-b border-white/5 hover:bg-white/5 transition-colors text-left">

                    <div className="flex items-start justify-between mb-1">
                      <span className="text-sm font-medium text-white">{convo.name}</span>
                      {convo.unread > 0 &&
                <span className="px-2 py-0.5 bg-purple-600 rounded-full text-xs text-white">
                          {convo.unread}
                        </span>
                }
                    </div>
                    <p className="text-xs text-gray-400 truncate">{convo.lastMessage}</p>
                  </button>
            )}
              </div> :

          <>
                {/* Active Chat Header */}
                <div className="p-3 border-b border-white/10 flex items-center gap-2 bg-white/5">
                  <button
                onClick={() => setActiveConvo(null)}
                className="text-purple-400 hover:text-purple-300 text-sm">

                    ← Back
                  </button>
                  <span className="text-sm font-medium text-white">
                    {conversations.find((c) => c.id === activeConvo)?.name}
                  </span>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {(messages[activeConvo] || []).map((msg) =>
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>

                      <div
                  className={`max-w-[75%] rounded-lg px-3 py-2 ${
                  msg.sender === 'me' ?
                  'bg-purple-600 text-white' :
                  'bg-white/10 text-gray-200'}`
                  }>

                        {msg.sender !== 'me' &&
                  <p className="text-xs text-gray-400 mb-1">{msg.sender}</p>
                  }
                        <p className="text-sm">{msg.text}</p>
                        <p className="text-xs opacity-60 mt-1">{msg.time}</p>
                      </div>
                    </div>
              )}
                </div>

                {/* Input */}
                <div className="p-3 border-t border-white/10 flex gap-2">
                  <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500/50" />

                  <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="px-3 py-2 rounded-lg bg-gradient-to-b from-pink-500 via-purple-500 to-cyan-500 hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity">

                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </>
          }
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}