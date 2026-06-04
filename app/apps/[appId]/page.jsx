'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getAppById } from '../../../src/data/apps';

/**
 * Dynamic app router page
 * 
 * This page serves as a router to handle app-specific routes. It either:
 * 1. Redirects to a dedicated page for the app (for legacy apps)
 * 2. Renders the app directly (for future integrated apps)
 */
export default function AppPage() {
  const params = useParams();
  const router = useRouter();
  const appId = params.appId;
  
  // Get the app data
  const app = getAppById(appId);
  
  useEffect(() => {
    // Handle app routing based on app ID
    if (!app) {
      // App not found, redirect to apps page
      router.push('/apps');
      return;
    }
    
    // No need to redirect anymore - all apps now follow the same URL pattern
    // App pages are now directly accessible via their ID at /apps/[appId]
    
    // For future apps, you can either:
    // 1. Load the app component directly here
    // 2. Redirect to specific pages based on app ID
    
  }, [appId, app, router]);
  
  // Show loading state while redirecting
  return (
    <div className="flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-gray-900">
      <div className="text-center">
        <h1 className="mb-4 font-hesdeadjim text-2xl font-bold text-ai-blue"
            style={{textShadow: '0 0 10px rgba(44, 117, 255, 0.7)'}}>
          Loading App...
        </h1>
        <div className="mx-auto size-16 animate-spin rounded-full border-y-4 border-ai-blue"></div>
      </div>
    </div>
  );
}