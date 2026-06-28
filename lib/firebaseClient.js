import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Only initialize Firebase in the browser — SSR prerendering must not call initializeApp
// with empty NEXT_PUBLIC_* keys (they're inlined at build time and blank until set on Railway).
const app = typeof window !== 'undefined'
  ? (getApps().length ? getApp() : initializeApp(config))
  : null

export const auth = app ? getAuth(app) : null
