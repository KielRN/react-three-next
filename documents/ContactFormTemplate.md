# Contact Form Component Template

This document provides a template for implementing the `ContactForm` component. The actual implementation should be created in `src/templates/ContactForm.jsx` using the code structure below.

## Basic Component Structure

```jsx
'use client'

import { useState, useEffect } from 'react'

/**
 * A reusable contact form component with webhook integration
 * 
 * @param {boolean} isVisible - Whether to show the contact form
 * @param {function} onClose - Function to call when form is closed
 * @param {string} hookUrl - URL for the webhook to submit form data
 * @param {string} title - Title for the contact form
 * @param {string} position - Position of the form ('right', 'left', 'center')
 * @param {object} theme - Custom theme colors
 * @param {string} submitButtonText - Text to display on the submit button
 * @param {object} initialValues - Initial values for form fields
 * @param {array} additionalFields - Additional fields to add to the form
 * @param {string} successMessage - Message to show on successful submission
 */
export function ContactForm({
  isVisible,
  onClose,
  hookUrl,
  title = "CONTACT US",
  position = "right",
  theme = {
    primary: "#ebcb4c",
    background: "bg-gray-900/90",
    border: "border-[#ebcb4c]/30",
    shadow: "shadow-[0_0_15px_rgba(235,203,76,0.3)]"
  },
  submitButtonText = "SEND MESSAGE",
  initialValues = {},
  additionalFields = [],
  successMessage = "Your message has been sent!"
}) {
  // Form state
  const [formValues, setFormValues] = useState({
    name: initialValues.name || '',
    email: initialValues.email || '',
    message: initialValues.message || ''
  });
  
  // Validation and submission state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Reset form when closed
  useEffect(() => {
    if (!isVisible) {
      // Reset form after it's closed (with a delay to allow for animations)
      const timer = setTimeout(() => {
        setFormValues({
          name: initialValues.name || '',
          email: initialValues.email || '',
          message: initialValues.message || ''
        });
        setErrors({});
        setIsSuccess(false);
        setErrorMessage('');
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, initialValues]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [id]: value
    }));
    
    // Clear error for this field when user types
    if (errors[id]) {
      setErrors(prev => ({
        ...prev,
        [id]: ''
      }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Validate name
    if (!formValues.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    // Validate email
    if (!formValues.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Validate message
    if (!formValues.message.trim()) {
      newErrors.message = 'Message is required';
    }
    
    // Validate custom fields here
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Submit to webhook
  const submitToWebhook = async (data) => {
    if (!hookUrl) {
      console.warn('No webhook URL provided');
      return { success: false, error: 'No webhook URL configured' };
    }
    
    try {
      // Placeholder for webhook submission logic
      console.log('Submitting to webhook:', hookUrl, data);
      
      // Simulate API call
      // In real implementation, replace with actual fetch call to webhook
      /*
      const response = await fetch(hookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit form');
      }
      
      const result = await response.json();
      return { success: true, data: result };
      */
      
      // For now, just simulate a successful response
      return { success: true, data: { message: 'Form submitted successfully' } };
    } catch (error) {
      console.error('Error submitting form:', error);
      return { success: false, error };
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      // Submit form data to webhook
      const result = await submitToWebhook(formValues);
      
      if (result.success) {
        setIsSuccess(true);
        // Reset form on success
        setFormValues({
          name: '',
          email: '',
          message: ''
        });
        
        // Auto close after success if desired
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        setErrorMessage(
          result.error?.message || 'Failed to submit form. Please try again.'
        );
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Determine position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'left':
        return {
          container: 'left-10 bottom-20',
          animation: isVisible
            ? 'opacity-100 -translate-x-0 scale-100'
            : 'opacity-0 -translate-x-20 scale-95 pointer-events-none'
        };
      case 'center':
        return {
          container: 'inset-0 flex items-center justify-center',
          animation: isVisible
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95 pointer-events-none'
        };
      case 'right':
      default:
        return {
          container: 'right-10 bottom-20',
          animation: isVisible
            ? 'opacity-100 translate-x-0 scale-100'
            : 'opacity-0 translate-x-20 scale-95 pointer-events-none'
        };
    }
  };
  
  const positionClasses = getPositionClasses();
  
  return (
    <div className={`absolute ${positionClasses.container} ${theme.background} backdrop-blur-md p-8 rounded-lg z-20 w-96 ${theme.border} ${theme.shadow}
      transform transition-all duration-500 ease-in-out ${positionClasses.animation}`}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold text-[${theme.primary}] italic tracking-wider`} style={{ fontFamily: "'Arial Black', 'Arial Bold', sans-serif" }}>
          {/* Split title into characters for animated display */}
          {title.split('').map((char, index) => (
            <span key={index} className={`inline-block ${index === 0 ? 'animate-pulse-slow' : ''} ${char === ' ' ? 'ml-2' : ''}`}>
              {char}
            </span>
          ))}
        </h2>
        <button
          className={`text-[${theme.primary}] hover:text-white transition-colors transform hover:rotate-90 duration-300`}
          onClick={onClose}
          aria-label="Close contact form"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {isSuccess ? (
        <div className="text-center p-6">
          <div className="text-green-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className={`text-xl text-[${theme.primary}] font-bold`}>{successMessage}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-5 transform transition-all duration-300 hover:translate-x-1">
            <label className={`block text-[${theme.primary}] text-sm font-bold mb-2 tracking-wider`} style={{ fontFamily: "'Arial Black', 'Arial Bold', sans-serif" }} htmlFor="name">
              NAME
            </label>
            <input
              className={`bg-gray-800 border-2 border-gray-700 focus:border-[${theme.primary}] text-white rounded-md w-full py-3 px-4
                transition-all duration-300 focus:outline-none focus:shadow-[0_0_8px_rgba(235,203,76,0.5)] hover:border-gray-600
                ${errors.name ? 'border-red-500' : ''}`}
              id="name"
              type="text"
              required
              placeholder="Your name"
              value={formValues.name}
              onChange={handleChange}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          
          <div className="mb-5 transform transition-all duration-300 hover:translate-x-1">
            <label className={`block text-[${theme.primary}] text-sm font-bold mb-2 tracking-wider`} style={{ fontFamily: "'Arial Black', 'Arial Bold', sans-serif" }} htmlFor="email">
              EMAIL
            </label>
            <input
              className={`bg-gray-800 border-2 border-gray-700 focus:border-[${theme.primary}] text-white rounded-md w-full py-3 px-4
                transition-all duration-300 focus:outline-none focus:shadow-[0_0_8px_rgba(235,203,76,0.5)] hover:border-gray-600
                ${errors.email ? 'border-red-500' : ''}`}
              id="email"
              type="email"
              required
              placeholder="your.email@example.com"
              value={formValues.email}
              onChange={handleChange}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          
          <div className="mb-6 transform transition-all duration-300 hover:translate-x-1">
            <label className={`block text-[${theme.primary}] text-sm font-bold mb-2 tracking-wider`} style={{ fontFamily: "'Arial Black', 'Arial Bold', sans-serif" }} htmlFor="message">
              MESSAGE
            </label>
            <textarea
              className={`bg-gray-800 border-2 border-gray-700 focus:border-[${theme.primary}] text-white rounded-md w-full py-3 px-4
                transition-all duration-300 focus:outline-none focus:shadow-[0_0_8px_rgba(235,203,76,0.5)] hover:border-gray-600 min-h-[120px]
                ${errors.message ? 'border-red-500' : ''}`}
              id="message"
              rows="4"
              required
              placeholder="Your message here..."
              value={formValues.message}
              onChange={handleChange}
            ></textarea>
            {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
          </div>
          
          {/* Render additional fields here */}
          
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-md text-white text-sm">
              {errorMessage}
            </div>
          )}
          
          <div className="text-center">
            <button
              className={`bg-[${theme.primary}] hover:bg-opacity-80 text-gray-900 font-bold py-3 px-6 rounded-md
                focus:outline-none focus:shadow-outline w-full transition-all duration-300
                transform hover:scale-105 active:scale-95 shadow-[0_0_10px_rgba(235,203,76,0.3)]
                ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              type="submit"
              disabled={isSubmitting}
              style={{ fontFamily: "'Arial Black', 'Arial Bold', sans-serif" }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  SENDING...
                </span>
              ) : submitButtonText}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
```

## Usage Example

```jsx
// In app/page.jsx
import { useState } from 'react'
import { ContactForm } from '@/templates/ContactForm'

export default function Page() {
  const [showContactForm, setShowContactForm] = useState(false)
  
  return (
    <div>
      {/* Trigger button */}
      <button onClick={() => setShowContactForm(true)}>
        Contact Us
      </button>
      
      {/* Contact form component */}
      <ContactForm 
        isVisible={showContactForm}
        onClose={() => setShowContactForm(false)}
        hookUrl={process.env.NEXT_PUBLIC_CONTACT_FORM_HOOK || ''}
      />
    </div>
  )
}
```

## Custom Hook for Form Submission (Optional)

For better separation of concerns, you can extract the form submission logic to a custom hook:

```jsx
// src/templates/hooks/useFormSubmission.jsx
import { useState } from 'react'

export function useFormSubmission(hookUrl) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState(null)
  
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
      
      const result = await response.json()
      setIsSuccess(true)
      return true
    } catch (err) {
      setError(err.message || 'Failed to submit form')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return {
    submitForm,
    isSubmitting,
    isSuccess,
    error,
    resetForm: () => {
      setIsSuccess(false)
      setError(null)
    }
  }
}
```

Then use it in the ContactForm component:

```jsx
import { useFormSubmission } from '@/templates/hooks/useFormSubmission'

// Inside component
const { 
  submitForm, 
  isSubmitting, 
  isSuccess, 
  error, 
  resetForm 
} = useFormSubmission(hookUrl)

// During form submission
const handleSubmit = async (e) => {
  e.preventDefault()
  if (!validateForm()) return
  
  const success = await submitForm(formValues)
  if (success) {
    // Reset form values, etc.
  }
}