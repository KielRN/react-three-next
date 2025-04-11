'use client'

import dynamic from 'next/dynamic'
import { Suspense, useEffect, useRef } from 'react'
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
  return (
    <div className='flex h-screen w-screen flex-col items-center justify-center bg-gradient-to-b from-black to-gray-800 text-white'>
      <div className='absolute left-5 top-5 z-10'>
        <h1 className='text-2xl font-bold'>Interactive 3D Rocket</h1>
        <p className='text-sm'>Drag to rotate • Scroll to zoom • Click to return home</p>
      </div>
      
      <View className='h-screen w-screen' orbit={false}>
        <Suspense fallback={null}>
          <Scene />
          <Rocket scale={0.6} position={[0, -10, 0]} />
          <Common color='#000' />
        </Suspense>
      </View>
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