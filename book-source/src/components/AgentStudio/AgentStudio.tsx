/**
 * Agent Studio - AI Learning Assistant
 *
 * A floating chat interface that provides AI-powered learning assistance
 * through specialized sub-agents: Storytelling, Coach, Image Generator, and Mind Mapper.
 *
 * Features:
 * - Floating button (bottom-right corner)
 * - Expandable chat interface
 * - Multiple specialized AI agents
 * - Context-aware responses based on current page content
 */

import React, { useState, useEffect, useRef } from 'react';
import './AgentStudio.css';

// Agent types
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
}

const AGENTS: Agent[] = [
  {
    type: 'storytelling',
    name: 'Storyteller',
    icon: '📖',
    description: 'Simplifies concepts through engaging stories and analogies',
    color: '#FF6B6B'
  },
  {
    type: 'coach',
    name: 'The Coach',
    icon: '🎯',
    description: 'Provides guidance, encouragement, and learning strategies',
    color: '#4ECDC4'
  },
  {
    type: 'image',
    name: 'Image Generator',
    icon: '🎨',
    description: 'Creates visual aids and diagrams to illustrate concepts',
    color: '#95E1D3'
  },
  {
    type: 'mindmap',
    name: 'Mind Mapper',
    icon: '🧠',
    description: 'Visualizes relationships and concept hierarchies',
    color: '#F38181'
  }
];

export default function AgentStudio() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentType>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [pageContext, setPageContext] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Extract page context when component mounts or page changes
  useEffect(() => {
    const extractPageContext = () => {
      const article = document.querySelector('article');
      if (article) {
        // Get page title
        const title = document.querySelector('h1')?.textContent || '';
        // Get first few paragraphs
        const paragraphs = Array.from(article.querySelectorAll('p'))
          .slice(0, 3)
          .map(p => p.textContent)
          .join(' ');

        setPageContext(`Page: ${title}\n\nContext: ${paragraphs.substring(0, 500)}...`);
      }
    };

    extractPageContext();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleAgentSelect = (agentType: AgentType) => {
    setSelectedAgent(agentType);

    // Send welcome message from the agent
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

    // Add "thinking" placeholder
    const thinkingId = (Date.now() + 1).toString();
    const thinkingMessage: Message = {
      id: thinkingId,
      role: 'agent',
      content: '✨ Thinking...',
      agentType: selectedAgent,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, thinkingMessage]);

    try {
      // Call Gemini API
      const agentResponse = await generateAgentResponse(selectedAgent, userInput, pageContext);

      // Replace thinking message with actual response
      setMessages(prev => prev.map(msg =>
        msg.id === thinkingId
          ? { ...msg, content: agentResponse }
          : msg
      ));
    } catch (error) {
      // Replace thinking message with error
      setMessages(prev => prev.map(msg =>
        msg.id === thinkingId
          ? { ...msg, content: `⚠️ Sorry, I encountered an error: ${error.message}` }
          : msg
      ));
    }
  };

  const generateAgentResponse = async (agentType: AgentType, userInput: string, context: string): Promise<string> => {
    // Convert messages to history format
    const history = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    try {
      // Call server-side API endpoint
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentType,
          userMessage: userInput,
          pageContext: context,
          conversationHistory: history
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error calling Agent API:', error);
      return `⚠️ Sorry, I encountered an error. Please try again.\n\nError: ${error.message}`;
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
      {/* Floating Button */}
      <button
        className="agent-studio-button"
        onClick={toggleChat}
        aria-label="Open Agent Studio"
        title="Agent Studio - Your AI Learning Assistant"
      >
        <span className="button-icon">🤖</span>
        <span className="button-label">Agent Studio</span>
      </button>

      {/* Chat Interface */}
      {isOpen && (
        <div className="agent-studio-container">
          <div className="agent-studio-header">
            <div className="header-title">
              <span className="header-icon">🤖</span>
              <h3>Agent Studio</h3>
            </div>
            <button
              className="close-button"
              onClick={toggleChat}
              aria-label="Close Agent Studio"
            >
              ×
            </button>
          </div>

          {/* Agent Selection or Chat View */}
          {!selectedAgent ? (
            <div className="agent-selection">
              <p className="selection-prompt">Choose your AI learning assistant:</p>
              <div className="agents-grid">
                {AGENTS.map(agent => (
                  <button
                    key={agent.type}
                    className="agent-card"
                    onClick={() => handleAgentSelect(agent.type)}
                    style={{ borderColor: agent.color }}
                  >
                    <span className="agent-icon">{agent.icon}</span>
                    <h4>{agent.name}</h4>
                    <p>{agent.description}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header with current agent */}
              <div className="chat-agent-header" style={{ backgroundColor: currentAgent?.color }}>
                <button
                  className="back-button"
                  onClick={() => {
                    setSelectedAgent(null);
                    setMessages([]);
                  }}
                  aria-label="Back to agent selection"
                >
                  ←
                </button>
                <span className="chat-agent-icon">{currentAgent?.icon}</span>
                <span className="chat-agent-name">{currentAgent?.name}</span>
              </div>

              {/* Messages */}
              <div className="messages-container">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`message ${message.role}`}
                  >
                    {message.role === 'agent' && (
                      <span className="message-agent-icon">{currentAgent?.icon}</span>
                    )}
                    <div className="message-content">
                      <p>{message.content}</p>
                      <span className="message-time">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="input-container">
                <textarea
                  className="message-input"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Ask ${currentAgent?.name} anything...`}
                  rows={2}
                />
                <button
                  className="send-button"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  aria-label="Send message"
                >
                  ➤
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
