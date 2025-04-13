'use client'

import { useState, useEffect, useRef } from 'react'

/**
 * A hook that creates a typewriter effect, typing text character by character
 *
 * @param {string} text - The text to be typed
 * @param {number} speed - Typing speed in milliseconds per character
 * @param {number} delay - Initial delay before starting to type
 * @returns {object} - Object containing the displayed text and whether typing is done
 */
export function useTypewriter(text = '', speed = 40, delay = 0) {
  const [displayText, setDisplayText] = useState('')
  const [isDone, setIsDone] = useState(false)
  const indexRef = useRef(0)
  const timeoutRef = useRef(null)
  const isActive = useRef(true)
  
  // Clear timeout on unmount or when dependencies change
  const clearTimeoutRef = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }
  
  useEffect(() => {
    // Reset state when text changes
    setDisplayText('')
    setIsDone(false)
    indexRef.current = 0
    isActive.current = true
    
    // Clear any existing timeout
    clearTimeoutRef()
    
    // Function to type the next character
    function typeNextChar() {
      if (!isActive.current) return;
      
      if (indexRef.current < text.length) {
        setDisplayText(text.substring(0, indexRef.current + 1))
        indexRef.current++;
        
        // Schedule the next character
        timeoutRef.current = setTimeout(typeNextChar, speed)
      } else {
        setIsDone(true)
      }
    }
    
    // Initial delay before starting to type
    if (text) {
      timeoutRef.current = setTimeout(typeNextChar, delay)
    }
    
    // Clean up on unmount or when dependencies change
    return () => {
      isActive.current = false
      clearTimeoutRef()
    }
  }, [text, speed, delay])
  
  return { displayText, isDone }
}