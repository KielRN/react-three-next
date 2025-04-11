'use client'

import dynamic from 'next/dynamic'
import { Suspense, useEffect, useRef, useState } from 'react'
import { useThree } from '@react-three/fiber'

// Dynamically import components with SSR disabled
const Rocket = dynamic(() => import('@/components/canvas/Examples').then((mod) => mod.Rocket), { ssr: false })
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
   

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#ebcb4c] mb-3 text-center">Closer Agent (Sales & Revenue)</h2>
            <div className="space-y-4">
              <div>
                <span className="font-medium text-[#6c97a5]">Lead Intelligence:</span>
                <span className="ml-1">Auto-qualifies and researches potential customers.</span>
              </div>
              <div>
                <span className="font-medium text-[#6c97a5]">Closing Support:</span>
                <span className="ml-1">Summarizes past conversations for better sales outcomes.</span>
              </div>
              <div>
                <span className="font-medium text-[#6c97a5]">Qualifying Bot:</span>
                <span className="ml-1">Manages initial customer interactions and schedules appointments.</span>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#ebcb4c] mb-3 text-center">Assistant Agent (Executive Support)</h2>
            <div className="space-y-4">
              <div>
                <span className="font-medium text-[#6c97a5]">Email Sorting:</span>
                <span className="ml-1">Automatically manages and categorizes incoming emails.</span>
              </div>
              <div>
                <span className="font-medium text-[#6c97a5]">Calendar Management:</span>
                <span className="ml-1">Optimizes schedules and handles appointment changes efficiently.</span>
              </div>
              <div>
                <span className="font-medium text-[#6c97a5]">Booking Management:</span>
                <span className="ml-1">Automates travel and reservation tasks.</span>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#ebcb4c] mb-3 text-center">Workflow Agent (Operations & Productivity)</h2>
            <div className="space-y-4">
              <div>
                <span className="font-medium text-[#6c97a5]">System Creator Bot:</span>
                <span className="ml-1">Creates and maintains standard procedures and checklists.</span>
              </div>
              <div>
                <span className="font-medium text-[#6c97a5]">Office Manager Bot:</span>
                <span className="ml-1">Manages daily tasks such as scheduling and expense tracking.</span>
              </div>
              <div>
                <span className="font-medium text-[#6c97a5]">Customer Support Bot:</span>
                <span className="ml-1">Handles routine support inquiries, allowing teams to focus on complex issues.</span>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#ebcb4c] mb-3 text-center">Amplifier Agent (Marketing & Content Creation)</h2>
            <div className="space-y-4">
              <div>
                <span className="font-medium text-[#6c97a5">Content Analysis:</span>
                <span className="ml-1">Reviews content to identify successful strategies.</span>
              </div>
              <div>
                <span className="font-medium text-[#6c97a5]">Content Checker:</span>
                <span className="ml-1">Ensures consistency with brand voice and style.</span>
              </div>
              <div>
                <span className="font-medium text-[#6c97a5]">Content Creation:</span>
                <span className="ml-1">Generates engaging multi-format content to reach wider audiences.</span>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#ebcb4c] mb-3 text-center">Money Agent (Financial Management)</h2>
            <div className="space-y-4">
              <div>
                <span className="font-medium text-[#6c97a5]">Cash Flow Bot:</span>
                <span className="ml-1">Real-time cash monitoring and forecasting.</span>
              </div>
              <div>
                <span className="font-medium text-[#6c97a5]">Payment Bot:</span>
                <span className="ml-1">Streamlines invoice processing and financial entries.</span>
              </div>
              <div>
                <span className="font-medium text-[#6c97a5]">Fraud Detection Bot:</span>
                <span className="ml-1">Identifies and prevents unusual financial activities.</span>
              </div>
            </div>
          </div>

          <p className="mt-8 text-[#ebcb4c] font-bold text-lg text-center">Contact us today to learn how our AI products can transform your business!</p>
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
