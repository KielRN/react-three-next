'use client'

import dynamic from 'next/dynamic'
import { Suspense, useEffect, useRef, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { useTypewriter } from '@/templates/hooks/useTypewriter'

// Dynamically import components with SSR disabled
const Rocket = dynamic(() => import('@/components/canvas/3dModels').then((mod) => mod.Rocket), { ssr: false })
const View = dynamic(() => import('@/components/canvas/View').then((mod) => mod.View), {
  ssr: false,
  loading: () => (
    <div className='flex h-screen w-full flex-col items-center justify-center'>
      <svg className='-ml-1 mr-3 h-5 w-5 animate-spin text-black' fill='none' viewBox='0 0 24 24'>
        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
        <path
          className='opacity-75'
          fill='currentColor'
          d='M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
        />
      </svg>
    </div>
  ),
})
const Common = dynamic(() => import('@/components/canvas/View').then((mod) => mod.Common), { ssr: false })
const OrbitControls = dynamic(() => import('@react-three/drei').then((mod) => mod.OrbitControls), { ssr: false })
const PerspectiveCamera = dynamic(() => import('@react-three/drei').then((mod) => mod.PerspectiveCamera), { ssr: false })

export default function RocketPage() {
  const [showContactForm, setShowContactForm] = useState(false)
  const [showProductsCard, setShowProductsCard] = useState(false)

  return (
    <div className='flex h-screen w-screen flex-col items-center justify-center bg-gradient-to-b from-black to-gray-800 text-white'>
      <div className='absolute left-5 top-5 z-10'>
        <img src='/img/Texas-AI-Consulting-Logo1000x1000.png' alt='Texas AI Consulting Logo' className='h-32 w-auto' />
      </div>
      <div className='absolute left-5 bottom-5 z-10'>
<img src='/img/Texas-AI-Consulting-ST-Logo-ICON.png' alt='Texas AI Consulting Logo' className='h-10 w-auto mb-2' />
        <h1 className='text-2xl font-bold'>Interactive 3D</h1>
        <p className='text-sm'>Drag to rotate • Scroll to zoom • Click to return home</p>
      </div>
      
      <View className='h-screen w-screen' orbit={false}>
        <Suspense fallback={null}>
          <Scene />
          <Rocket
            scale={0.6}
            position={[0, -10, 0]}
            onToggleContactForm={() => setShowContactForm(prev => !prev)}
            onToggleProductsCard={() => setShowProductsCard(prev => !prev)}
          />
          <Common color='#000' />
        </Suspense>
      </View>
      <div className={`absolute right-10 bottom-20 bg-gray-900/90 backdrop-blur-md p-8 rounded-lg z-20 w-96 border border-[#ebcb4c]/30 shadow-[0_0_15px_rgba(235,203,76,0.3)]
        transform transition-all duration-500 ease-in-out ${showContactForm
          ? 'opacity-100 translate-x-0 scale-100'
          : 'opacity-0 translate-x-20 scale-95 pointer-events-none'}`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#ebcb4c] italic tracking-wider" style={{ fontFamily: "'Arial Black', 'Arial Bold', sans-serif" }}>
            <span className="inline-block animate-pulse-slow">C</span>
            <span className="inline-block">O</span>
            <span className="inline-block">N</span>
            <span className="inline-block">T</span>
            <span className="inline-block">A</span>
            <span className="inline-block">C</span>
            <span className="inline-block">T</span>
            <span className="inline-block"> </span>
            <span className="inline-block ml-2">U</span>
            <span className="inline-block">S</span>
          </h2>
          <button
            className="text-[#ebcb4c] hover:text-white transition-colors transform hover:rotate-90 duration-300"
            onClick={() => setShowContactForm(false)}
            aria-label="Close contact form"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          // Placeholder for future hook
          console.log('Form submitted');
          // Show success message or close form
          setShowContactForm(false);
        }}>
          <div className="mb-5 transform transition-all duration-300 hover:translate-x-1">
            <label className="block text-[#ebcb4c] text-sm font-bold mb-2 tracking-wider" style={{ fontFamily: "'Arial Black', 'Arial Bold', sans-serif" }} htmlFor="name">
              NAME
            </label>
            <input
              className="bg-gray-800 border-2 border-gray-700 focus:border-[#ebcb4c] text-white rounded-md w-full py-3 px-4
                transition-all duration-300 focus:outline-none focus:shadow-[0_0_8px_rgba(235,203,76,0.5)] hover:border-gray-600"
              id="name"
              type="text"
              required
              placeholder="Your name"
            />
          </div>
          
          <div className="mb-5 transform transition-all duration-300 hover:translate-x-1">
            <label className="block text-[#ebcb4c] text-sm font-bold mb-2 tracking-wider" style={{ fontFamily: "'Arial Black', 'Arial Bold', sans-serif" }} htmlFor="email">
              EMAIL
            </label>
            <input
              className="bg-gray-800 border-2 border-gray-700 focus:border-[#ebcb4c] text-white rounded-md w-full py-3 px-4
                transition-all duration-300 focus:outline-none focus:shadow-[0_0_8px_rgba(235,203,76,0.5)] hover:border-gray-600"
              id="email"
              type="email"
              required
              placeholder="your.email@example.com"
            />
          </div>
          
          <div className="mb-6 transform transition-all duration-300 hover:translate-x-1">
            <label className="block text-[#ebcb4c] text-sm font-bold mb-2 tracking-wider" style={{ fontFamily: "'Arial Black', 'Arial Bold', sans-serif" }} htmlFor="message">
              MESSAGE
            </label>
            <textarea
              className="bg-gray-800 border-2 border-gray-700 focus:border-[#ebcb4c] text-white rounded-md w-full py-3 px-4
                transition-all duration-300 focus:outline-none focus:shadow-[0_0_8px_rgba(235,203,76,0.5)] hover:border-gray-600 min-h-[120px]"
              id="message"
              rows="4"
              required
              placeholder="Your message here..."
            ></textarea>
          </div>
          
          <div className="text-center">
            <button
              className="bg-[#ebcb4c] hover:bg-[#f6da6a] text-gray-900 font-bold py-3 px-6 rounded-md
                focus:outline-none focus:shadow-outline w-full transition-all duration-300
                transform hover:scale-105 active:scale-95 shadow-[0_0_10px_rgba(235,203,76,0.3)]"
              type="submit"
              style={{ fontFamily: "'Arial Black', 'Arial Bold', sans-serif" }}
            >
              SEND MESSAGE
            </button>
          </div>
        </form>
      </div>

      {/* Our Products Card */}
      <div className={`fixed inset-0 flex items-center justify-center z-30 ${showProductsCard ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div className={`bg-gray-900/95 backdrop-blur-md p-10 rounded-lg z-30 w-3/4 max-w-3xl border border-[#ebcb4c]/30 shadow-[0_0_15px_rgba(235,203,76,0.3)]
          transform transition-all duration-500 ease-in-out ${showProductsCard
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95'}`}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#ebcb4c] italic tracking-wider" style={{ fontFamily: "'Arial Black', 'Arial Bold', sans-serif" }}>
              <span className="inline-block animate-pulse-slow">O</span>
              <span className="inline-block">U</span>
              <span className="inline-block">R</span>
              <span className="inline-block"> </span>
              <span className="inline-block ml-2">P</span>
              <span className="inline-block">R</span>
              <span className="inline-block">O</span>
              <span className="inline-block">D</span>
              <span className="inline-block">U</span>
              <span className="inline-block">C</span>
              <span className="inline-block">T</span>
              <span className="inline-block">S</span>
            </h2>
            <button
              className="text-[#ebcb4c] hover:text-white transition-colors transform hover:rotate-90 duration-300"
              onClick={() => setShowProductsCard(false)}
              aria-label="Close products card"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="text-white overflow-y-auto max-h-[70vh] markdown-content">
            {showProductsCard && <ProductsContent />}
          </div>
        </div>
      </div>
    </div>
  )
}

// Move camera setup to a dedicated component with camera reset logic
function Scene() {
  const controlsRef = useRef()
  const { camera } = useThree()
  
  useEffect(() => {
    // Function to reset the camera and controls
    const resetView = () => {
      if (camera) {
        camera.position.set(0, 15, 25)
        camera.updateProjectionMatrix()
      }
      
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 5, 0)
        controlsRef.current.update()
      }
    }
    
    // Reset camera when component mounts
    resetView()
    
    // Reset when returning to the page
    window.addEventListener('focus', resetView)
    
    return () => {
      window.removeEventListener('focus', resetView)
    }
  }, [camera])
  
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 15, 25]} fov={40} />
      <OrbitControls 
        ref={controlsRef}
        makeDefault 
        enableDamping 
        dampingFactor={0.21} 
        target={[0, 5, 0]}
      />
    </>
  )
}

