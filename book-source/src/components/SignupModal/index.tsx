import React, { useState } from 'react';
import styles from './styles.module.css';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'summary' | 'personalized';
}

export default function SignupModal({ isOpen, onClose, mode }: SignupModalProps): JSX.Element | null {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [professionalBackground, setProfessionalBackground] = useState('General');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // TODO: Replace with actual signup API
      // For now, just simulate delay and save to localStorage
      await new Promise(resolve => setTimeout(resolve, 1000));

      localStorage.setItem('userEmail', email);
      localStorage.setItem('professionalBackground', professionalBackground);
      localStorage.setItem('isAuthenticated', 'true');

      // Close modal and trigger navigator to open
      onClose();

      // Dispatch event to notify parent component
      window.dispatchEvent(new CustomEvent('userAuthenticated'));
    } catch (err) {
      setError('Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>

        <div className={styles.header}>
          <h2 className={styles.title}>
            {mode === 'summary' ? '⚡ Unlock Summary Mode' : '🎯 Unlock Personalized Mode'}
          </h2>
          <p className={styles.subtitle}>
            Create your free account to access AI-powered content transformations
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password (min 8 characters)
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="••••••••"
              minLength={8}
              required
            />
          </div>

          {mode === 'personalized' && (
            <div className={styles.formGroup}>
              <label htmlFor="background" className={styles.label}>
                Professional Background
              </label>
              <select
                id="background"
                value={professionalBackground}
                onChange={(e) => setProfessionalBackground(e.target.value)}
                className={styles.select}
                required
              >
                <option value="General">General</option>
                <option value="Developer">Software Developer</option>
                <option value="Business">Business/Management</option>
                <option value="Accountant">Accountant/Finance</option>
                <option value="Healthcare">Healthcare Professional</option>
                <option value="Teacher">Teacher/Education</option>
                <option value="Designer">Designer/Creative</option>
                <option value="Legal">Legal/Compliance</option>
              </select>
            </div>
          )}

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className={styles.loadingSpinner}>Creating account...</span>
            ) : (
              `Create Free Account →`
            )}
          </button>

          <p className={styles.footer}>
            ✅ 100% Free • No Credit Card Required • Instant Access
          </p>
        </form>
      </div>
    </div>
  );
}
