/**
 * Central registry of applications for the APPS page
 * 
 * This file serves as a single source of truth for app information
 * displayed on the APPS page. When adding new apps, simply add a new
 * entry to this array with the required properties.
 */

const apps = [
  {
    id: 'central-texas-data-centers',
    title: 'Central Texas Data Center Dashboard',
    description: 'Interactive dashboard visualizing the data center market in Central Texas with forecasts and market analysis.',
    image: '/blog-images/infographic-central-texas-data-centers.png',
    path: '/apps/central-texas-data-centers',
    category: 'dashboards',
    tags: ['data centers', 'market analysis', 'texas'],
    featured: true
  },
  // Add more apps here as they are developed
  // Example:
  // {
  //   id: 'ai-sentiment-analyzer',
  //   title: 'AI Sentiment Analyzer',
  //   description: 'Analyze text sentiment using our advanced AI model.',
  //   image: '/img/sentiment-analyzer.png',
  //   path: '/apps/ai-sentiment-analyzer',
  //   category: 'tools',
  //   tags: ['ai', 'nlp', 'text analysis'],
  //   featured: false
  // },
];

/**
 * Get all apps
 * @returns {Array} Array of all app objects
 */
export function getAllApps() {
  return apps;
}

/**
 * Get app by ID
 * @param {string} id - The ID of the app to retrieve
 * @returns {Object|null} The app object or null if not found
 */
export function getAppById(id) {
  return apps.find(app => app.id === id) || null;
}

/**
 * Get apps by category
 * @param {string} category - The category to filter by
 * @returns {Array} Array of app objects in the specified category
 */
export function getAppsByCategory(category) {
  return apps.filter(app => app.category === category);
}

/**
 * Get featured apps
 * @returns {Array} Array of featured app objects
 */
export function getFeaturedApps() {
  return apps.filter(app => app.featured);
}

/**
 * Get apps by tag
 * @param {string} tag - The tag to filter by
 * @returns {Array} Array of app objects with the specified tag
 */
export function getAppsByTag(tag) {
  return apps.filter(app => app.tags && app.tags.includes(tag));
}