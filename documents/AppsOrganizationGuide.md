# Texas AI Landing Page - Apps Organization Guide

## Overview

This document explains the organization of the Apps section of the Texas AI Landing Page website. It provides information about the structure, components, and patterns used in the implementation, as well as guidelines for adding new apps.

## Directory Structure

The Apps section follows a structured, consistent organization pattern:

```
react-three-next/
├── app/
│   ├── apps/
│   │   ├── page.jsx                    # Main Apps listing page
│   │   ├── [appId]/                    # Dynamic route for any app
│   │   │   └── page.jsx                # Router that handles app navigation
│   │   └── central-texas-data-centers/ # Example app directory
│   │       └── page.jsx                # App-specific page component
├── src/
│   ├── components/
│   │   ├── app-page-components/        # Components for the Apps listing page
│   │   │   ├── AppCard.jsx             # Card component for individual app display
│   │   │   └── AppList.jsx             # Grid layout for app cards with filtering
│   │   └── mini-apps/                  # App-specific components
│   │       └── central-texas-data-centers-dashboard/ # Example app components
│   └── data/
│       └── apps.js                     # Central registry of all apps with metadata
```

## Key Components

### 1. Central App Registry (`src/data/apps.js`)

This file serves as the single source of truth for app information. It contains:

- An array of app objects with metadata
- Utility functions for retrieving and filtering apps
- Documentation for each field in the app schema

Each app object includes:
- `id`: Unique identifier (used in URLs)
- `title`: Display name of the app
- `description`: Brief description for the app card
- `image`: Path to the preview image
- `path`: URL path for the app (should follow `/apps/[app-id]` pattern)
- `category`: The category of the app (for filtering)
- `tags`: Array of tags for additional filtering
- `featured`: Boolean to mark featured apps

### 2. App Page Components (`src/components/app-page-components/`)

- **AppCard.jsx**: Card component for displaying an individual app with image, title, description, and call-to-action.
- **AppList.jsx**: Grid layout component that displays AppCards and handles filtering.

### 3. App-Specific Components (`src/components/mini-apps/`)

Each app has its own directory under `mini-apps/` which contains the app-specific components. For example, the Central Texas Data Centers Dashboard components are in `src/components/mini-apps/central-texas-data-centers-dashboard/`.

### 4. Next.js App Router Structure

- **Main Apps Page** (`app/apps/page.jsx`): The main page that displays all app cards.
- **Dynamic App Routes** (`app/apps/[appId]/page.jsx`): A dynamic route handler for app navigation.
- **App-Specific Pages** (`app/apps/[app-id]/page.jsx`): Individual pages for each app.

## Adding a New App

To add a new app to the system, follow these steps:

### 1. Create App Components

Create a new directory for your app's components:

```
react-three-next/src/components/mini-apps/your-new-app/
```

Implement your app's components in this directory.

### 2. Create App Page

Create a new directory for your app's page component:

```
react-three-next/app/apps/your-new-app/
```

Add a `page.jsx` file in this directory that imports and uses your app components.

### 3. Register the App

Add your app to the apps array in `src/data/apps.js`:

```javascript
const apps = [
  // Existing apps...
  {
    id: 'your-new-app',
    title: 'Your New App Title',
    description: 'Description of your new app',
    image: '/path/to/app-preview-image.png',
    path: '/apps/your-new-app',
    category: 'your-app-category',
    tags: ['tag1', 'tag2'],
    featured: false
  },
];
```

That's it! Your app will automatically appear on the Apps page with the appropriate filtering and routing.

## Routing System

The routing system is designed to be simple and consistent:

1. All apps are accessible via the pattern `/apps/[app-id]`
2. The main Apps listing page is at `/apps`
3. The dynamic router at `/apps/[appId]/page.jsx` handles navigation to individual apps
4. Each app has its own directory in the app folder for its page component

## Best Practices

### App Organization

1. **Component Organization**: Keep all app-specific components in their own directory under `src/components/mini-apps/`.

2. **Page Organization**: Keep all app-specific pages in their own directory under `app/apps/`.

3. **Consistent Naming**: Use kebab-case for directory and file names (e.g., `central-texas-data-centers`).

4. **Metadata Completeness**: Ensure all fields in the app registry are filled out properly.

### Code Quality

1. **Component Isolation**: App components should be self-contained and not depend on other apps.

2. **Responsive Design**: Ensure all apps work well on different screen sizes.

3. **Performance Considerations**: Use Next.js features like suspense boundaries for better loading experience.

4. **Accessibility**: Follow accessibility best practices in all app components.

## Examples

### Example: Central Texas Data Centers Dashboard

- Components: `src/components/mini-apps/central-texas-data-centers-dashboard/`
- Page: `app/apps/central-texas-data-centers/page.jsx`
- Registry entry in `src/data/apps.js`

## Conclusion

This organization structure provides a clean, consistent way to manage multiple apps within the website. By following these patterns, you can easily add new apps while maintaining a cohesive user experience across the platform.