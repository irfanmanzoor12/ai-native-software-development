import React, { useState, useEffect } from 'react';
import { BOOK_STRUCTURE, type Part, type Chapter, type Lesson } from '@/utils/bookStructure';
import styles from './styles.module.css';
import BrowserOnly from '@docusaurus/BrowserOnly';

interface SummaryNavigatorProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'summary' | 'personalized';
}

interface GeneratedContent {
  lessonId: string;
  content: string;
  timestamp: number;
}

export default function SummaryNavigator({ isOpen, onClose, mode }: SummaryNavigatorProps): JSX.Element | null {
  const [expandedParts, setExpandedParts] = useState<Set<string>>(new Set(['part-01']));
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [generatedContent, setGeneratedContent] = useState<Map<string, GeneratedContent>>(new Map());
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load cached summaries from localStorage on mount
  useEffect(() => {
    if (isOpen) {
      const cacheKey = `summaries_${mode}_cache`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const contentMap = new Map<string, GeneratedContent>();

          // Filter out expired cache (7 days)
          const now = Date.now();
          const sevenDays = 7 * 24 * 60 * 60 * 1000;

          Object.entries(parsed).forEach(([lessonId, data]: [string, any]) => {
            if (now - data.timestamp < sevenDays) {
              contentMap.set(lessonId, data);
            }
          });

          setGeneratedContent(contentMap);
        } catch (e) {
          console.error('Failed to load cached summaries:', e);
        }
      }
    }
  }, [isOpen, mode]);

  // Save cached summaries to localStorage
  useEffect(() => {
    if (generatedContent.size > 0) {
      const cacheKey = `summaries_${mode}_cache`;
      const cacheObject = Object.fromEntries(generatedContent);
      localStorage.setItem(cacheKey, JSON.stringify(cacheObject));
    }
  }, [generatedContent, mode]);

  const togglePart = (partId: string) => {
    const newExpanded = new Set(expandedParts);
    if (newExpanded.has(partId)) {
      newExpanded.delete(partId);
    } else {
      newExpanded.add(partId);
    }
    setExpandedParts(newExpanded);
  };

  const toggleChapter = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const generateSummary = async (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setError(null);

    // Check if already generated (cached)
    if (generatedContent.has(lesson.id)) {
      return; // Already have it, just display
    }

    setIsGenerating(true);

    try {
      // Fetch the original lesson content
      const lessonResponse = await fetch(lesson.path);
      if (!lessonResponse.ok) {
        throw new Error(`Failed to fetch lesson content: ${lessonResponse.status}`);
      }

      const lessonText = await lessonResponse.text();

      // Get professional background for personalized mode
      const professionalBg = localStorage.getItem('professionalBackground') || 'General';

      // Call transformation API
      const response = await fetch('/api/content/transform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode,
          lessonPath: lesson.path,
          originalContent: lessonText,
          professionalBackground: mode === 'personalized' ? professionalBg : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error === 'API_KEY_NOT_CONFIGURED' || data.error === 'GENERATION_FAILED') {
        setError(data.content);
        return;
      }

      // Cache the generated content
      const newContent: GeneratedContent = {
        lessonId: lesson.id,
        content: data.content,
        timestamp: Date.now(),
      };

      setGeneratedContent(prev => new Map(prev).set(lesson.id, newContent));
    } catch (err) {
      console.error('Failed to generate summary:', err);
      setError(`⚠️ ${err.message || 'Failed to generate content. Please try again.'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  const modeIcon = mode === 'summary' ? '⚡' : '🎯';
  const modeTitle = mode === 'summary' ? 'Summary Navigator' : 'Personalized Navigator';

  return (
    <BrowserOnly>
      {() => (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            {modeIcon} {modeTitle}
          </h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close navigator">
            ✕
          </button>
        </div>

        {/* Split Panel */}
        <div className={styles.content}>
          {/* Left Panel: Navigation Tree */}
          <div className={styles.navigationPanel}>
            <div className={styles.navigationHeader}>
              <h3>📚 Book Navigation</h3>
              <p className={styles.navigationSubtitle}>
                {BOOK_STRUCTURE.totalParts} Parts • {BOOK_STRUCTURE.totalChapters} Chapters • {BOOK_STRUCTURE.totalLessons} Lessons
              </p>
            </div>

            <div className={styles.tree}>
              {BOOK_STRUCTURE.parts.map((part) => (
                <div key={part.id} className={styles.partContainer}>
                  {/* Part Header */}
                  <button
                    className={styles.partHeader}
                    onClick={() => togglePart(part.id)}
                  >
                    <span className={styles.expandIcon}>
                      {expandedParts.has(part.id) ? '▼' : '▶'}
                    </span>
                    <span className={styles.partIcon}>📚</span>
                    <span className={styles.partTitle}>
                      Part {part.number}: {part.title}
                    </span>
                  </button>

                  {/* Chapters (if expanded) */}
                  {expandedParts.has(part.id) && (
                    <div className={styles.chaptersContainer}>
                      {part.chapters.map((chapter) => (
                        <div key={chapter.id} className={styles.chapterContainer}>
                          {/* Chapter Header */}
                          <button
                            className={styles.chapterHeader}
                            onClick={() => toggleChapter(chapter.id)}
                          >
                            <span className={styles.expandIcon}>
                              {expandedChapters.has(chapter.id) ? '▼' : '▶'}
                            </span>
                            <span className={styles.chapterIcon}>📖</span>
                            <span className={styles.chapterTitle}>
                              Ch {chapter.number}: {chapter.title}
                            </span>
                          </button>

                          {/* Lessons (if expanded) */}
                          {expandedChapters.has(chapter.id) && (
                            <div className={styles.lessonsContainer}>
                              {chapter.lessons.map((lesson) => {
                                const isCached = generatedContent.has(lesson.id);
                                const isSelected = selectedLesson?.id === lesson.id;

                                return (
                                  <button
                                    key={lesson.id}
                                    className={`${styles.lessonItem} ${isSelected ? styles.selected : ''}`}
                                    onClick={() => generateSummary(lesson)}
                                  >
                                    <span className={styles.lessonIcon}>📄</span>
                                    <span className={styles.lessonTitle}>{lesson.title}</span>
                                    <span className={styles.lessonStatus}>
                                      {isCached ? '✓' : isSelected && isGenerating ? '⏳' : '👁️'}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel: Content Display */}
          <div className={styles.contentPanel}>
            {!selectedLesson && !error && (
              <div className={styles.placeholder}>
                <div className={styles.placeholderIcon}>{modeIcon}</div>
                <h3 className={styles.placeholderTitle}>
                  {mode === 'summary' ? 'Browse AI Summaries' : 'Personalized Learning'}
                </h3>
                <p className={styles.placeholderText}>
                  Select any lesson from the left to view its{' '}
                  {mode === 'summary' ? 'condensed summary' : 'personalized explanation'}
                </p>
                <div className={styles.placeholderStats}>
                  <div className={styles.stat}>
                    <div className={styles.statValue}>{generatedContent.size}</div>
                    <div className={styles.statLabel}>Cached</div>
                  </div>
                  <div className={styles.stat}>
                    <div className={styles.statValue}>{BOOK_STRUCTURE.totalLessons - generatedContent.size}</div>
                    <div className={styles.statLabel}>Remaining</div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className={styles.errorContainer}>
                <p className={styles.errorMessage}>{error}</p>
                <button className={styles.retryButton} onClick={() => selectedLesson && generateSummary(selectedLesson)}>
                  Try Again
                </button>
              </div>
            )}

            {selectedLesson && !error && (
              <div className={styles.lessonContent}>
                {/* Lesson Header */}
                <div className={styles.lessonHeader}>
                  <h3 className={styles.lessonContentTitle}>
                    {modeIcon} {selectedLesson.title}
                  </h3>
                  <div className={styles.lessonMeta}>
                    {generatedContent.has(selectedLesson.id) && (
                      <span className={styles.cachedBadge}>✓ Cached</span>
                    )}
                  </div>
                </div>

                {/* Loading State */}
                {isGenerating && (
                  <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p className={styles.loadingText}>
                      {mode === 'summary' ? '⚡ Generating summary...' : '🎯 Personalizing content...'}
                    </p>
                    <p className={styles.loadingHint}>This usually takes 2-4 seconds</p>
                  </div>
                )}

                {/* Generated Content */}
                {!isGenerating && generatedContent.has(selectedLesson.id) && (
                  <div className={styles.generatedContent}>
                    <div
                      className="markdown"
                      dangerouslySetInnerHTML={{
                        __html: generatedContent.get(selectedLesson.id)!.content
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
      )}
    </BrowserOnly>
  );
}
