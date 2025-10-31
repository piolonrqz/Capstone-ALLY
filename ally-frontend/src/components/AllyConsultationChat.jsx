import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Search } from 'lucide-react';
import { sendConsultationMessage, checkRagHealth } from '../services/allyConsultationService';

const AllyConsultationChat = () => {
  const [messages, setMessages] = useState([
    {
      id: `msg-${Date.now()}-1`,
      text: "Hello! I'm ALLY, your AI legal assistant. I'm here to help answer your legal questions and provide general legal information. What would you like to know about today?",
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const messageIdCounter = useRef(2);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [useRAG, setUseRAG] = useState(false); // NEW: RAG toggle state
  const [ragAvailable, setRagAvailable] = useState(true); // NEW: RAG service status
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // NEW: Check RAG service health on mount
  useEffect(() => {
    const checkRAG = async () => {
      const isHealthy = await checkRagHealth();
      setRagAvailable(isHealthy);
    };
    checkRAG();
  }, []);

  const getAIResponse = async (userMessage) => {
    setIsTyping(true);
    
    try {
      const data = await sendConsultationMessage(userMessage, useRAG);
      
      // data is now always an object with { response, relevantCases, etc. }
      const aiMessage = {
        id: `msg-${Date.now()}-${messageIdCounter.current++}`,
        text: data.response,  // Changed from response.response to data.response
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        relevantCases: data.relevantCases,
        caseCount: data.caseCount,
        confidence: data.confidence,
        ragEnabled: data.ragEnabled
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: `msg-${Date.now()}-${messageIdCounter.current++}`,
        text: "Sorry, I'm having trouble connecting to the legal assistant. Please try again later.",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;

    const userMessage = {
      id: `msg-${Date.now()}-${messageIdCounter.current++}`,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    
    getAIResponse(inputMessage);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewChat = async () => {
    try {
      await fetch((import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080') + '/api/chat/reset', {
        method: 'GET',
      });
      setMessages([
        {
          id: `msg-${Date.now()}-1`,
          text: "Hello! I'm ALLY, your AI legal assistant. I'm here to help answer your legal questions and provide general legal information. What would you like to know about today?",
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      messageIdCounter.current = 2;
    } catch (error) {
      console.error('Error resetting chat:', error);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto overflow-hidden bg-white shadow-lg rounded-xl">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-lg">
              <span className="text-sm font-bold text-white">A</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">ALLY</h3>
              <p className="text-sm text-gray-500">AI Legal Assistant</p>
            </div>
          </div>
          <button 
            className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors" 
            onClick={handleNewChat}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">New Chat</span>
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="p-4 space-y-4 overflow-y-auto h-96 bg-gray-50">
        {messages.map((message) => (
          <div key={message.id}>
            {/* Main Message */}
            <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.sender === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-800 border border-gray-200'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp}
                </p>
              </div>
            </div>

            {/* Display Relevant Cases if RAG was used */}
            {message.sender === 'ai' && message.ragEnabled && (
              <div className="mt-2 ml-2">
                {message.relevantCases && message.relevantCases.length > 0 ? (
                  // Show cases if found above threshold
                  <div className="max-w-md p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-semibold text-yellow-800 flex items-center gap-1">
                        <Search className="w-3 h-3" />
                        Found {message.caseCount} Relevant Case{message.caseCount > 1 ? 's' : ''}
                      </h4>
                      {message.confidence && message.confidence !== 'Low relevance' && (
                        <span className="text-xs text-yellow-700 font-medium">
                          ✓ {message.confidence}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {message.relevantCases.map((legalCase, idx) => (
                        <div key={idx} className="p-2 bg-white rounded border border-yellow-100">
                          <p className="text-xs font-semibold text-gray-800">
                            {idx + 1}. {legalCase.title}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5">
                            Relevance: {legalCase.score?.toFixed(1)}%
                          </p>
                          {legalCase.citation && (
                            <p className="text-xs text-gray-500 mt-0.5 italic">
                              {legalCase.citation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : message.confidence === 'Low relevance' || message.caseCount === 0 ? (
                  // Show "no relevant cases" message
                  <div className="max-w-md p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Search className="w-4 h-4 text-red-600" />
                      <h4 className="text-xs font-semibold text-red-800">
                        No Highly Relevant Cases Found
                      </h4>
                    </div>
                    <p className="text-xs text-red-700 leading-relaxed">
                      The search didn't find cases with high relevance (≥54%) to your question. 
                      <br />
                      <strong>Try:</strong> Providing more specific details, using legal terms, or specifying the area of law.
                    </p>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-xs px-4 py-2 bg-white border border-gray-200 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        {/* NEW: RAG Toggle Button */}
        <div className="mb-2 flex items-center justify-between">
          <button
            onClick={() => setUseRAG(!useRAG)}
            disabled={!ragAvailable}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all ${
              useRAG 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={!ragAvailable ? 'RAG service unavailable' : 'Toggle case search'}
          >
            <Search className="w-4 h-4" />
            <span className="text-sm font-medium">
              {useRAG ? '🔍 Case Search: ON' : 'Search for Relevant Case'}
            </span>
          </button>
          {!ragAvailable && (
            <span className="text-xs text-red-500">⚠️ Search unavailable</span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask any legal question here..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="1"
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={inputMessage.trim() === '' || isTyping}
            className="p-2 text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-4 mt-4 border-t border-gray-200 bg-gray-50">
        <div className="p-3 border border-yellow-200 rounded-lg bg-yellow-50">
          <h4 className="mb-1 text-sm font-semibold text-yellow-800">Important Disclaimer</h4>
          <p className="text-xs text-yellow-700">
            This AI consultation provides general legal information only and does not constitute legal advice. 
            For specific legal matters, please consult with a qualified attorney. Laws may vary and change over time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AllyConsultationChat;