/**
 * Page Context Detection Utility
 *
 * Automatically extracts current part, chapter, and lesson information
 * from the URL path and page metadata for AI context-aware responses.
 */

export interface PageContext {
  part: string | null;
  chapter: string | null;
  lesson: string | null;
  lessonTitle: string | null;
  fullPath: string;
  contentPreview: string | null;
  isDocsPage: boolean;
}

/**
 * Extract page context from current URL and DOM
 */
export function extractPageContext(): PageContext {
  const pathname = window.location.pathname;
  const isDocsPage = pathname.startsWith('/docs/');

  // Default context
  const context: PageContext = {
    part: null,
    chapter: null,
    lesson: null,
    lessonTitle: null,
    fullPath: pathname,
    contentPreview: null,
    isDocsPage,
  };

  if (!isDocsPage) {
    return context;
  }

  // Parse URL patterns like:
  // /docs/01-AI-Native/01-intro/01-lesson-1
  // /docs/06-AI-Native/35-intro/01-lesson-1
  const pathParts = pathname.split('/').filter(Boolean);

  if (pathParts.length >= 2) {
    // Extract part (e.g., "01-AI-Native")
    const partSegment = pathParts[1];
    const partMatch = partSegment.match(/^(\d+)-(.*)/);
    if (partMatch) {
      context.part = `Part ${parseInt(partMatch[1])}: ${formatSegment(partMatch[2])}`;
    }

    // Extract chapter (e.g., "35-intro")
    if (pathParts.length >= 3) {
      const chapterSegment = pathParts[2];
      const chapterMatch = chapterSegment.match(/^(\d+)-(.*)/);
      if (chapterMatch) {
        context.chapter = `Chapter ${parseInt(chapterMatch[1])}: ${formatSegment(chapterMatch[2])}`;
      }
    }

    // Extract lesson (e.g., "01-lesson-1")
    if (pathParts.length >= 4) {
      const lessonSegment = pathParts[3];
      const lessonMatch = lessonSegment.match(/^(\d+)-(.*)/);
      if (lessonMatch) {
        context.lesson = `Lesson ${parseInt(lessonMatch[1])}: ${formatSegment(lessonMatch[2])}`;
      }
    }
  }

  // Get lesson title from page heading
  const h1 = document.querySelector('h1');
  if (h1) {
    context.lessonTitle = h1.textContent?.trim() || null;
  }

  // Get content preview (first 500 chars for AI context)
  const contentElement = document.querySelector('article.markdown') ||
                        document.querySelector('.markdown') ||
                        document.querySelector('main');

  if (contentElement) {
    const textContent = contentElement.textContent || '';
    context.contentPreview = textContent.trim().substring(0, 500);
  }

  return context;
}

/**
 * Format URL segment to readable text
 * "ai-native-development" → "AI Native Development"
 */
function formatSegment(segment: string): string {
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format context for AI prompt
 */
export function formatContextForAI(context: PageContext): string {
  if (!context.isDocsPage) {
    return "User is on the homepage/non-lesson page.";
  }

  const parts: string[] = [];

  if (context.part) parts.push(`📚 ${context.part}`);
  if (context.chapter) parts.push(`📖 ${context.chapter}`);
  if (context.lesson) parts.push(`📄 ${context.lesson}`);
  if (context.lessonTitle) parts.push(`\nTitle: "${context.lessonTitle}"`);

  if (parts.length === 0) {
    return `User is viewing: ${context.fullPath}`;
  }

  let formatted = `Current Location:\n${parts.join('\n')}`;

  if (context.contentPreview) {
    formatted += `\n\nLesson Content Preview:\n${context.contentPreview}...`;
  }

  return formatted;
}

/**
 * Get breadcrumb trail as string
 */
export function getBreadcrumb(context: PageContext): string {
  const parts: string[] = [];

  if (context.part) parts.push(context.part);
  if (context.chapter) parts.push(context.chapter);
  if (context.lesson) parts.push(context.lesson);

  return parts.length > 0 ? parts.join(' > ') : 'Home';
}
