'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { ProductCard } from '@/templates/ProductCard'
import { useProductCard } from '@/templates/hooks/useProductCard'

const Blob = dynamic(() => import('@/components/canvas/3dModels').then((mod) => mod.Blob), { ssr: false })
const View = dynamic(() => import('@/components/canvas/View').then((mod) => mod.View), {
  ssr: false,
  loading: () => (
    <div className='flex h-96 w-full flex-col items-center justify-center'>
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

export default function Page() {
  // Define sample product data
  const productSections = [
    {
      title: "3D Web Experiences",
      startDelay: 300,
      details: [
        { label: "Interactive Models", text: "Engaging 3D models that users can interact with." },
        { label: "Performance Optimized", text: "Fast loading times even with complex 3D elements." },
        { label: "Cross-Browser Compatible", text: "Works seamlessly across all modern browsers." }
      ]
    },
    {
      title: "React Three Integration",
      startDelay: 1500,
      details: [
        { label: "Component Based", text: "Modular 3D components that integrate with React." },
        { label: "State Management", text: "Efficient state handling for 3D objects." },
        { label: "Easy Animation", text: "Simple API for creating complex animations." }
      ]
    }
  ]
  
  // Use the product card hook
  const { showProductsCard, setShowProductsCard, toggleProductsCard } = useProductCard(productSections)
  
  return (
    <>
      <div className='mx-auto flex w-full flex-col flex-wrap items-center md:flex-row lg:w-4/5'>
        <div className='flex w-full flex-col items-start justify-center p-12 text-center md:w-2/5 md:text-left'>
          <p className='w-full uppercase'>Next + React Three Fiber</p>
          <h1 className='my-4 text-5xl font-bold leading-tight'>Next 3D Starter</h1>
          <p className='mb-8 text-2xl leading-normal'>A minimalist starter for React, React-three-fiber and Threejs.</p>
          
          {/* Button to toggle the products card */}
          <button
            onClick={toggleProductsCard}
            className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          >
            Our Products
          </button>
        </div>
      </div>

      <View className='absolute top-0 flex h-screen w-full flex-col items-center justify-center'>
        <Blob />
        <Common />
      </View>
      
      {/* Reusable Product Card component */}
      <ProductCard
        showProductsCard={showProductsCard}
        setShowProductsCard={setShowProductsCard}
        productSections={productSections}
        title="OUR AI AGENTS PRODUCTS"
        summaryText="Discover how our AI Automations solutions can transform your digital presence!"
        bgColor="bg-blue-900/95"
        titleColor="text-blue-300"
        borderColor="border-blue-500/30"
        shadowColor="shadow-[0_0_15px_rgba(59,130,246,0.3)]"
      />
    </>
  )
}
