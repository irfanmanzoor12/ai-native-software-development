import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';
import SignupModal from '../SignupModal';

type ContentMode = 'original' | 'summary' | 'personalized';

interface ContentModeWrapperProps {
  children: React.ReactNode;
  lessonPath?: string; // e.g., "docs/06-AI-Native/35-intro/01-lesson-1.md"
}

export default function ContentModeWrapper({ children, lessonPath }: ContentModeWrapperProps): JSX.Element {
  const [mode, setMode] = useState<ContentMode>('original');
  const [transformedContent, setTransformedContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);
  }, []);

  // Listen for mode changes from ContentModeToggle
  useEffect(() => {
    const handleModeChange = (event: CustomEvent<{ mode: ContentMode }>) => {
      const newMode = event.detail.mode;

      // Check if user needs to sign up
      if ((newMode === 'summary' || newMode === 'personalized') && !isAuthenticated) {
        setShowSignupModal(true);
        setMode('original'); // Keep original mode until signed up
        return;
      }

      setMode(newMode);
    };

    window.addEventListener('contentModeChanged', handleModeChange as EventListener);

    // Load initial mode from localStorage
    const savedMode = localStorage.getItem('contentMode') as ContentMode;
    if (savedMode && ['original', 'summary', 'personalized'].includes(savedMode)) {
      if ((savedMode === 'summary' || savedMode === 'personalized') && !isAuthenticated) {
        setMode('original');
      } else {
        setMode(savedMode);
      }
    }

    return () => {
      window.removeEventListener('contentModeChanged', handleModeChange as EventListener);
    };
  }, [isAuthenticated]);

  // Fetch transformed content when mode changes
  useEffect(() => {
    if (mode === 'original') {
      setTransformedContent(null);
      setError(null);
      return;
    }

    const fetchTransformedContent = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Extract the actual markdown content from the page
        const contentElement = document.querySelector('article.markdown') ||
                              document.querySelector('.markdown') ||
                              document.querySelector('main');

        if (!contentElement) {
          throw new Error('Could not find lesson content on page');
        }

        // Get text content (not HTML) for better AI processing
        const originalContent = contentElement.textContent || contentElement.innerHTML;

        const response = await fetch('/api/content/transform', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mode,
            lessonPath: lessonPath || window.location.pathname,
            originalContent: originalContent.trim(),
            professionalBackground: 'General', // TODO: Get from user profile
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Check if API key is not configured
        if (data.error === 'API_KEY_NOT_CONFIGURED') {
          setError(data.content);
          return;
        }

        if (data.error === 'GENERATION_FAILED') {
          setError(data.content);
          return;
        }

        setTransformedContent(data.content);
      } catch (err) {
        console.error('Failed to fetch transformed content:', err);
        setError(
          `⚠️ ${err.message || 'Failed to generate content. Please try again.'}`
        );
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if we have a lesson path or are on a docs page
    if (lessonPath || window.location.pathname.includes('/docs/')) {
      fetchTransformedContent();
    }
  }, [mode, lessonPath]);

  // Show original content
  if (mode === 'original') {
    return <>{children}</>;
  }

  // Show loading state with animated progress
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinnerWrapper}>
          <div className={styles.spinner}></div>
          <div className={styles.spinnerGlow}></div>
        </div>
        <p className={styles.loadingText}>
          {mode === 'summary'
            ? '⚡ Generating AI summary...'
            : '🎯 Personalizing content for you...'}
        </p>
        <div className={styles.progressBar}>
          <div className={styles.progressFill}></div>
        </div>
        <p className={styles.loadingHint}>
          ✨ This usually takes 2-4 seconds
        </p>
      </div>
    );
  }

  // Show error (with signup prompt)
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <p className={styles.errorMessage}>{error}</p>
          <div className={styles.errorActions}>
            <button
              className={styles.signupButton}
              onClick={() => alert('Signup modal will open here (to be implemented)')}
            >
              🔓 Sign Up Free
            </button>
            <button
              className={styles.backButton}
              onClick={() => {
                setMode('original');
                localStorage.setItem('contentMode', 'original');
                window.dispatchEvent(
                  new CustomEvent('contentModeChanged', {
                    detail: { mode: 'original' },
                  })
                );
              }}
            >
              ← Back to Original
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show transformed content
  if (transformedContent) {
    return (
      <div className={styles.transformedContent}>
        <div className={styles.modeBadge}>
          {mode === 'summary' ? '⚡ Summary Mode' : '🎯 Personalized Mode'}
        </div>
        <div className="markdown">
          <div dangerouslySetInnerHTML={{ __html: transformedContent }} />
        </div>
      </div>
    );
  }

  // Fallback: show original
  return (
    <>
      {children}
      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        mode={mode === 'summary' ? 'summary' : 'personalized'}
      />
    </>
  );
}
