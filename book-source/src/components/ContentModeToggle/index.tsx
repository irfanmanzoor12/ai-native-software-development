import React, { useState, useEffect } from 'react';
import SummaryNavigator from '@/components/SummaryNavigator';
import SignupModal from '@/components/SignupModal';
import styles from './styles.module.css';

type ContentMode = 'original' | 'summary' | 'personalized';

export default function ContentModeToggle(): JSX.Element {
  const [activeMode, setActiveMode] = useState<ContentMode>('original');
  const [showNavigator, setShowNavigator] = useState(false);
  const [navigatorMode, setNavigatorMode] = useState<'summary' | 'personalized'>('summary');
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);

    // Listen for authentication event from signup modal
    const handleAuth = () => {
      setIsAuthenticated(true);
      setShowSignupModal(false);
      setShowNavigator(true);
    };

    window.addEventListener('userAuthenticated', handleAuth);

    return () => {
      window.removeEventListener('userAuthenticated', handleAuth);
    };
  }, []);

  // Load saved preference from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('contentMode') as ContentMode;
    if (savedMode && ['original', 'summary', 'personalized'].includes(savedMode)) {
      setActiveMode(savedMode);
    }
  }, []);

  // Handle mode change
  const handleModeChange = (mode: ContentMode) => {
    // If clicking same mode, do nothing
    if (mode === activeMode && mode !== 'original') {
      setShowNavigator(true);
      return;
    }

    setActiveMode(mode);
    localStorage.setItem('contentMode', mode);

    // For original mode, just close navigator
    if (mode === 'original') {
      setShowNavigator(false);
      return;
    }

    // For summary/personalized, check authentication
    if (!isAuthenticated) {
      setShowSignupModal(true);
      setNavigatorMode(mode);
      return;
    }

    // Open navigator
    setNavigatorMode(mode);
    setShowNavigator(true);
  };

  // Handle successful signup
  const handleSignupSuccess = () => {
    setIsAuthenticated(true);
    setShowSignupModal(false);
    setShowNavigator(true);
  };

  return (
    <>
      <div className={styles.toggleContainer}>
        <div className={styles.toggleButtons}>
          <button
            className={`${styles.toggleButton} ${activeMode === 'original' ? styles.active : ''}`}
            onClick={() => handleModeChange('original')}
            aria-pressed={activeMode === 'original'}
          >
            <span className={styles.buttonIcon}>📖</span>
            <span className={styles.buttonText}>Original</span>
          </button>

          <button
            className={`${styles.toggleButton} ${activeMode === 'summary' ? styles.active : ''}`}
            onClick={() => handleModeChange('summary')}
            aria-pressed={activeMode === 'summary'}
          >
            <span className={styles.buttonIcon}>⚡</span>
            <span className={styles.buttonText}>Summary</span>
          </button>

          <button
            className={`${styles.toggleButton} ${activeMode === 'personalized' ? styles.active : ''}`}
            onClick={() => handleModeChange('personalized')}
            aria-pressed={activeMode === 'personalized'}
          >
            <span className={styles.buttonIcon}>🎯</span>
            <span className={styles.buttonText}>Personalized</span>
          </button>
        </div>
      </div>

      {/* Summary/Personalized Navigator */}
      <SummaryNavigator
        isOpen={showNavigator}
        onClose={() => {
          setShowNavigator(false);
          setActiveMode('original');
        }}
        mode={navigatorMode}
      />

      {/* Signup Modal */}
      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        mode={navigatorMode}
      />
    </>
  );
}
