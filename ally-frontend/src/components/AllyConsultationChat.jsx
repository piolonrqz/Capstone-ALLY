import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Search } from 'lucide-react';
import { sendConsultationMessage, checkRagHealth } from '../services/allyConsultationService';

const AllyConsultationChat = () => {
  const [messages, setMessages] = useState([]);
  const messageIdCounter = useRef(1);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasChatStarted, setHasChatStarted] = useState(false); // Track if user has sent first message
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

  // Listen for reset-chat event from sidebar
  useEffect(() => {
    const handleResetChat = () => {
      handleNewChat();
    };

    window.addEventListener('reset-chat', handleResetChat);
    
    return () => {
      window.removeEventListener('reset-chat', handleResetChat);
    };
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

    setHasChatStarted(true); // Mark chat as started

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
      setMessages([]);
      messageIdCounter.current = 1;
      setHasChatStarted(false); // Reset to initial centered state
    } catch (error) {
      console.error('Error resetting chat:', error);
    }
  };

  return (
    <>
      {!hasChatStarted ? (
        // INITIAL STATE - Before first message (centered)
        <div className="flex flex-col items-center justify-center min-h-[calc(90vh-64px)] px-4">
          <h1 className="text-4xl font-semibold mb-8 text-center text-gray-800">
            How can <span className="text-blue-600">ALLY</span> help you today?
          </h1>
          
          <div className="w-full max-w-2xl">
            <div className="flex items-center gap-3 bg-white border-2 border-gray-300 rounded-full px-6 py-2 shadow-lg hover:shadow-xl transition-shadow">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask any legal question here..."
                className="flex-1 outline-none text-base bg-transparent"
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                disabled={inputMessage.trim() === '' || isTyping}
                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        // ACTIVE CHAT STATE - After first message (clean, minimal design)
        <div className="w-full min-h-[calc(100vh-64px)] flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-8 max-w-4xl mx-auto w-full">
            <div className="flex flex-col justify-end min-h-full space-y-6">
              {messages.map((message) => (
                <div key={message.id}>
                  {/* Main Message */}
                  <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-2xl px-5 py-3 rounded-3xl ${
                      message.sender === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                    </div>
                  </div>

                  {/* Display Relevant Cases if RAG was used */}
                  {message.sender === 'ai' && message.ragEnabled && (
                    <div className="mt-3 ml-0">
                      {message.relevantCases && message.relevantCases.length > 0 ? (
                        // Show cases if found above threshold
                        <div className="max-w-2xl p-4 bg-blue-50 rounded-2xl">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-semibold text-blue-800 flex items-center gap-1">
                              <Search className="w-3 h-3" />
                              Found {message.caseCount} Relevant Case{message.caseCount > 1 ? 's' : ''}
                            </h4>
                            {message.confidence && message.confidence !== 'Low relevance' && (
                              <span className="text-xs text-blue-700 font-medium">
                                ✓ {message.confidence}
                              </span>
                            )}
                          </div>
                          <div className="space-y-2">
                            {message.relevantCases.map((legalCase, idx) => (
                              <div key={idx} className="p-3 bg-white rounded-xl">
                                <p className="text-xs font-semibold text-gray-800">
                                  {idx + 1}. {legalCase.title}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  Relevance: {legalCase.score?.toFixed(1)}%
                                </p>
                                {legalCase.citation && (
                                  <p className="text-xs text-gray-500 mt-1 italic">
                                    {legalCase.citation}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : message.confidence === 'Low relevance' || message.caseCount === 0 ? (
                        // Show "no relevant cases" message
                        <div className="max-w-2xl p-4 bg-red-50 rounded-2xl">
                          <div className="flex items-center gap-2 mb-2">
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
                  <div className="px-5 py-3 bg-gray-100 rounded-3xl">
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
          </div>

          {/* Input Area - Fixed at bottom */}
          <div className="bg-white border-t border-gray-200">
            <div className="max-w-4xl mx-auto px-4 py-4">
              {/* RAG Toggle Button */}
              <div className="mb-3 flex items-center justify-between">
                <button
                  onClick={() => setUseRAG(!useRAG)}
                  disabled={!ragAvailable}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    useRAG 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={!ragAvailable ? 'RAG service unavailable' : 'Toggle case search'}
                >
                  <Search className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {useRAG ? '🔍 Case Search: ON' : 'Search for Relevant Cases'}
                  </span>
                </button>
                {!ragAvailable && (
                  <span className="text-xs text-red-500">⚠️ Search unavailable</span>
                )}
              </div>

              {/* Input Row */}
              <div className="flex items-center gap-3 bg-white border border-gray-300 rounded-full px-4 py-2 shadow-sm">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask any legal question here..."
                  className="flex-1 outline-none text-sm bg-transparent"
                  disabled={isTyping}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={inputMessage.trim() === '' || isTyping}
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* Disclaimer */}
              <p className="mt-3 text-xs text-center text-gray-500">
                AI-generated insights are not a substitute for professional legal advice and may be inaccurate. Always confirm details with a qualified lawyer.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AllyConsultationChat;