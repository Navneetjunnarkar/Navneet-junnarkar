import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Language } from '../types';
import { getLegalAdvice } from '../services/geminiService';
import { translations } from '../utils/translations';

interface LegalChatProps {
    language: Language;
}

const LegalChat: React.FC<LegalChatProps> = ({ language }) => {
  const t = translations[language];
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: language === 'hi' 
        ? 'नमस्ते! मैं लीगल साथी हूँ। आज मैं आपकी कानूनी पूछताछ में कैसे मदद कर सकता हूँ?'
        : language === 'mr'
        ? 'नमस्ते! मी लिगल साथी आहे. आज मी तुम्हाला कायदेशीर प्रश्नांमध्ये कशी मदत करू शकतो?'
        : 'Namaste! I am Legal Sathi. How can I assist you with your legal queries today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Reset welcome message if language changes significantly if desired, 
  // but usually preserving chat history is better.

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const responseText = await getLegalAdvice(messages, input, language);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-blue-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-500 rounded-full w-10 h-10 flex items-center justify-center">
            <i className="fa-solid fa-robot text-blue-900 text-lg"></i>
          </div>
          <div>
            <h3 className="font-semibold text-lg">{t.aiChat}</h3>
            <p className="text-xs text-blue-200">Always available to help</p>
          </div>
        </div>
        <button 
            onClick={() => setMessages([messages[0]])}
            className="text-blue-200 hover:text-white transition" 
            title="Clear Chat"
        >
            <i className="fa-solid fa-rotate-right"></i>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-blue-800 text-white rounded-tr-none'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>
              <span className={`text-[10px] block mt-2 opacity-70 ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t.chatPlaceholder}
            className="flex-1 px-4 py-3 bg-white border border-slate-300 rounded-full focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-blue-900 hover:bg-blue-800 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-2">
            AI can make mistakes. Please consult a qualified lawyer for serious matters.
        </p>
      </div>
    </div>
  );
};

export default LegalChat;