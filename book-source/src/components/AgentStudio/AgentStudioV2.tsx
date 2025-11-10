/**
 * Agent Studio V2 - Professional AI Learning Assistant
 *
 * Enhanced with react-chat-elements for professional visual polish
 * Features: Beautiful message bubbles, typing indicators, smooth animations
 */

import React, { useState, useEffect, useRef } from 'react';
import { MessageBox, Input, Button as ChatButton, Avatar } from 'react-chat-elements';
import 'react-chat-elements/dist/main.css';
import './AgentStudioV2.css';

// Agent types
type AgentType = 'storytelling' | 'coach' | 'image' | 'mindmap' | null;

interface Message {
  id: string;
  position: 'left' | 'right';
  type: 'text';
  text: string;
  date: Date;
  avatar?: string;
  title?: string;
}

interface Agent {
  type: AgentType;
  name: string;
  icon: string;
  avatar: string;
  description: string;
  color: string;
  gradient: string;
}

const AGENTS: Agent[] = [
  {
    type: 'storytelling',
    name: 'Storyteller',
    icon: '📖',
    avatar: '📖',
    description: 'Simplifies concepts through engaging stories and analogies',
    color: '#FF6B6B',
    gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)'
  },
  {
    type: 'coach',
    name: 'The Coach',
    icon: '🎯',
    avatar: '🎯',
    description: 'Provides guidance, encouragement, and learning strategies',
    color: '#4ECDC4',
    gradient: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)'
  },
  {
    type: 'image',
    name: 'Image Generator',
    icon: '🎨',
    avatar: '🎨',
    description: 'Creates visual aids and diagrams to illustrate concepts',
    color: '#95E1D3',
    gradient: 'linear-gradient(135deg, #95E1D3 0%, #38EF7D 100%)'
  },
  {
    type: 'mindmap',
    name: 'Mind Mapper',
    icon: '🧠',
    avatar: '🧠',
    description: 'Visualizes relationships and concept hierarchies',
    color: '#F38181',
    gradient: 'linear-gradient(135deg, #F38181 0%, #FCE38A 100%)'
  }
];

export default function AgentStudioV2() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentType>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [pageContext, setPageContext] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<any>(null);

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
        position: 'left',
        type: 'text',
        text: getWelcomeMessage(agentType),
        date: new Date(),
        avatar: agent.avatar,
        title: agent.name
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
    const agent = AGENTS.find(a => a.type === selectedAgent);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      position: 'right',
      type: 'text',
      text: userInput,
      date: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Import Gemini dynamically
      const { generateAgentResponse: callGemini } = await import('@/utils/gemini');

      const history = messages.map(msg => ({
        role: msg.position === 'right' ? 'user' : 'agent',
        content: msg.text
      }));

      const response = await callGemini(selectedAgent, userInput, pageContext, history);

      setIsTyping(false);

      // Add agent response
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        position: 'left',
        type: 'text',
        text: response,
        date: new Date(),
        avatar: agent?.avatar,
        title: agent?.name
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      setIsTyping(false);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        position: 'left',
        type: 'text',
        text: `⚠️ Sorry, I encountered an error: ${error.message}`,
        date: new Date(),
        avatar: agent?.avatar,
        title: agent?.name
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const currentAgent = selectedAgent ? AGENTS.find(a => a.type === selectedAgent) : null;

  return (
    <>
      {/* Professional Floating Button */}
      <div className="agent-studio-fab-container">
        <button
          className="agent-studio-fab"
          onClick={toggleChat}
          aria-label="Open Agent Studio"
        >
          <div className="fab-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
              <path d="M8.5 10C9.05228 10 9.5 9.55228 9.5 9C9.5 8.44772 9.05228 8 8.5 8C7.94772 8 7.5 8.44772 7.5 9C7.5 9.55228 7.94772 10 8.5 10Z" fill="currentColor"/>
              <path d="M15.5 10C16.0523 10 16.5 9.55228 16.5 9C16.5 8.44772 16.0523 8 15.5 8C14.9477 8 14.5 8.44772 14.5 9C14.5 9.55228 14.9477 10 15.5 10Z" fill="currentColor"/>
              <path d="M12 17.5C14.33 17.5 16.32 16.04 17.11 14H6.89C7.68 16.04 9.67 17.5 12 17.5Z" fill="currentColor"/>
            </svg>
          </div>
          <div className="fab-pulse"></div>
        </button>
        {!isOpen && (
          <div className="fab-tooltip">
            <span className="fab-tooltip-text">Agent Studio</span>
            <div className="fab-tooltip-subtext">AI Learning Assistant</div>
          </div>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="agent-studio-window">
          {/* Header */}
          <div className="studio-header">
            <div className="header-content">
              <div className="header-icon-wrapper">
                <div className="header-icon-glow"></div>
                <span className="header-icon">🤖</span>
              </div>
              <div className="header-text">
                <h3>Agent Studio</h3>
                <p>Your AI Learning Companion</p>
              </div>
            </div>
            <button
              className="close-btn"
              onClick={toggleChat}
              aria-label="Close"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="studio-content">
            {!selectedAgent ? (
              /* Agent Selection */
              <div className="agent-selection-modern">
                <p className="selection-title">Choose your AI assistant</p>
                <div className="agents-grid-modern">
                  {AGENTS.map(agent => (
                    <button
                      key={agent.type}
                      className="agent-card-modern"
                      onClick={() => handleAgentSelect(agent.type)}
                      style={{ '--agent-color': agent.color, '--agent-gradient': agent.gradient } as any}
                    >
                      <div className="agent-card-glow"></div>
                      <div className="agent-card-icon">{agent.icon}</div>
                      <h4>{agent.name}</h4>
                      <p>{agent.description}</p>
                      <div className="agent-card-arrow">→</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Chat Interface */
              <>
                {/* Current Agent Bar */}
                <div className="current-agent-bar" style={{ background: currentAgent?.gradient }}>
                  <button
                    className="back-btn"
                    onClick={() => {
                      setSelectedAgent(null);
                      setMessages([]);
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                  <span className="current-agent-avatar">{currentAgent?.avatar}</span>
                  <div>
                    <div className="current-agent-name">{currentAgent?.name}</div>
                    <div className="current-agent-status">Online</div>
                  </div>
                </div>

                {/* Messages */}
                <div className="messages-area">
                  {messages.map(message => (
                    <div key={message.id} className="message-wrapper">
                      <MessageBox
                        position={message.position}
                        type={message.type}
                        text={message.text}
                        date={message.date}
                        avatar={message.avatar}
                        title={message.title}
                        titleColor={currentAgent?.color}
                        className="custom-message-box"
                      />
                    </div>
                  ))}
                  {isTyping && (
                    <div className="typing-indicator">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <span className="typing-text">{currentAgent?.name} is thinking...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="input-area">
                  <Input
                    ref={inputRef}
                    placeholder={`Ask ${currentAgent?.name}...`}
                    value={inputValue}
                    onChange={(e: any) => setInputValue(e.target.value)}
                    onKeyPress={(e: any) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    multiline={true}
                    maxHeight={120}
                    className="custom-input"
                    rightButtons={
                      <button
                        className="send-btn"
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim()}
                      >
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    }
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
