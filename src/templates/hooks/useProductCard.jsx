'use client'

import { useState } from 'react'

/**
 * A hook to manage product card state and data
 * 
 * @param {Array} initialSections - Initial product sections data
 * @returns {Object} - Object containing state and methods for the product card
 */
export function useProductCard(initialSections = []) {
  const [showProductsCard, setShowProductsCard] = useState(false)
  
  const toggleProductsCard = () => setShowProductsCard(prev => !prev)
  
  return {
    showProductsCard,
    setShowProductsCard,
    toggleProductsCard,
    productSections: initialSections
  }
}