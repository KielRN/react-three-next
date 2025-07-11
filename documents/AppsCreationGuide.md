# Texas AI Landing Page - Apps Creation Guide

## Overview

This document provides detailed instructions for creating new apps for the Texas AI Landing Page website. It builds upon the [Apps Organization Guide](./AppsOrganizationGuide.md) and incorporates specific deployment considerations to ensure your apps will build and deploy successfully, especially on platforms like Railway.

## Prerequisites

Before creating a new app, ensure you have:

1. Familiarized yourself with the existing app structure (see [Apps Organization Guide](./AppsOrganizationGuide.md))
2. A clear understanding of the app's purpose and functionality
3. Identified any external dependencies your app will require

## App Creation Process

### 1. Plan Your App Structure

Start by planning the component structure for your app:

- What main components will your app need?
- What data will your app require?
- Will your app need any external libraries or dependencies?
- What interactive elements will your app include?

### 2. Create App Components

#### Directory Structure

Create a new directory for your app's components following the established pattern:

```
react-three-next/src/components/mini-apps/your-new-app/
```

Inside this directory, organize your components logically:

```
your-new-app/
├── YourAppWrapper.jsx        # Client-side wrapper component
├── YourAppLayout.jsx         # Main layout for your app
├── CallToAction.jsx          # Optional CTA component
└── charts/                   # If your app has visualizations
    ├── Chart1.jsx
    ├── Chart2.jsx
    └── ...
```

#### Component Implementation

When implementing your components:

1. **Always include the 'use client' directive** at the top of client-side component files:

```jsx
'use client'

import { useState, useEffect } from 'react';
// Rest of component...
```

2. **Separate server and client components** clearly:
   - Server components can fetch data and pass it to client components
   - Client components handle interactivity and rendering

3. **Add dependencies to package.json**: Any external libraries your app uses must be added to the project's package.json:

```bash
npm install --save your-library-name
```

4. **Create a client-side wrapper component** for your app to avoid SSR issues:

```jsx
// YourAppWrapper.jsx
'use client'

import { useSearchParams } from 'next/navigation';
import YourAppLayout from './YourAppLayout';
import { useEffect, useRef } from 'react';

export default function YourAppWrapper() {
  // Client-side logic here
  const searchParams = useSearchParams();
  
  // Component refs or state
  const componentRefs = {
    'section-one': useRef(null),
    'section-two': useRef(null),
  };
  
  return (
    <YourAppLayout componentRefs={componentRefs} />
  );
}
```

### 3. Create App Page

#### Directory Structure

Create a new directory for your app's page:

```
react-three-next/app/apps/your-new-app/
```

Add a `page.jsx` file that uses dynamic imports for client components:

```jsx
// page.jsx
import dynamic from 'next/dynamic';

// Use dynamic import with SSR disabled for client components
const YourAppWithNoSSR = dynamic(
  () => import('../../../src/components/mini-apps/your-new-app/YourAppWrapper'),
  { ssr: false }
);

export default function YourNewAppPage() {
  return <YourAppWithNoSSR />;
}

// Add metadata for better SEO
export const metadata = {
  title: 'Your App Title | Texas AI Consulting',
  description: 'Description of your app for SEO purposes.',
};
```

### 4. Register Your App

Add your app to the central registry in `src/data/apps.js`:

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

### 5. Add App Assets

Place any static assets (images, data files, etc.) in the appropriate public directories:

- Images: `/public/img/your-app-name/`
- Data files: `/public/data/your-app-name/`

### 6. Test Locally

Before committing your changes:

1. Test your app locally using `npm run dev`
2. Verify all functionality works as expected
3. Check for any console errors
4. Test responsiveness on different screen sizes

## Deployment Considerations

To ensure successful deployment, especially on platforms like Railway, follow these guidelines:

### 1. Dependency Management

- **Add all dependencies to package.json**: Ensure any libraries used by your app are properly added to package.json
- **Check version compatibility**: Use compatible versions of libraries to avoid conflicts

```jsx
// Example of problematic dependencies and their solutions
// Visualization libraries often require special handling
import { VisualizationComponent } from 'visualization-library'; // ❌ May cause SSR issues

// Better approach using dynamic imports
const VisualizationComponent = dynamic(
  () => import('visualization-library').then(mod => mod.VisualizationComponent),
  { ssr: false }
); // ✅ Works in production
```

