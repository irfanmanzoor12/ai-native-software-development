import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';

type ContentMode = 'original' | 'summary' | 'personalized';

export default function ContentModeToggle(): JSX.Element {
  const [activeMode, setActiveMode] = useState<ContentMode>('original');

  // Load saved preference from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('contentMode') as ContentMode;
    if (savedMode && ['original', 'summary', 'personalized'].includes(savedMode)) {
      setActiveMode(savedMode);
    }
  }, []);

  // Save preference to localStorage when changed
  const handleModeChange = (mode: ContentMode) => {
    setActiveMode(mode);
    localStorage.setItem('contentMode', mode);

    // Dispatch custom event so other components can react to mode change
    window.dispatchEvent(new CustomEvent('contentModeChanged', {
      detail: { mode }
    }));
  };

  return (
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
  );
}
