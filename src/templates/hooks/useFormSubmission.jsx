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

      // Get response text first
      let result;
      const responseText = await response.text();
      
      // Function to sanitize control characters from JSON string
      const sanitizeJson = (str) => {
        // Replace control characters with proper escaped versions
        return str.replace(/[\u0000-\u001F\u007F-\u009F]/g, (char) => {
          return '\\u' + ('0000' + char.charCodeAt(0).toString(16)).slice(-4);
        });
      };
      
      try {
        // Sanitize text before parsing JSON
        const sanitizedText = sanitizeJson(responseText);
        // Attempt to parse the sanitized JSON
        result = JSON.parse(sanitizedText);
      } catch (jsonError) {
        console.log("JSON parsing error:", jsonError.message);
        
        // If it looks like JSON but has syntax issues
        if (responseText.includes('"message"')) {
          try {
            // Extract the message content directly using regex
            const messageMatch = responseText.match(/"message"\s*:\s*"([^"]*)"/);
            if (messageMatch && messageMatch[1]) {
              result = { message: messageMatch[1] };
            } else {
              result = { message: responseText };
            }
          } catch (e) {
            result = { message: responseText };
          }
        } else {
          // Use text response directly
          result = { message: responseText };
        }
      }
      
      setResponseData(result);
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