// DetailItem component to handle individual product details
function DetailItem({ detail, index, sectionIndex, baseDelay, isVisible }) {
  // Separate typewriter effects for label and content
  const { displayText: labelText, isDone: labelDone } = useTypewriter(
    isVisible ? detail.label : '',
    15,
    baseDelay + (300 * index)
  );
  
  const { displayText: contentText, isDone: contentDone } = useTypewriter(
    isVisible && labelDone ? detail.text : '',
    15,
    0 // Start immediately after label is done
  );
  
  if (!isVisible) return null;
  
  return (
    <div className="flex items-start">
      <div className="flex-1">
        <span className="font-medium text-[#6c97a5] font-mono">{labelText}</span>
        {labelDone && <span className="font-mono">: </span>}
        <span className="ml-1 font-mono">{contentText}</span>
      </div>
      <span className={`inline-block w-2 h-4 bg-[#ebcb4c] ml-1 self-center ${labelDone && contentDone ? 'opacity-0' : 'animate-blink-slow'}`}></span>
    </div>
  );
}

// TypedSection component to handle each product section
function TypedSection({ title, details, startDelay, sectionIndex }) {
  const { displayText: titleText, isDone: titleDone } = useTypewriter(title, 30, startDelay);
  const [showDetails, setShowDetails] = useState(false);
  
  useEffect(() => {
    if (titleDone) {
      setShowDetails(true);
    }
  }, [titleDone]);
  
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-[#ebcb4c] mb-3 text-center flex items-center justify-center font-mono">
        {titleText}
        <span className={`inline-block w-2 h-5 bg-[#ebcb4c] ml-1 ${titleDone ? 'animate-blink-slow' : 'opacity-0'}`}></span>
      </h2>
      
      <div className="space-y-4">
        {details.map((detail, index) => (
          <DetailItem
            key={`${sectionIndex}-${index}`}
            detail={detail}
            index={index}
            sectionIndex={sectionIndex}
            baseDelay={startDelay}
            isVisible={showDetails}
          />
        ))}
      </div>
    </div>
  );
}

