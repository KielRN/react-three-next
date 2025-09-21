'use client'

import { useState } from 'react'

export function useFormSubmission(hookUrl) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [responseData, setResponseData] = useState(null)
  
  const submitForm = async (formData) => {
    if (!hookUrl) {
      setError('No webhook URL configured')
      return false
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Submit to webhook
      const response = await fetch(hookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (!response.ok) {
        throw new Error('Failed to submit form')
      }

      const responseText = await response.text();
      setResponseData({ message: responseText });
      setIsSuccess(true);
      return true;
    } catch (err) {
      console.error("Form submission error:", err);
      setError(err.message || 'Failed to submit form');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return {
    submitForm,
    isSubmitting,
    isSuccess,
    error,
    responseData,
    resetForm: () => {
      setIsSuccess(false)
      setError(null)
      setResponseData(null)
    }
  }
}