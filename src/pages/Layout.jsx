
import React, { useState } from 'react';
import ChatDock from '@/components/chat/ChatDock';

export default function Layout({ children, currentPageName }) {
  // For now, we assume no active session (remoteHumanCount = 0)
  // This will be enhanced when session context is available
  const remoteHumanCount = 0;
  const sessionId = null;
  const [chatMode, setChatMode] = useState('LARRZ');

  return (
    <div className="relative min-h-screen">
      {children}
      <ChatDock 
        remoteHumanCount={remoteHumanCount} 
        sessionId={sessionId}
        onChatModeChange={setChatMode}
      />
    </div>
  );
}
