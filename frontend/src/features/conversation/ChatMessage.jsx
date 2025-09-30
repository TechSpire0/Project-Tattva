import React from 'react';

// --- Icon Replacements (Replicating functionality with SVG) ---
const Bot = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3 3 3 0 0 0 3-3V5a3 3 0 0 0-3-3z" /><path d="M16 11h-8" /><path d="M16 15h-8" /><path d="M16 7h-8" /></svg>;
const User = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
// --- End Icon Replacements ---

/**
 * Component to display a single chat message (User, AI, or loading).
 * @param {object} message - { sender: 'user' | 'ai', text: string, isLoading: boolean }
 */
export default function ChatMessage({ message }) {
  const iconClass = "h-4 w-4 text-white";
  const avatarClass = "w-8 h-8 rounded-full flex items-center justify-center shadow-lg";

  const isUser = message.sender === 'user';
  const isAiThinking = message.isLoading;

  const messageContent = (
    <div className={`rounded-lg p-3 backdrop-blur-sm ${isUser
      ? 'bg-purple-300/10 border border-purple-300/30 text-white'
      : 'bg-purple-300/10 border border-purple-300/30 text-gray-300'
      }`}>
      {isAiThinking ? (
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-bounce delay-100"></div>
          <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-bounce delay-200"></div>
        </div>
      ) : (
        <>
          <p className="text-sm leading-relaxed">{message.text}</p>
        </>
      )}
    </div>
  );

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-start space-x-2 max-w-2xl ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        <div className={`
					${avatarClass} 
					${isUser ? 'bg-gradient-to-r from-purple-400 to-purple-500' : 'bg-gradient-to-r from-purple-400 to-pink-500'}
				`}>
          {isUser ? <User className={iconClass} /> : <Bot className={iconClass} />}
        </div>
        {messageContent}
      </div>
    </div>
  );
}
