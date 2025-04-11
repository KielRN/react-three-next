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

  return (
    <div className='flex h-screen w-screen flex-col items-center justify-center bg-gradient-to-b from-black to-gray-800 text-white'>
      <div className='absolute left-5 bottom-5 z-10'>
        <h1 className='text-2xl font-bold'>Interactive 3D</h1>
        <p className='text-sm'>Drag to rotate • Scroll to zoom • Click to return home</p>
      </div>
      
      <View className='h-screen w-screen' orbit={false}>
        <Suspense fallback={null}>
          <Scene />
          <Rocket scale={0.6} position={[0, -10, 0]} onToggleContactForm={() => setShowContactForm(prev => !prev)} />
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
