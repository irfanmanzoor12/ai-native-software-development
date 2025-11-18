/**
 * Book Structure Scanner
 *
 * Scans the docs/ folder and builds a complete navigation structure
 * for the Summary/Personalized navigator.
 */

export interface Lesson {
  id: string;
  title: string;
  path: string;
  filename: string;
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  path: string;
  lessons: Lesson[];
}

export interface Part {
  id: string;
  number: number;
  title: string;
  path: string;
  chapters: Chapter[];
}

export interface BookStructure {
  parts: Part[];
  totalParts: number;
  totalChapters: number;
  totalLessons: number;
}

/**
 * Static book structure based on docs folder
 * This will be dynamically loaded in production
 */
export const BOOK_STRUCTURE: BookStructure = {
  parts: [
    {
      id: 'part-01',
      number: 1,
      title: 'Introducing AI-Driven Development',
      path: '/docs/01-Introducing-AI-Driven-Development',
      chapters: [
        {
          id: 'chapter-01',
          number: 1,
          title: 'AI Development Revolution',
          path: '/docs/01-Introducing-AI-Driven-Development/01-ai-development-revolution',
          lessons: [
            {
              id: 'lesson-01-01-01',
              title: 'The Moment That Changed Everything',
              path: '/docs/01-Introducing-AI-Driven-Development/01-ai-development-revolution/01-moment_that_changed_everything',
              filename: '01-moment_that_changed_everything.md'
            },
            {
              id: 'lesson-01-01-02',
              title: 'Three Trillion Developer Economy',
              path: '/docs/01-Introducing-AI-Driven-Development/01-ai-development-revolution/02-three-trillion-developer-economy',
              filename: '02-three-trillion-developer-economy.md'
            },
            {
              id: 'lesson-01-01-03',
              title: 'Software Disrupting Itself',
              path: '/docs/01-Introducing-AI-Driven-Development/01-ai-development-revolution/03-software-disrupting-itself',
              filename: '03-software-disrupting-itself.md'
            },
            {
              id: 'lesson-01-01-04',
              title: 'Development Lifecycle Transition',
              path: '/docs/01-Introducing-AI-Driven-Development/01-ai-development-revolution/04-development-lifecycle-transition',
              filename: '04-development-lifecycle-transition.md'
            },
            {
              id: 'lesson-01-01-05',
              title: 'Beyond Code: Changing Roles',
              path: '/docs/01-Introducing-AI-Driven-Development/01-ai-development-revolution/05-beyond-code-changing-roles',
              filename: '05-beyond-code-changing-roles.md'
            },
            {
              id: 'lesson-01-01-06',
              title: 'Autonomous Agent Era',
              path: '/docs/01-Introducing-AI-Driven-Development/01-ai-development-revolution/06-autonomous-agent-era',
              filename: '06-autonomous-agent-era.md'
            },
            {
              id: 'lesson-01-01-07',
              title: 'Opportunity Window',
              path: '/docs/01-Introducing-AI-Driven-Development/01-ai-development-revolution/07-opportunity-window',
              filename: '07-opportunity-window.md'
            },
            {
              id: 'lesson-01-01-08',
              title: 'Traditional CS Education Gaps',
              path: '/docs/01-Introducing-AI-Driven-Development/01-ai-development-revolution/08-traditional-cs-education-gaps',
              filename: '08-traditional-cs-education-gaps.md'
            }
          ]
        },
        {
          id: 'chapter-02',
          number: 2,
          title: 'AI Turning Point',
          path: '/docs/01-Introducing-AI-Driven-Development/02-ai-turning-point',
          lessons: [
            {
              id: 'lesson-01-02-01',
              title: 'The Inflection Point',
              path: '/docs/01-Introducing-AI-Driven-Development/02-ai-turning-point/01-the-inflection-point',
              filename: '01-the-inflection-point.md'
            },
            {
              id: 'lesson-01-02-02',
              title: 'Development Patterns',
              path: '/docs/01-Introducing-AI-Driven-Development/02-ai-turning-point/02-development-patterns',
              filename: '02-development-patterns.md'
            },
            {
              id: 'lesson-01-02-03',
              title: 'DORA Perspective',
              path: '/docs/01-Introducing-AI-Driven-Development/02-ai-turning-point/03-dora-perspective',
              filename: '03-dora-perspective.md'
            },
            {
              id: 'lesson-01-02-04',
              title: 'AI Coding Agents',
              path: '/docs/01-Introducing-AI-Driven-Development/02-ai-turning-point/04-ai-coding-agents',
              filename: '04-ai-coding-agents.md'
            }
          ]
        },
        {
          id: 'chapter-03',
          number: 3,
          title: 'Billion Dollar AI',
          path: '/docs/01-Introducing-AI-Driven-Development/03-billion-dollar-ai',
          lessons: [
            {
              id: 'lesson-01-03-01',
              title: 'Billion Dollar Question',
              path: '/docs/01-Introducing-AI-Driven-Development/03-billion-dollar-ai/01-billion-dollar-question',
              filename: '01-billion-dollar-question.md'
            },
            {
              id: 'lesson-01-03-02',
              title: 'Snakes and Ladders',
              path: '/docs/01-Introducing-AI-Driven-Development/03-billion-dollar-ai/02-snakes-and-ladders',
              filename: '02-snakes-and-ladders.md'
            },
            {
              id: 'lesson-01-03-03',
              title: 'Super Orchestrators',
              path: '/docs/01-Introducing-AI-Driven-Development/03-billion-dollar-ai/03-super-orchestrators',
              filename: '03-super-orchestrators.md'
            },
            {
              id: 'lesson-01-03-04',
              title: 'Vertical Intelligence',
              path: '/docs/01-Introducing-AI-Driven-Development/03-billion-dollar-ai/04-vertical-intelligence',
              filename: '04-vertical-intelligence.md'
            },
            {
              id: 'lesson-01-03-05',
              title: 'PPP Strategy',
              path: '/docs/01-Introducing-AI-Driven-Development/03-billion-dollar-ai/05-ppp-strategy',
              filename: '05-ppp-strategy.md'
            },
            {
              id: 'lesson-01-03-06',
              title: 'Three Requirements',
              path: '/docs/01-Introducing-AI-Driven-Development/03-billion-dollar-ai/06-three-requirements',
              filename: '06-three-requirements.md'
            },
            {
              id: 'lesson-01-03-07',
              title: 'Pause and Reflect',
              path: '/docs/01-Introducing-AI-Driven-Development/03-billion-dollar-ai/07-pause-and-reflect',
              filename: '07-pause-and-reflect.md'
            }
          ]
        },
        {
          id: 'chapter-04',
          number: 4,
          title: 'Nine Pillars',
          path: '/docs/01-Introducing-AI-Driven-Development/04-nine-pillars',
          lessons: [
            {
              id: 'lesson-01-04-01',
              title: 'Why New Paradigm',
              path: '/docs/01-Introducing-AI-Driven-Development/04-nine-pillars/01-why-new-paradigm',
              filename: '01-why-new-paradigm.md'
            },
            {
              id: 'lesson-01-04-02',
              title: 'AIDD Defined',
              path: '/docs/01-Introducing-AI-Driven-Development/04-nine-pillars/02-aidd-defined',
              filename: '02-aidd-defined.md'
            },
            {
              id: 'lesson-01-04-03',
              title: 'Pillars Overview',
              path: '/docs/01-Introducing-AI-Driven-Development/04-nine-pillars/03-pillars-overview',
              filename: '03-pillars-overview.md'
            },
            {
              id: 'lesson-01-04-04',
              title: 'Pillars Detailed',
              path: '/docs/01-Introducing-AI-Driven-Development/04-nine-pillars/04-pillars-detailed',
              filename: '04-pillars-detailed.md'
            },
            {
              id: 'lesson-01-04-05',
              title: 'M-Shaped Developer',
              path: '/docs/01-Introducing-AI-Driven-Development/04-nine-pillars/05-m-shaped-developer',
              filename: '05-m-shaped-developer.md'
            },
            {
              id: 'lesson-01-04-06',
              title: 'Why All Nine Matter',
              path: '/docs/01-Introducing-AI-Driven-Development/04-nine-pillars/06-why-all-nine-matter',
              filename: '06-why-all-nine-matter.md'
            }
          ]
        }
      ]
    }
    // Additional parts will be auto-scanned in future versions
    // For MVP, we'll add more parts manually or via dynamic scanning
  ],
  totalParts: 1, // Will be updated as we add more
  totalChapters: 4,
  totalLessons: 25
};

/**
 * Get lesson by path
 */
export function getLessonByPath(path: string): Lesson | null {
  for (const part of BOOK_STRUCTURE.parts) {
    for (const chapter of part.chapters) {
      for (const lesson of chapter.lessons) {
        if (lesson.path === path) {
          return lesson;
        }
      }
    }
  }
  return null;
}

/**
 * Get chapter by lesson path
 */
export function getChapterByLessonPath(path: string): Chapter | null {
  for (const part of BOOK_STRUCTURE.parts) {
    for (const chapter of part.chapters) {
      for (const lesson of chapter.lessons) {
        if (lesson.path === path) {
          return chapter;
        }
      }
    }
  }
  return null;
}

/**
 * Get part by lesson path
 */
export function getPartByLessonPath(path: string): Part | null {
  for (const part of BOOK_STRUCTURE.parts) {
    for (const chapter of part.chapters) {
      for (const lesson of chapter.lessons) {
        if (lesson.path === path) {
          return part;
        }
      }
    }
  }
  return null;
}

/**
 * Format lesson title for display
 */
export function formatLessonTitle(title: string): string {
  return title
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
