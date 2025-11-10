/**
 * Agent Studio Pro - Professional AI Learning Assistant
 *
 * Pure React implementation with professional visual polish
 * No external chat libraries - fully custom and optimized
 */

import React, { useState, useEffect, useRef } from 'react';
import './AgentStudioPro.css';

type AgentType = 'storytelling' | 'coach' | 'image' | 'mindmap' | null;

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  agentType?: AgentType;
  timestamp: Date;
}

interface Agent {
  type: AgentType;
  name: string;
  icon: string;
  description: string;
  color: string;
  gradient: string;
}

const AGENTS: Agent[] = [
  {
    type: 'storytelling',
    name: 'Storyteller',
    icon: '📖',
    description: 'Simplifies concepts through engaging stories and analogies',
    color: '#FF6B6B',
    gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)'
  },
  {
    type: 'coach',
    name: 'The Coach',
    icon: '🎯',
    description: 'Provides guidance, encouragement, and learning strategies',
    color: '#4ECDC4',
    gradient: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)'
  },
  {
    type: 'image',
    name: 'Image Generator',
    icon: '🎨',
    description: 'Creates visual aids and diagrams to illustrate concepts',
    color: '#95E1D3',
    gradient: 'linear-gradient(135deg, #95E1D3 0%, #38EF7D 100%)'
  },
  {
    type: 'mindmap',
    name: 'Mind Mapper',
    icon: '🧠',
    description: 'Visualizes relationships and concept hierarchies',
    color: '#F38181',
    gradient: 'linear-gradient(135deg, #F38181 0%, #FCE38A 100%)'
  }
];

export default function AgentStudioPro() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentType>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [pageContext, setPageContext] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Extract page context
  useEffect(() => {
    const extractPageContext = () => {
      const article = document.querySelector('article');
      if (article) {
        const title = document.querySelector('h1')?.textContent || '';
        const paragraphs = Array.from(article.querySelectorAll('p'))
          .slice(0, 3)
          .map(p => p.textContent)
          .join(' ');
        setPageContext(`Page: ${title}\n\nContext: ${paragraphs.substring(0, 500)}...`);
      }
    };
    extractPageContext();
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleAgentSelect = (agentType: AgentType) => {
    setSelectedAgent(agentType);
    const agent = AGENTS.find(a => a.type === agentType);
    if (agent) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        role: 'agent',
        content: getWelcomeMessage(agentType),
        agentType: agentType,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  };

  const getWelcomeMessage = (agentType: AgentType): string => {
    switch (agentType) {
      case 'storytelling':
        return "Hi! I'm the Storyteller 📖. I'll help you understand difficult concepts through engaging stories and analogies. What would you like me to explain?";
      case 'coach':
        return "Hello! I'm your Coach 🎯. I'm here to guide you, provide encouragement, and help you develop effective learning strategies. How can I support your learning today?";
      case 'image':
        return "Hey! I'm the Image Generator 🎨. I create visual aids and diagrams to help you understand concepts better. What would you like me to visualize?";
      case 'mindmap':
        return "Greetings! I'm the Mind Mapper 🧠. I'll help you see the big picture by mapping out concepts and their relationships. What topic should we map?";
      default:
        return "Hello! How can I assist you today?";
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedAgent) return;

    const userInput = inputValue;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Import Gemini dynamically
      const { generateAgentResponse: callGemini } = await import('@/utils/gemini');

      const history = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await callGemini(selectedAgent, userInput, pageContext, history);

      setIsTyping(false);

      // Add agent response
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: response,
        agentType: selectedAgent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      setIsTyping(false);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: `⚠️ Sorry, I encountered an error: ${error.message}`,
        agentType: selectedAgent,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const currentAgent = selectedAgent ? AGENTS.find(a => a.type === selectedAgent) : null;

  return (
    <>
      {/* Professional Floating Button */}
      <div className="studio-fab-wrapper">
        <button
          className="studio-fab"
          onClick={toggleChat}
          aria-label="Open Agent Studio"
        >
          <div className="fab-icon-pro">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
              <path d="M8.5 10C9.05228 10 9.5 9.55228 9.5 9C9.5 8.44772 9.05228 8 8.5 8C7.94772 8 7.5 8.44772 7.5 9C7.5 9.55228 7.94772 10 8.5 10Z" fill="currentColor"/>
              <path d="M15.5 10C16.0523 10 16.5 9.55228 16.5 9C16.5 8.44772 16.0523 8 15.5 8C14.9477 8 14.5 8.44772 14.5 9C14.5 9.55228 14.9477 10 15.5 10Z" fill="currentColor"/>
              <path d="M12 17.5C14.33 17.5 16.32 16.04 17.11 14H6.89C7.68 16.04 9.67 17.5 12 17.5Z" fill="currentColor"/>
            </svg>
          </div>
          <div className="fab-pulse-ring"></div>
        </button>
        {!isOpen && (
          <div className="fab-label">
            <span className="fab-label-text">Agent Studio</span>
            <div className="fab-label-sub">AI Assistant</div>
          </div>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="studio-window-pro">
          {/* Header */}
          <div className="studio-header-pro">
            <div className="header-content-pro">
              <div className="header-icon-container">
                <div className="header-icon-glow-pro"></div>
                <span className="header-icon-pro">🤖</span>
              </div>
              <div className="header-text-pro">
                <h3>Agent Studio</h3>
                <p>Your AI Learning Companion</p>
              </div>
            </div>
            <button className="close-btn-pro" onClick={toggleChat}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="studio-body-pro">
            {!selectedAgent ? (
              /* Agent Selection */
              <div className="agent-grid-container">
                <p className="agent-grid-title">Choose your AI assistant</p>
                <div className="agent-grid-pro">
                  {AGENTS.map(agent => (
                    <button
                      key={agent.type}
                      className="agent-card-pro"
                      onClick={() => handleAgentSelect(agent.type)}
                      style={
                        {
                          '--card-color': agent.color,
                          '--card-gradient': agent.gradient
                        } as React.CSSProperties
                      }
                    >
                      <div className="card-glow-bg"></div>
                      <div className="card-icon-pro">{agent.icon}</div>
                      <h4>{agent.name}</h4>
                      <p>{agent.description}</p>
                      <div className="card-arrow-pro">→</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Chat Interface */
              <>
                {/* Agent Bar */}
                <div className="agent-bar-pro" style={{ background: currentAgent?.gradient }}>
                  <button
                    className="back-btn-pro"
                    onClick={() => {
                      setSelectedAgent(null);
                      setMessages([]);
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                  <span className="agent-avatar-pro">{currentAgent?.icon}</span>
                  <div>
                    <div className="agent-name-pro">{currentAgent?.name}</div>
                    <div className="agent-status-pro">● Online</div>
                  </div>
                </div>

                {/* Messages */}
                <div className="messages-container-pro">
                  {messages.map(message => (
                    <div key={message.id} className={`message-bubble ${message.role}`}>
                      {message.role === 'agent' && (
                        <div className="message-avatar">{currentAgent?.icon}</div>
                      )}
                      <div className="message-content-pro">
                        <p>{message.content}</p>
                        <span className="message-time-pro">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="typing-box">
                      <div className="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <span className="typing-label">{currentAgent?.name} is thinking...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="input-container-pro">
                  <textarea
                    className="message-input-pro"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Ask ${currentAgent?.name}...`}
                    rows={1}
                  />
                  <button
                    className="send-btn-pro"
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                  >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
