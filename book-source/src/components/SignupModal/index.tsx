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
  const [name, setName] = useState('');
  const [professionalBackground, setProfessionalBackground] = useState('General');
  const [experienceLevel, setExperienceLevel] = useState('Beginner');
  const [learningGoal, setLearningGoal] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
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
      localStorage.setItem('userName', name);
      localStorage.setItem('professionalBackground', professionalBackground);
      localStorage.setItem('experienceLevel', experienceLevel);
      localStorage.setItem('learningGoal', learningGoal);
      localStorage.setItem('interests', JSON.stringify(interests));
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
            <label htmlFor="name" className={styles.label}>
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              placeholder="John Doe"
              required
            />
          </div>

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
            <>
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
                  <option value="Engineering">Engineer (Non-Software)</option>
                  <option value="Marketing">Marketing/Sales</option>
                  <option value="Student">Student</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="experience" className={styles.label}>
                  Programming Experience Level
                </label>
                <select
                  id="experience"
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className={styles.select}
                  required
                >
                  <option value="Beginner">Beginner (No coding experience)</option>
                  <option value="Novice">Novice (Learning first language)</option>
                  <option value="Intermediate">Intermediate (1-2 years)</option>
                  <option value="Advanced">Advanced (3-5 years)</option>
                  <option value="Expert">Expert (5+ years)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="goal" className={styles.label}>
                  Primary Learning Goal
                </label>
                <select
                  id="goal"
                  value={learningGoal}
                  onChange={(e) => setLearningGoal(e.target.value)}
                  className={styles.select}
                  required
                >
                  <option value="">Select your goal...</option>
                  <option value="Career Change">Career change to tech</option>
                  <option value="Build Projects">Build personal projects</option>
                  <option value="Startup">Launch a startup/product</option>
                  <option value="Automation">Automate work tasks</option>
                  <option value="AI Skills">Learn AI development</option>
                  <option value="Upgrade Skills">Upgrade existing skills</option>
                  <option value="Research">Academic/Research purposes</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Topics of Interest (select multiple)
                </label>
                <div className={styles.checkboxGroup}>
                  {[
                    'Python Basics',
                    'TypeScript',
                    'AI Agents',
                    'Prompt Engineering',
                    'Web Development',
                    'Backend APIs',
                    'DevOps',
                    'Testing',
                    'Deployment',
                    'Specification-First Development'
                  ].map((topic) => (
                    <label key={topic} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={interests.includes(topic)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setInterests([...interests, topic]);
                          } else {
                            setInterests(interests.filter(i => i !== topic));
                          }
                        }}
                        className={styles.checkbox}
                      />
                      <span>{topic}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
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