// ProductsContent component with typewriter effect
function ProductsContent() {
  
  // Final summary message
  const { displayText: summaryText, isDone: summaryDone } = useTypewriter(
    "Contact us today to learn how our AI products can transform your business!",
    30,
    5500 // Start after earlier content has likely finished
  );

  // Product sections data
  const productSections = [
    {
      title: "Closer Agent (Sales & Revenue)",
      startDelay: 300,
      details: [
        { label: "Lead Intelligence", text: "Auto-qualifies and researches potential customers." },
        { label: "Closing Support", text: "Summarizes past conversations for better sales outcomes." },
        { label: "Qualifying Bot", text: "Manages initial customer interactions and schedules appointments." }
      ]
    },
    {
      title: "Assistant Agent (Executive Support)",
      startDelay: 1500,
      details: [
        { label: "Email Sorting", text: "Automatically manages and categorizes incoming emails." },
        { label: "Calendar Management", text: "Optimizes schedules and handles appointment changes efficiently." },
        { label: "Booking Management", text: "Automates travel and reservation tasks." }
      ]
    },
    {
      title: "Workflow Agent (Operations & Productivity)",
      startDelay: 2700,
      details: [
        { label: "System Creator Bot", text: "Creates and maintains standard procedures and checklists." },
        { label: "Office Manager Bot", text: "Manages daily tasks such as scheduling and expense tracking." },
        { label: "Customer Support Bot", text: "Handles routine support inquiries, allowing teams to focus on complex issues." }
      ]
    },
    {
      title: "Amplifier Agent (Marketing & Content Creation)",
      startDelay: 3900,
      details: [
        { label: "Content Analysis", text: "Reviews content to identify successful strategies." },
        { label: "Content Checker", text: "Ensures consistency with brand voice and style." },
        { label: "Content Creation", text: "Generates engaging multi-format content to reach wider audiences." }
      ]
    },
    {
      title: "Money Agent (Financial Management)",
      startDelay: 5100,
      details: [
        { label: "Cash Flow Bot", text: "Real-time cash monitoring and forecasting." },
        { label: "Payment Bot", text: "Streamlines invoice processing and financial entries." },
        { label: "Fraud Detection Bot", text: "Identifies and prevents unusual financial activities." }
      ]
    }
  ];

  return (
    <>
      {productSections.map((section, index) => (
        <TypedSection
          key={index}
          title={section.title}
          details={section.details}
          startDelay={section.startDelay}
          sectionIndex={index}
        />
      ))}
      
      <p className="mt-8 text-[#ebcb4c] font-bold text-lg text-center flex items-center justify-center font-mono">
        {summaryText}
        <span className={`inline-block w-2 h-5 bg-[#ebcb4c] ml-1 ${summaryDone ? 'animate-blink-slow' : 'opacity-0'}`}></span>
      </p>
    </>
  );
}
