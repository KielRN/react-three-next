import { parseISO, format, compareDesc } from 'date-fns';

/**
 * Format date for display
 */
export function formatDate(dateString) {
  const date = parseISO(dateString);
  return format(date, 'MMMM dd, yyyy');
}

/**
 * Sort blog posts by date (newest first)
 */
export function sortBlogPostsByDate(posts) {
  return posts.sort((a, b) => {
    const dateA = parseISO(a.date);
    const dateB = parseISO(b.date);
    return compareDesc(dateA, dateB);
  });
}