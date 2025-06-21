'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ContactForm } from '@/templates/ContactForm'

// LCARS decoration component for the header
const LCARSHeaderDecoration = () => (
  <div className="flex items-center space-x-2 mb-6">
    <div className="h-8 w-20 bg-[#ffcc00] rounded-sm" style={{boxShadow: '0 0 10px rgba(255, 204, 0, 0.7)'}}></div>
    <div className="h-16 w-3 bg-[#2c75ff] rounded-sm" style={{boxShadow: '0 0 10px rgba(44, 117, 255, 0.7)'}}></div>
    <div className="h-8 w-12 bg-[#ffcc00] rounded-sm" style={{boxShadow: '0 0 10px rgba(255, 204, 0, 0.7)'}}></div>
    <div className="h-16 w-40 bg-[#2c75ff] rounded-sm" style={{boxShadow: '0 0 10px rgba(44, 117, 255, 0.7)'}}></div>
  </div>
)

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
  )
}

// Portfolio Project Card component
const ProjectCard = ({ project }) => {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <div 
      className="bg-gray-900 rounded-lg overflow-hidden border border-[#2c75ff]/30 transform transition-all duration-300"
      style={{
        boxShadow: isHovered ? 
          '0 0 20px rgba(44, 117, 255, 0.5)' : 
          '0 0 10px rgba(44, 117, 255, 0.3)',
        transform: isHovered ? 'scale(1.02)' : 'scale(1)'
      }}
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
        
        <p className="text-gray-300 mb-4 leading-relaxed">
          {project.description}
        </p>
        
        <a 
          href={project.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block bg-[#0e2042] text-[#ffcc00] px-6 py-2 transition-colors duration-300 font-hesdeadjim uppercase tracking-wider hover:bg-[#2c75ff] hover:text-white"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)',
            textShadow: '0 0 5px rgba(255, 204, 0, 0.7)',
            boxShadow: '0 0 10px rgba(44, 117, 255, 0.4)'
          }}
        >
          Visit Website
        </a>
      </div>
    </div>
  )
}

// Portfolio data with project information
const portfolioProjects = [
  {
    id: 1,
    title: "TINTI Documentary",
    description: "An emotionally charged documentary website that captures the resilient spirit of Puerto Rico during one of its most critical moments in recent history.",
    image: "/img/tinti-documentary.png",
    url: "https://tintidocumental.com"
  },
  {
    id: 2,
    title: "Tommy Zion E-commerce",
    description: "A modern e-commerce platform built with Next.js and Shopify, featuring a seamless shopping experience with secure payment processing.",
    image: "/img/tommy-zion.png",
    url: "https://tommy-zion-ecommerce-v2-production.up.railway.app/"
  },
  {
    id: 3,
    title: "Sam Texas Realtor",
    description: "A professional real estate website showcasing property listings, neighborhood information, and seamless client contact options.",
    image: "/img/sam-texas-realtor.png",
    url: "https://samtexasrealtor.com/"
  },
  {
    id: 4,
    title: "Cervera Construction",
    description: "A construction company website highlighting services, past projects, and company information with an elegant, responsive design.",
    image: "/img/cervera-construction.png",
    url: "https://cerveraconstruction.com/"
  }
,
  {
    id: 5,
    title: "GQ Masonry",
    description: "A San Antonio based contractor specializing in masonry services. Website includes a portfolio of their work and contact information.",
    image: "/img/gqmasonry.jpg",
    url: "https://gqmasonry.com/"
  }
]

// Main Portfolio Content component
export default function PortfolioContent() {
  const [showContactForm, setShowContactForm] = useState(false)

  return (
    <div className="relative min-h-screen bg-gray-900 w-full overflow-x-hidden -mt-[1px]">
      <PortfolioHeader />
      
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {portfolioProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
        
        {/* Call to action section */}
        <div className="mt-16 text-center">
          <div className="bg-gray-800/50 rounded-lg p-8 border border-[#2c75ff]/30"
            style={{boxShadow: '0 0 15px rgba(44, 117, 255, 0.3)'}}>
            <h2 className="text-3xl font-bold text-[#ffcc00] mb-4 font-hesdeadjim"
              style={{textShadow: '0 0 5px rgba(255, 204, 0, 0.5)'}}>
              Ready to Start Your Project?
            </h2>
            <p className="text-gray-300 mb-6 text-lg">
              Let's discuss how we can bring your vision to life with cutting-edge technology and innovative design.
            </p>
            <button
              onClick={() => setShowContactForm(true)}
              className="inline-block bg-[#0e2042] text-[#ffcc00] px-8 py-3 transition-colors duration-300 font-hesdeadjim uppercase tracking-wider hover:bg-[#2c75ff] hover:text-white"
              style={{
                clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)',
                textShadow: '0 0 5px rgba(255, 204, 0, 0.7)',
                boxShadow: '0 0 10px rgba(44, 117, 255, 0.4)'
              }}
            >
              Contact Us
            </button>
          </div>
        </div>
      </main>
      <ContactForm
        isVisible={showContactForm}
        onClose={() => setShowContactForm(false)}
        hookUrl={process.env.NEXT_PUBLIC_CONTACT_WEBHOOK}
        title="CONTACT US"
        position="center"
        theme={{
          primary: "#ebcb4c",
          background: "bg-gray-900/90",
          border: "border-[#ebcb4c]/30",
          shadow: "shadow-[0_0_15px_rgba(235,203,76,0.3)]"
        }}
      />
    </div>
  )
}