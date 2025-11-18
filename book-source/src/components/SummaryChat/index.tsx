import React, { useState, useEffect, useRef } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { BOOK_STRUCTURE } from '@/utils/bookStructure';
import styles from './styles.module.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface SummaryChatProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'summary' | 'personalized';
}

export default function SummaryChat({ isOpen, onClose, mode }: SummaryChatProps): JSX.Element | null {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from localStorage
  useEffect(() => {
    if (isOpen) {
      const cacheKey = `${mode}Chat_history`;
      const saved = localStorage.getItem(cacheKey);
      if (saved) {
        try {
          setMessages(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to load chat history:', e);
        }
      } else {
        // Welcome message
        const welcome: Message = {
          id: 'welcome',
          role: 'assistant',
          content: mode === 'summary'
            ? `👋 **Welcome to Summary Mode!**

Ask me to summarize any part, chapter, or lesson from the book.

**Examples:**
- "Summarize Part 1"
- "Give me summary of Chapter 3"
- "What's in Chapter 1, Lesson 2?"
- "Summarize the AI Development Revolution chapter"

I'll give you concise summaries of the content!`
            : `👋 **Welcome to Personalized Mode!**

Ask me about any part, chapter, or lesson - I'll explain it in a way that fits your professional background.

**Examples:**
- "Explain Part 1 for my work"
- "How does Chapter 3 apply to accounting?"
- "Simplify Lesson 5 for a beginner"

Your background: **${localStorage.getItem('professionalBackground') || 'General'}**`,
          timestamp: Date.now()
        };
        setMessages([welcome]);
      }
    }
  }, [isOpen, mode]);

  // Save chat history
  useEffect(() => {
    if (messages.length > 0 && isOpen) {
      const cacheKey = `${mode}Chat_history`;
      localStorage.setItem(cacheKey, JSON.stringify(messages));
    }
  }, [messages, mode, isOpen]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const parseQuery = (query: string) => {
    const lowerQuery = query.toLowerCase();

    // Extract part number
    const partMatch = lowerQuery.match(/part\s*(\d+)/i);
    const partNum = partMatch ? parseInt(partMatch[1]) : null;

    // Extract chapter number
    const chapterMatch = lowerQuery.match(/chapter\s*(\d+)/i);
    const chapterNum = chapterMatch ? parseInt(chapterMatch[1]) : null;

    // Extract lesson number
    const lessonMatch = lowerQuery.match(/lesson\s*(\d+)/i);
    const lessonNum = lessonMatch ? parseInt(lessonMatch[1]) : null;

    return { partNum, chapterNum, lessonNum };
  };

  const getContentPath = (partNum: number | null, chapterNum: number | null, lessonNum: number | null) => {
    // Find matching content in BOOK_STRUCTURE
    if (partNum) {
      const part = BOOK_STRUCTURE.parts.find(p => p.number === partNum);
      if (!part) return null;

      if (chapterNum) {
        const chapter = part.chapters.find(c => c.number === chapterNum);
        if (!chapter) return null;

        if (lessonNum) {
          const lesson = chapter.lessons[lessonNum - 1];
          return lesson ? lesson.path : null;
        }

        // Return first lesson of chapter as representative
        return chapter.lessons[0]?.path || null;
      }

      // Return first lesson of first chapter as representative of part
      return part.chapters[0]?.lessons[0]?.path || null;
    }

    return null;
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Parse the query
      const { partNum, chapterNum, lessonNum } = parseQuery(userMessage.content);

      // Build context for AI
      let contextInfo = '';
      if (partNum) {
        const part = BOOK_STRUCTURE.parts.find(p => p.number === partNum);
        if (part) {
          contextInfo = `User asking about: Part ${partNum} - ${part.title}\n`;

          if (chapterNum) {
            const chapter = part.chapters.find(c => c.number === chapterNum);
            if (chapter) {
              contextInfo += `Chapter ${chapterNum} - ${chapter.title}\n`;
              if (lessonNum && chapter.lessons[lessonNum - 1]) {
                contextInfo += `Lesson ${lessonNum} - ${chapter.lessons[lessonNum - 1].title}\n`;
              }
            }
          }
        }
      }

      // Fetch content if specific path found
      let lessonContent = '';
      const contentPath = getContentPath(partNum, chapterNum, lessonNum);
      if (contentPath) {
        try {
          const response = await fetch(contentPath);
          if (response.ok) {
            lessonContent = await response.text();
          }
        } catch (e) {
          console.error('Failed to fetch lesson content:', e);
        }
      }

      // Call AI API with rich user profile
      const userName = localStorage.getItem('userName') || 'there';
      const professionalBg = localStorage.getItem('professionalBackground') || 'General';
      const experienceLevel = localStorage.getItem('experienceLevel') || 'Beginner';
      const learningGoal = localStorage.getItem('learningGoal') || 'Learn AI development';
      const interests = JSON.parse(localStorage.getItem('interests') || '[]');

      const systemPrompt = mode === 'summary'
        ? `You are a helpful AI assistant that provides CONCISE summaries of book content.
User is asking about the book "AI Native Software Development".
${contextInfo}
${lessonContent ? `\nLesson content:\n${lessonContent.substring(0, 2000)}` : ''}

Provide a BRIEF, clear summary (2-3 paragraphs MAX). Be fast and concise.`
        : `You are a helpful AI assistant that personalizes explanations based on user profile.

**USER PROFILE:**
- Name: ${userName}
- Background: ${professionalBg}
- Experience: ${experienceLevel}
- Goal: ${learningGoal}
- Interests: ${interests.join(', ') || 'General topics'}

User is asking about: "AI Native Software Development"
${contextInfo}
${lessonContent ? `\nLesson content:\n${lessonContent.substring(0, 2000)}` : ''}

Adapt explanation to their ${experienceLevel} level and ${professionalBg} background.
Use examples relevant to their goal: "${learningGoal}".
Be CONCISE (2-3 paragraphs MAX). Make it relatable and actionable.`;

      // Route to different API endpoints based on mode
      const apiEndpoint = mode === 'summary'
        ? '/api/query/chat-summary'  // Groq (fast)
        : '/api/query/chat-personalized';  // Gemini (quality)

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `${systemPrompt}\n\nUser question: ${userMessage.content}`,
          pageContext: contextInfo,
          conversationHistory: messages.slice(-3).map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      const data = await response.json();

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.response || data.error || 'Sorry, I encountered an error.',
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '⚠️ Failed to get response. Please try again.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    const cacheKey = `${mode}Chat_history`;
    localStorage.removeItem(cacheKey);
    setMessages([]);
  };

  if (!isOpen) return null;

  const modeIcon = mode === 'summary' ? '⚡' : '🎯';
  const modeTitle = mode === 'summary' ? 'Summary Chat' : 'Personalized Chat';

  return (
    <BrowserOnly>
      {() => (
        <div className={styles.overlay} onClick={onClose}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerInfo}>
                <h2 className={styles.title}>{modeIcon} {modeTitle}</h2>
                <p className={styles.subtitle}>
                  {mode === 'summary'
                    ? 'Ask me to summarize any part, chapter, or lesson'
                    : `Personalized for ${localStorage.getItem('professionalBackground') || 'you'}`
                  }
                </p>
              </div>
              <div className={styles.headerActions}>
                <button
                  className={styles.clearButton}
                  onClick={clearChat}
                  title="Clear chat"
                >
                  🗑️
                </button>
                <button
                  className={styles.closeButton}
                  onClick={onClose}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className={styles.messagesContainer}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`${styles.message} ${styles[message.role]}`}
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

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={styles.inputContainer}>
              <textarea
                className={styles.input}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about any part, chapter, or lesson..."
                rows={2}
                disabled={isLoading}
              />
              <button
                className={styles.sendButton}
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim()}
              >
                {isLoading ? '⏳' : '🚀'}
              </button>
            </div>

            {/* Quick suggestions */}
            <div className={styles.suggestions}>
              <button onClick={() => setInputValue('Summarize Part 1')}>
                📚 Part 1
              </button>
              <button onClick={() => setInputValue('Summarize Chapter 1')}>
                📖 Chapter 1
              </button>
              <button onClick={() => setInputValue('What is this book about?')}>
                ❓ About this book
              </button>
            </div>
          </div>
        </div>
      )}
    </BrowserOnly>
  );
}
