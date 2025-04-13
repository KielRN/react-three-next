'use client'

import { useEffect, useState } from 'react'
import { useTypewriter } from '@/templates/hooks/useTypewriter'

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
function ProductsContent({ productSections, summaryText = "Contact us today to learn how our AI products can transform your business!" }) {
  // Final summary message
  const { displayText: displaySummaryText, isDone: summaryDone } = useTypewriter(
    summaryText,
    30,
    5500 // Start after earlier content has likely finished
  );

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
        {displaySummaryText}
        <span className={`inline-block w-2 h-5 bg-[#ebcb4c] ml-1 ${summaryDone ? 'animate-blink-slow' : 'opacity-0'}`}></span>
      </p>
    </>
  );
}

/**
 * A reusable product card component
 * 
 * @param {boolean} showProductsCard - Whether to show the products card
 * @param {function} setShowProductsCard - Function to set the show state
 * @param {Array} productSections - Array of product sections data
 * @param {string} title - Title for the product card
 * @param {string} summaryText - Summary text to display at the bottom
 * @param {string} bgColor - Background color for the card
 * @param {string} titleColor - Color for the title text
 * @param {string} borderColor - Color for the card border
 * @param {string} shadowColor - Color for the card shadow
 */
export function ProductCard({ 
  showProductsCard, 
  setShowProductsCard, 
  productSections,
  title = "OUR PRODUCTS",
  summaryText,
  bgColor = "bg-gray-900/95",
  titleColor = "text-[#ebcb4c]",
  borderColor = "border-[#ebcb4c]/30",
  shadowColor = "shadow-[0_0_15px_rgba(235,203,76,0.3)]"
}) {
  // Split title into characters for the animated display
  const titleChars = title.split('');
  
  return (
    <div className={`fixed inset-0 flex items-center justify-center z-30 ${showProductsCard ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <div className={`${bgColor} backdrop-blur-md p-10 rounded-lg z-30 w-3/4 max-w-3xl border ${borderColor} ${shadowColor}
        transform transition-all duration-500 ease-in-out ${showProductsCard
          ? 'opacity-100 scale-100'
          : 'opacity-0 scale-95'}`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${titleColor} italic tracking-wider`} style={{ fontFamily: "'Arial Black', 'Arial Bold', sans-serif" }}>
            {titleChars.map((char, index) => (
              <span key={index} className={`inline-block ${index === 0 ? 'animate-pulse-slow' : ''} ${char === ' ' ? 'ml-2' : ''}`}>
                {char}
              </span>
            ))}
          </h2>
          <button
            className={`${titleColor} hover:text-white transition-colors transform hover:rotate-90 duration-300`}
            onClick={() => setShowProductsCard(false)}
            aria-label="Close products card"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="text-white overflow-y-auto max-h-[70vh] markdown-content">
          {showProductsCard && <ProductsContent productSections={productSections} summaryText={summaryText} />}
        </div>
      </div>
    </div>
  );
}