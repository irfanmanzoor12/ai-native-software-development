import React, { useState, useEffect, useRef } from 'react';
import { extractPageContext, formatContextForAI, getBreadcrumb } from '@/utils/pageContext';
import styles from './styles.module.css';
import BrowserOnly from '@docusaurus/BrowserOnly';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface RateLimitState {
  count: number;
  resetAt: number;
}

const MAX_REQUESTS_PER_HOUR = 10;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

export default function FloatingChatWidget(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentContext, setCurrentContext] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Rate limiting state
  const [rateLimit, setRateLimit] = useState<RateLimitState>(() => {
    const saved = localStorage.getItem('chatRateLimit');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Reset if window expired
      if (Date.now() > parsed.resetAt) {
        return { count: 0, resetAt: Date.now() + RATE_LIMIT_WINDOW };
      }
      return parsed;
    }
    return { count: 0, resetAt: Date.now() + RATE_LIMIT_WINDOW };
  });

  // Load conversation history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('chatHistory');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(parsed);
      } catch (e) {
        console.error('Failed to load chat history:', e);
      }
    }

    // Add welcome message if no history
    if (!saved || JSON.parse(saved).length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `👋 Hi! I'm your AI learning assistant for **AI Native Software Development**.

Ask me anything about:
- Specific parts, chapters, or lessons
- Specification-first development
- Python & TypeScript concepts
- AI co-learning strategies

I can see which lesson you're on and provide context-aware help!`,
        timestamp: Date.now(),
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  // Save conversation history to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(messages));
    }
  }, [messages]);

  // Update page context when opened
  useEffect(() => {
    if (isOpen) {
      const context = extractPageContext();
      setCurrentContext(formatContextForAI(context));
    }
  }, [isOpen]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check rate limit
  const checkRateLimit = (): boolean => {
    const now = Date.now();

    // Reset if window expired
    if (now > rateLimit.resetAt) {
      const newState = { count: 0, resetAt: now + RATE_LIMIT_WINDOW };
      setRateLimit(newState);
      localStorage.setItem('chatRateLimit', JSON.stringify(newState));
      return true;
    }

    // Check if under limit
    if (rateLimit.count >= MAX_REQUESTS_PER_HOUR) {
      const minutesLeft = Math.ceil((rateLimit.resetAt - now) / 60000);
      setError(`⏳ Rate limit reached. You can send ${MAX_REQUESTS_PER_HOUR} messages per hour. Try again in ${minutesLeft} minutes.`);
      return false;
    }

    return true;
  };

  // Increment rate limit counter
  const incrementRateLimit = () => {
    const newState = { ...rateLimit, count: rateLimit.count + 1 };
    setRateLimit(newState);
    localStorage.setItem('chatRateLimit', JSON.stringify(newState));
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Check rate limit
    if (!checkRateLimit()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      // Increment rate limit
      incrementRateLimit();

      const response = await fetch('/api/query/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          pageContext: currentContext,
          conversationHistory: messages.slice(-5).map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.response || 'Failed to get response');
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      setError(err.message || 'Failed to send message. Please try again.');

      // Add error message to chat
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ ${err.message || 'Failed to send message. Please try again.'}`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem('chatHistory');
    setError(null);
  };

  return (
    <BrowserOnly>
      {() => {
        const contextBreadcrumb = getBreadcrumb(extractPageContext());
        return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          className={styles.floatingButton}
          onClick={() => setIsOpen(true)}
          aria-label="Open AI chat assistant"
        >
          <span className={styles.icon}>💬</span>
          <span className={styles.pulse}></span>
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div className={styles.chatWidget}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerInfo}>
              <h3 className={styles.title}>🤖 AI Learning Assistant</h3>
              <p className={styles.context}>📍 {contextBreadcrumb}</p>
            </div>
            <div className={styles.headerActions}>
              <button
                className={styles.clearButton}
                onClick={clearHistory}
                aria-label="Clear chat history"
                title="Clear history"
              >
                🗑️
              </button>
              <button
                className={styles.closeButton}
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className={styles.messagesContainer}>
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`${styles.message} ${styles[message.role]}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className={styles.messageContent}>
                  {message.content}
                </div>
                <div className={styles.messageTime}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className={`${styles.message} ${styles.assistant}`}>
                <div className={styles.typingIndicator}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={styles.inputContainer}>
            <textarea
              className={styles.input}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about this lesson or any topic..."
              rows={1}
              disabled={isLoading}
            />
            <button
              className={styles.sendButton}
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              aria-label="Send message"
            >
              {isLoading ? '⏳' : '🚀'}
            </button>
          </div>

          {/* Rate limit indicator */}
          <div className={styles.rateLimitIndicator}>
            {rateLimit.count}/{MAX_REQUESTS_PER_HOUR} messages used this hour
          </div>
        </div>
      )}
    </>
        );
      }}
    </BrowserOnly>
  );
}