### 2. ESM Module Handling

Some libraries use ESM-only modules that can cause issues during server-side rendering:

- **Use dynamic imports** with `{ ssr: false }` for components that use ESM-only modules
- **Create wrapper components** that load these dependencies only on the client side
- **Keep server components simple** and push complexity to client components

```jsx
// Example using dynamic imports for ESM modules
const ChartComponent = dynamic(
  () => import('./ChartComponent'),
  { 
    ssr: false,
    loading: () => <div className="p-8 text-center">Loading chart...</div>
  }
);
```

### 3. Client vs. Server Components

Next.js 13+ distinguishes between server and client components:

- **Server Components**: Can fetch data, don't include interactivity
- **Client Components**: Include the 'use client' directive, handle interactivity

For apps with both types:

1. Create server components that fetch and prepare data
2. Pass this data to client components that handle rendering and interactivity
3. Use dynamic imports to load client components only when needed

### 4. Testing Deployment Builds

Before pushing to production:

```bash
# Build locally to catch potential issues
npm run build

# Test the production build
npm start
```

If you encounter build errors:

1. Check the error messages for specific file paths and components
2. Look for missing dependencies or ESM module issues
3. Simplify problematic components or convert them to use dynamic imports

## Examples

### Example 1: Simple Data Dashboard

```jsx
// app/apps/simple-dashboard/page.jsx
import dynamic from 'next/dynamic';

const DashboardWithNoSSR = dynamic(
  () => import('../../../src/components/mini-apps/simple-dashboard/DashboardWrapper'),
  { ssr: false }
);

export default function SimpleDashboardPage() {
  return <DashboardWithNoSSR />;
}

export const metadata = {
  title: 'Simple Dashboard | Texas AI Consulting',
  description: 'A straightforward data visualization dashboard.',
};
```

```jsx
// src/components/mini-apps/simple-dashboard/DashboardWrapper.jsx
'use client'

import { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';

export default function DashboardWrapper() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    // Fetch data on the client side
    fetch('/data/simple-dashboard/data.json')
      .then(res => res.json())
      .then(setData);
  }, []);
  
  return <DashboardLayout data={data} />;
}
```

### Example 2: Interactive Visualization with External Libraries

```jsx
// src/components/mini-apps/visualization-app/ChartWrapper.jsx
'use client'

import { useState } from 'react';
import dynamic from 'next/dynamic';

// Import visualization component with SSR disabled
const ComplexChart = dynamic(
  () => import('./ComplexChart'),
  { ssr: false }
);

export default function ChartWrapper({ initialData }) {
  const [data, setData] = useState(initialData);
  
  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h2 className="text-xl text-white mb-4">Interactive Chart</h2>
      <ComplexChart data={data} />
      <div className="mt-4">
        <button 
          onClick={() => setData([...data, Math.random() * 100])}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Add Random Data
        </button>
      </div>
    </div>
  );
}
```

## Troubleshooting Common Issues

### 1. "Module not found" Errors

**Problem**: `Module not found: Can't resolve 'library-name'`

**Solutions**:
- Check if the library is installed: `npm install library-name`
- Add the library to package.json
- Check import paths for typos

### 2. ESM Module Issues

**Problem**: `Error: Element type is invalid: expected a string or a class/function but got: undefined`

**Solutions**:
- Use dynamic imports with `{ ssr: false }`
- Move problematic components to client-side only
- Check if the library supports SSR

### 3. Build Failures in Production

**Problem**: Build works locally but fails in production

**Solutions**:
- Check for environment-specific code
- Verify all dependencies are in package.json (not just devDependencies)
- Use `next build` locally to catch issues before deployment

## Best Practices Summary

1. **Separate concerns**: Keep client and server components separate
2. **Use dynamic imports**: For components that use external libraries
3. **Add clear metadata**: Include title and description for SEO
4. **Test production builds**: Build locally before pushing to production
5. **Optimize performance**: Lazy-load components that aren't immediately needed
6. **Consistent styling**: Follow the design system for a cohesive look
7. **Progressive enhancement**: Ensure core functionality works without JavaScript
8. **Error handling**: Add proper error boundaries and fallbacks

By following this guide, you'll create apps that not only function well but also deploy successfully in production environments.