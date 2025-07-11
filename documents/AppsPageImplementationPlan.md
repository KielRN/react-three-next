# Apps Page Implementation Plan (Updated)

## Overview

This document outlines the plan for implementing an "APPS" page on the Texas AI Landing Page website. The page will display app cards in a grid layout, similar to the blog cards on the Blog page. The first app to be featured will be the "Central Texas Data Center Dashboard".

The implementation follows a structured, scalable approach that makes it easy to add new apps in the future and provides category-based filtering.

## File Structure

### 1. Centralized App Registry

- `react-three-next/src/data/apps.js`: Central data store for all app information
  - Contains app metadata (id, title, description, image, path)
  - Provides utility functions for filtering and retrieving app data
  - Single source of truth for app information

### 2. App Page Components

These live in `react-three-next/src/components/app-page-components`:

#### 2.1 AppCard.jsx
- Similar to BlogCard.jsx but tailored for apps
- Will display an image, title, description, and call-to-action button
- Will link to the specific app page

#### 2.2 AppList.jsx
- Similar to BlogList.jsx
- Will display a grid of AppCard components
- Includes category filtering functionality
- Uses the CategoryTag component for filtering UI

#### 2.3 CategoryTag Component
- For filtering apps by category
- Will be used as a subcomponent within AppList.jsx

#### 2.4 LCARSSectionHeader Component
- For consistent styling with the rest of the site
- Will be used as a subcomponent within AppList.jsx

### 3. Next.js App Directory Structure

#### 3.1 Main Apps Page
- `react-three-next/app/apps/page.jsx`: The main page that displays all app cards
  - Uses the AppList component
  - Gets app data from the centralized apps.js file

#### 3.2 Dynamic App Routes
- `react-three-next/app/apps/[appId]/page.jsx`: Dynamic route for handling app navigation
  - Receives the app ID from the URL
  - Routes to the appropriate app page or component
  - Handles legacy apps and provides flexibility for future apps

### 4. Implementation for Central Texas Data Center Dashboard

- Integration of the existing dashboard as the first app card
- Metadata stored in the centralized apps.js file
- Direct routing to the dashboard at `/apps/central-texas-data-centers`
- Redirect from the old `/data-dashboard` path for backward compatibility
- All future apps will follow this consistent pattern with dedicated directories

## Design Specifications

### 1. AppCard.jsx

```jsx
// AppCard.jsx
'use client'

import Link from 'next/link';
import Image from 'next/image';

export default function AppCard({ app }) {
  return (
    <div className="group rounded-lg overflow-hidden bg-gray-900 shadow-md hover:shadow-xl transition-all duration-300"
      style={{
        borderLeft: '2px solid #2c75ff',
        borderBottom: '2px solid #2c75ff',
        boxShadow: '0 0 10px rgba(44, 117, 255, 0.4)',
        animation: 'border-pulse 3s infinite'
      }}>
      <Link href={`/apps/${app.id}`} className="block">
        <div className="relative h-48 w-full">
          {app.image ? (
            <Image
              src={app.image}
              alt={app.title || "App featured image"}
              fill
              style={{ objectFit: 'cover' }}
              className="transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-[#0e2042] to-gray-900" />
          )}
        </div>
        
        <div className="p-6">
          <h2 className="text-xl font-bold mb-2 text-[#2c75ff] group-hover:text-[#ffcc00] transition-colors duration-300 font-hesdeadjim"
            style={{ textShadow: '0 0 5px rgba(44, 117, 255, 0.7)' }}>
            {app.title}
          </h2>
          
          <p className="text-white mb-4">
            {app.description}
          </p>
          
          <div className="mt-2 text-right">
            <span className="inline-block px-4 py-1 text-sm text-[#ffcc00] bg-[#0e2042] font-hesdeadjim"
              style={{
                clipPath: 'polygon(0 0, 100% 0, 92% 100%, 8% 100%)',
                textShadow: '0 0 5px rgba(255, 204, 0, 0.7)'
              }}>
              LAUNCH APP
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
```

### 2. apps/page.jsx

```jsx
// apps/page.jsx
import AppList from '../../src/components/app-page-components/AppList';
import { getAllApps } from '../../src/data/apps';

// Get apps from centralized data source
const apps = getAllApps();

export default function AppsPage() {
  return (
    <div className="min-h-screen bg-gray-900 w-full overflow-x-hidden -mt-[1px]">
      <div className="max-w-full">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-[#2c75ff] mb-8 font-hesdeadjim"
              style={{textShadow: '0 0 10px rgba(44, 117, 255, 0.7)'}}>
            Interactive Applications
          </h1>
          <p className="text-xl text-white mb-12">
            Explore our collection of interactive tools and dashboards
          </p>
          
          <AppList apps={apps} />
        </div>
      </div>
    </div>
  );
}
```

## Implementation Checklist

- [x] **Setup Data Structure**
  - [x] Create centralized apps data registry in `src/data/apps.js`
  - [x] Define app metadata structure with necessary fields
  - [x] Create utility functions for retrieving and filtering apps

- [x] **Setup Component Structure**
  - [x] Create `react-three-next/src/components/app-page-components` directory
  - [x] Create `react-three-next/app/apps` directory
  - [x] Create dynamic route structure with `[appId]` for individual apps

- [x] **Create Components**
  - [x] Create `AppCard.jsx` component
  - [x] Create `AppList.jsx` component with LCARSSectionHeader subcomponent
  - [x] Add category filtering support
  - [x] Create dynamic router page for app routing

- [x] **Create Page Component**
  - [x] Create `apps/page.jsx` that fetches data from central registry
  - [x] Configure routing for Central Texas Data Center Dashboard

- [x] **Integration**
  - [x] Ensure navigation to `/apps` works correctly
  - [x] Verify dynamic routing from app cards to appropriate destinations
  - [x] Fix import path issue in the data-dashboard page

- [x] **Testing**
  - [x] Test page rendering
  - [x] Test category filtering
  - [x] Test navigation between pages
  - [x] Test app card interaction and dashboard launch

## Future Enhancements

- Add more apps to the grid
- Implement additional filtering options (by tags or features)
- Add more interactive features to app cards (hover effects, animations)
- Create a standardized app template for future apps
- Implement analytics tracking for app usage

## Conclusion

This implementation follows a modular, scalable approach that makes it easy to add new apps in the future. The centralized data registry and dynamic routing system provide a flexible foundation for growth, while maintaining consistency in styling and user experience with the rest of the site.