# Portfolio Page Implementation Plan

## Overview

This document outlines the implementation plan for adding a portfolio page to the Texas AI Consulting website. The portfolio will showcase client projects with images and links to live websites, following the existing LCARS/Star Trek-inspired design.

## Implementation Steps

### 1. Create Portfolio Page

Create a new page at `/app/portfolio/page.jsx` with the following structure:

```jsx
'use client'

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// LCARS decoration component for the header (similar to BlogHeader)
const LCARSHeaderDecoration = () => (
  <div className="flex items-center space-x-2 mb-6">
    <div className="h-8 w-20 bg-[#ffcc00] rounded-sm" style={{boxShadow: '0 0 10px rgba(255, 204, 0, 0.7)'}}></div>
    <div className="h-16 w-3 bg-[#2c75ff] rounded-sm" style={{boxShadow: '0 0 10px rgba(44, 117, 255, 0.7)'}}></div>
    <div className="h-8 w-12 bg-[#ffcc00] rounded-sm" style={{boxShadow: '0 0 10px rgba(255, 204, 0, 0.7)'}}></div>
    <div className="h-16 w-40 bg-[#2c75ff] rounded-sm" style={{boxShadow: '0 0 10px rgba(44, 117, 255, 0.7)'}}></div>
  </div>
);

// Portfolio Header component
const PortfolioHeader = () => {
  return (
    <div className="text-white py-16" style={{
      backgroundImage: 'linear-gradient(to right, rgba(0,10,30,0.9), rgba(0,0,0,0.95))',
      borderBottom: '2px solid #2c75ff',
      boxShadow: '0 0 15px rgba(44, 117, 255, 0.5)'
    }}>
      <div className="container mx-auto px-4 max-w-4xl">
        <LCARSHeaderDecoration />
        
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#2c75ff] font-hesdeadjim"
          style={{textShadow: '0 0 10px rgba(44, 117, 255, 0.7)'}}>
          Portfolio
        </h1>
        
        <p className="text-xl opacity-90 mb-8 text-gray-200">
          Explore our recent client success stories
        </p>
        
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="bg-[#0e2042] text-[#ffcc00] px-8 py-2 transition-colors duration-300 font-hesdeadjim uppercase tracking-wider"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)',
              textShadow: '0 0 5px rgba(255, 204, 0, 0.7)',
              boxShadow: '0 0 10px rgba(44, 117, 255, 0.4)'
            }}
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
};

// Portfolio Project Card component
const ProjectCard = ({ project }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div 
      className="bg-gray-900 rounded-lg overflow-hidden border border-[#2c75ff]/30"
      style={{
        boxShadow: isHovered ? 
          '0 0 20px rgba(44, 117, 255, 0.5)' : 
          '0 0 10px rgba(44, 117, 255, 0.3)'
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-64 overflow-hidden">
        <img 
          src={project.image} 
          alt={project.title} 
          className="w-full h-full object-cover transition-all duration-500"
          style={{
            transform: isHovered ? 'scale(1.05)' : 'scale(1)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-70"></div>
      </div>
      
      <div className="p-6">
        <h3 className="text-2xl font-bold text-[#ffcc00] mb-3 font-hesdeadjim"
          style={{textShadow: '0 0 5px rgba(255, 204, 0, 0.5)'}}>
          {project.title}
        </h3>
        
        <p className="text-gray-300 mb-4">
          {project.description}
        </p>
        
        <a 
          href={project.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block bg-[#0e2042] text-[#ffcc00] px-6 py-2 transition-colors duration-300 font-hesdeadjim uppercase tracking-wider"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)',
            textShadow: '0 0 5px rgba(255, 204, 0, 0.7)',
            boxShadow: '0 0 10px rgba(44, 117, 255, 0.4)'
          }}
        >
          Visit Website
        </a>
      </div>
    </motion.div>
  );
};

// Portfolio data with project information
const portfolioProjects = [
  {
    id: 1,
    title: "Tommy Zion E-commerce",
    description: "A modern e-commerce platform built with Next.js and Shopify, featuring a seamless shopping experience with secure payment processing.",
    image: "/img/tommy-zion.png",
    url: "https://tommy-zion-ecommerce-v2-production.up.railway.app/"
  },
  {
    id: 2,
    title: "Sam Texas Realtor",
    description: "A professional real estate website showcasing property listings, neighborhood information, and seamless client contact options.",
    image: "/img/sam-texas-realtor.png",
    url: "https://samtexasrealtor.com/"
  },
  {
    id: 3,
    title: "Cervera Construction",
    description: "A construction company website highlighting services, past projects, and company information with an elegant, responsive design.",
    image: "/img/cervera-construction.png",
    url: "https://cerveraconstruction.com/"
  }
];

// Main Portfolio Page component
export default function PortfolioPage() {
  // Add any required state or effects here
  
  return (
    <div className="min-h-screen bg-gray-900 w-full overflow-x-hidden -mt-[1px]">
      <PortfolioHeader />
      
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {portfolioProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </main>
    </div>
  );
}
```

### 2. Update Navigation Component

Update the `navLinks` array in `src/components/dom/Navigation.jsx` to include the Portfolio page link:

```jsx
const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Blog', path: '/blog' },
  { name: 'Portfolio', path: '/portfolio' },
  // Add other navigation links as needed
]
```

### 3. Responsive Considerations

The portfolio page should be responsive with the following breakpoints:
- Mobile: Single column layout (1 card per row)
- Tablet (md): Two column layout (2 cards per row)
- Desktop (lg): Three column layout (3 cards per row)

### 4. Animation and Interactivity

- Use hover effects on cards to create an engaging user experience
- Implement smooth transitions between states
- Ensure all links open in new tabs with proper security attributes

### 5. Accessibility Features

- All images should have proper alt text
- Interactive elements should have proper ARIA attributes
- Color contrast should meet WCAG standards

## Project Data Details

### Tommy Zion
- Image: `/img/tommy-zion.png`
- URL: `https://tommy-zion-ecommerce-v2-production.up.railway.app/`
- Description: A modern e-commerce platform built with Next.js and Shopify, featuring a seamless shopping experience with secure payment processing.

### Sam Texas Realtor
- Image: `/img/sam-texas-realtor.png`
- URL: `https://samtexasrealtor.com/`
- Description: A professional real estate website showcasing property listings, neighborhood information, and seamless client contact options.

### Cervera Construction
- Image: `/img/cervera-construction.png`
- URL: `https://cerveraconstruction.com/`
- Description: A construction company website highlighting services, past projects, and company information with an elegant, responsive design.

## Design System

The portfolio page will follow the existing LCARS/Star Trek-inspired design system:

### Colors
- Primary blue: #2c75ff
- Accent yellow: #ffcc00
- Dark background: #0e2042
- Text: White or light gray

### Typography
- Headers: Font-hesdeadjim (custom font)
- Body: System sans-serif

### UI Elements
- Clipped polygon buttons
- Glowing borders and text shadows
- Subtle hover animations
- Consistent spacing

## Next Steps

After implementing this plan:

1. Create the portfolio page component following this specification
2. Update the navigation to include the portfolio link
3. Test the page on multiple devices to ensure responsiveness
4. Ensure all links work correctly and open in new tabs