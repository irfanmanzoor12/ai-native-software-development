import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';

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

  // Listen for mode changes from ContentModeToggle
  useEffect(() => {
    const handleModeChange = (event: CustomEvent<{ mode: ContentMode }>) => {
      setMode(event.detail.mode);
    };

    window.addEventListener('contentModeChanged', handleModeChange as EventListener);

    // Load initial mode from localStorage
    const savedMode = localStorage.getItem('contentMode') as ContentMode;
    if (savedMode && ['original', 'summary', 'personalized'].includes(savedMode)) {
      setMode(savedMode);
    }

    return () => {
      window.removeEventListener('contentModeChanged', handleModeChange as EventListener);
    };
  }, []);

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
        // TODO: Replace with actual API endpoint
        // For now, this is a placeholder
        const response = await fetch('/api/content/transform', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mode,
            lessonPath: lessonPath || window.location.pathname,
            originalContent: document.querySelector('.markdown')?.innerHTML || '',
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setTransformedContent(data.content);
      } catch (err) {
        console.error('Failed to fetch transformed content:', err);
        setError(
          mode === 'summary'
            ? '⚠️ Summary mode requires authentication. Please sign up to unlock this feature.'
            : '⚠️ Personalized mode requires authentication. Please sign up and set your professional background.'
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

  // Show loading state
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>
          {mode === 'summary'
            ? 'Generating AI summary... (3-6 seconds)'
            : 'Personalizing content for you... (3-6 seconds)'}
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
        <div dangerouslySetInnerHTML={{ __html: transformedContent }} />
      </div>
    );
  }

  // Fallback: show original
  return <>{children}</>;
}
