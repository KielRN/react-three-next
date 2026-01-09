# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js application for Texas AI Consulting that combines traditional web pages with immersive 3D experiences using React Three Fiber. The project is built on the react-three-next starter template, which enables seamless navigation between pages with dynamic DOM and canvas content without reloading or recreating the canvas.

## Development Commands

```bash
# Development
npm run dev              # Start development server (Next.js dev mode)

# Building
npm run build            # Production build
npm run analyze          # Build with bundle analyzer enabled
npm start               # Start production server

# Code Quality
npm run lint            # Run ESLint with auto-fix on app directory
```

## Key Architecture Patterns

### 3D Canvas Integration with tunnel-rat

The application uses `tunnel-rat` to portal 3D components between separate renderers. This is the core architectural pattern:

1. **Global tunnel instance** ([src/helpers/global.js](src/helpers/global.js)): Creates a single `r3f` tunnel used throughout the app
2. **Scene component** ([src/components/canvas/Scene.jsx](src/components/canvas/Scene.jsx)): Fixed-position Canvas that persists across route changes, renders `<r3f.Out />`
3. **Layout integration** ([src/components/dom/Layout.jsx](src/components/dom/Layout.jsx)): Scene is mounted in Layout with `pointer-events: none` and uses `gl.scissor` for viewport segmentation
4. **View component** ([src/components/canvas/View.jsx](src/components/canvas/View.jsx)): Wraps 3D content with `<Three>` component which renders `<r3f.In>` to portal content into the Scene canvas

**Usage pattern:**
```jsx
<View orbit className='relative h-48 w-full'>
  <YourThreeJSComponent />
</View>
```

This architecture ensures the WebGL context persists between page navigations while allowing 3D content to be embedded anywhere in the DOM.

### Path Aliases

The project uses `@/*` path alias (configured in [jsconfig.json](jsconfig.json)) that resolves to both `app/*` and `src/*` directories:
- `@/components/...` → `src/components/...`
- `@/helpers/...` → `src/helpers/...`
- When importing from app directory (e.g., layouts), use `@/components/dom/Layout`

### App Directory Structure

- [app/](app/) - Next.js app directory with routes and pages
  - [app/layout.jsx](app/layout.jsx) - Root layout with metadata, fonts, and Google Analytics
  - [app/page.jsx](app/page.jsx) - Homepage
  - [app/blog/](app/blog/) - Blog listing and individual post routes
  - [app/api/contact/](app/api/contact/) - Contact form API route
  - Other routes: `/apps`, `/portfolio`, `/elliott-card`, `/blob`

- [src/components/](src/components/) - React components organized by type
  - `canvas/` - 3D React Three Fiber components (Scene, View, 3D models)
  - `dom/` - Regular DOM components (Layout, Navigation)
  - `blog/` - Blog-specific components (BlogHeader, BlogList, etc.)
  - `app-page-components/` - Components for the /apps page
  - `mini-apps/` - Interactive mini-application components
  - `portfolio/` - Portfolio-specific components
  - `mdx/` - MDX-specific components

- [src/templates/](src/templates/) - Reusable templates (ContactForm, ProductCard, Scroll, Shader)

- [src/data/](src/data/) - Static data files

- [src/helpers/](src/helpers/) - Helper utilities and shared components

### Blog System

The blog system supports both `.md` and `.mdx` files:

- **Content location**: [content/blog/](content/blog/)
- **Server-side utilities**: [lib/blog.js](lib/blog.js) contains `'use server'` functions for reading blog posts
- **Key functions**:
  - `getBlogPostBySlug(slug)` - Fetches single post, auto-detects .md vs .mdx
  - `getAllBlogPosts()` - Returns all posts sorted by date
  - `getAllTags()` - Extracts unique tags from all posts
  - `getBlogPostsByTag(tag)` - Filters posts by tag

**Blog post frontmatter format:**
```yaml
---
title: "Post Title"
date: "2025-01-09"
author: "Author Name"
excerpt: "Brief description"
tags: ["tag1", "tag2"]
image: "/path/to/image.jpg"
---
```

**MDX Component Customization**: Custom MDX component styling is defined in [mdx-components.jsx](mdx-components.jsx) at the root level (not in app or src).

## Configuration Files

- [next.config.js](next.config.js) - Next.js configuration with:
  - PWA support (`@ducanh2912/next-pwa`)
  - MDX support (`@next/mdx`)
  - Bundle analyzer
  - Custom webpack loaders for GLSL shaders (`.glsl`, `.vs`, `.fs`, `.vert`, `.frag`) and audio files
  - `output: 'standalone'` for containerized deployments (Railway)
  - ESLint disabled during builds (Railway treats warnings as errors)

- [tailwind.config.js](tailwind.config.js) - Custom theme with Texas AI brand colors:
  - `ai-primary`: #000000
  - `ai-gold`: #ebcb4c
  - `ai-blue`: #2c75ff
  - `ai-navy`: #0e2042
  - Custom font: `font-hesdeadjim` (Arial Black)

- [.eslintrc](.eslintrc) - ESLint extends next, prettier, and tailwindcss plugins

- [.prettierrc](.prettierrc) - Code formatting with single quotes, no semicolons, 120 char line width

## Deployment

Configured for Railway deployment:
- Uses `output: 'standalone'` in Next.js config
- [Procfile](Procfile) and [railway.json](railway.json) define deployment settings
- Environment variables should be set in Railway dashboard

## Styling

- Tailwind CSS with JIT mode
- Custom animations: `pulse-slow`, `blink-slow`
- Global styles in [app/global.css](app/global.css)
- Font: Space Mono (loaded via next/font/google in layout)

## Special Features

- **PWA Support**: Progressive Web App enabled via `@ducanh2912/next-pwa` (disabled in development)
- **GLSL Shader Support**: Import `.glsl` files directly using raw-loader and glslify-loader
- **React Three Fiber**: 3D rendering with `@react-three/fiber` and `@react-three/drei`
- **MDX Support**: Both `.md` and `.mdx` files supported for blog posts with custom component styling
