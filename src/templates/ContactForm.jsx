'use client'

import { useState, useEffect } from 'react'
import { useFormSubmission } from '@/templates/hooks/useFormSubmission'

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
  // Use the form submission hook
  const {
    submitForm,
    isSubmitting,
    isSuccess,
    error: submissionError,
    resetForm,
    responseData
  } = useFormSubmission(hookUrl)

  // Form state
  const [formValues, setFormValues] = useState({
    name: initialValues.name || '',
    email: initialValues.email || '',
    message: initialValues.message || '',
    ...additionalFields.reduce((acc, field) => ({
      ...acc,
      [field.id]: initialValues[field.id] || ''
    }), {})
  });
  
  // Validation and submission state
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  
  // Reset form when closed
  useEffect(() => {
    if (!isVisible) {
      // Reset form after it's closed (with a delay to allow for animations)
      const timer = setTimeout(() => {
        setFormValues({
          name: initialValues.name || '',
          email: initialValues.email || '',
          message: initialValues.message || '',
          ...additionalFields.reduce((acc, field) => ({
            ...acc,
            [field.id]: initialValues[field.id] || ''
          }), {})
        });
        setErrors({});
        setErrorMessage('');
        resetForm();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, initialValues, additionalFields, resetForm]);
  
  // Update error message when submission error changes
  useEffect(() => {
    if (submissionError) {
      setErrorMessage(submissionError);
    }
  }, [submissionError]);
  
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
    
    // Validate custom fields
    additionalFields.forEach(field => {
      if (field.required && !formValues[field.id]?.trim()) {
        newErrors[field.id] = `${field.label} is required`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setErrorMessage('');
    
    try {
      // Submit form data to webhook
      const success = await submitForm(formValues);
      
      if (success) {
        // Reset form on success
        setFormValues({
          name: '',
          email: '',
          message: '',
          ...additionalFields.reduce((acc, field) => ({
            ...acc,
            [field.id]: ''
          }), {})
        });
        
        // Form remains open after submission to show the response
        // User will need to manually close the form
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred. Please try again.');
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
  
  // Create dynamic styles for elements with theme color
  const dynamicStyles = {
    title: { color: theme.primary },
    button: { color: theme.primary },
    label: { color: theme.primary },
    submitButton: { backgroundColor: theme.primary }
  };
  
  return (
    <div 
      className={`absolute ${positionClasses.container} ${theme.background} backdrop-blur-md p-8 rounded-lg z-20 w-96 ${theme.border} ${theme.shadow}
      transform transition-all duration-500 ease-in-out ${positionClasses.animation}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-form-title"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 
          id="contact-form-title"
          className="text-2xl font-bold italic tracking-wider" 
          style={{ ...dynamicStyles.title, fontFamily: "'Arial Black', 'Arial Bold', sans-serif" }}
        >
          {/* Split title into characters for animated display */}
          {title.split('').map((char, index) => (
            <span key={index} className={`inline-block ${index === 0 ? 'animate-pulse-slow' : ''} ${char === ' ' ? 'ml-2' : ''}`}>
              {char}
            </span>
          ))}
        </h2>
        <button
          className="hover:text-white transition-colors transform hover:rotate-90 duration-300"
          onClick={onClose}
          aria-label="Close contact form"
          style={dynamicStyles.button}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {isSuccess ? (
        <div className="text-left p-6" role="status" aria-live="polite">
          <div className="text-green-400 mb-4 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          {/* Format and display the response message */}
          {(() => {
            const message =
              responseData?.message ||
              responseData?.response ||
              (typeof responseData === 'string' ? responseData : successMessage);
              
            // Check if message is a string and contains line breaks
            if (typeof message === 'string' && message.includes('\n')) {
              // Split by line breaks and render each paragraph
              return message.split('\n').map((line, index) =>
                line.trim() ? (
                  <p
                    key={index}
                    className={index === 0 ? "text-xl font-bold mb-3" : "text-base mb-2"}
                    style={index === 0 ? dynamicStyles.title : null}
                  >
                    {line}
                  </p>
                ) : <br key={index} />
              );
            } else {
              // Render as a single paragraph if no line breaks
              return (
                <p className="text-xl font-bold" style={dynamicStyles.title}>
                  {message}
                </p>
              );
            }
          })()}
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-5 transform transition-all duration-300 hover:translate-x-1">
            <label 
              className="block text-sm font-bold mb-2 tracking-wider" 
              style={{ ...dynamicStyles.label, fontFamily: "'Arial Black', 'Arial Bold', sans-serif" }} 
              htmlFor="name"
            >
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
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1" id="name-error" role="alert">
                {errors.name}
              </p>
            )}
          </div>
          
          <div className="mb-5 transform transition-all duration-300 hover:translate-x-1">
            <label 
              className="block text-sm font-bold mb-2 tracking-wider" 
              style={{ ...dynamicStyles.label, fontFamily: "'Arial Black', 'Arial Bold', sans-serif" }} 
              htmlFor="email"
            >
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
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1" id="email-error" role="alert">
                {errors.email}
              </p>
            )}
          </div>
          
          <div className="mb-6 transform transition-all duration-300 hover:translate-x-1">
            <label 
              className="block text-sm font-bold mb-2 tracking-wider" 
              style={{ ...dynamicStyles.label, fontFamily: "'Arial Black', 'Arial Bold', sans-serif" }} 
              htmlFor="message"
            >
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
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? "message-error" : undefined}
            ></textarea>
            {errors.message && (
              <p className="text-red-500 text-xs mt-1" id="message-error" role="alert">
                {errors.message}
              </p>
            )}
          </div>
          
          {/* Render additional fields */}
          {additionalFields.map((field) => (
            <div key={field.id} className="mb-5 transform transition-all duration-300 hover:translate-x-1">
              <label 
                className="block text-sm font-bold mb-2 tracking-wider" 
                style={{ ...dynamicStyles.label, fontFamily: "'Arial Black', 'Arial Bold', sans-serif" }} 
                htmlFor={field.id}
              >
                {field.label.toUpperCase()}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  className={`bg-gray-800 border-2 border-gray-700 focus:border-[${theme.primary}] text-white rounded-md w-full py-3 px-4
                    transition-all duration-300 focus:outline-none focus:shadow-[0_0_8px_rgba(235,203,76,0.5)] hover:border-gray-600 min-h-[100px]
                    ${errors[field.id] ? 'border-red-500' : ''}`}
                  id={field.id}
                  rows="3"
                  required={field.required}
                  placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                  value={formValues[field.id] || ''}
                  onChange={handleChange}
                  aria-invalid={!!errors[field.id]}
                  aria-describedby={errors[field.id] ? `${field.id}-error` : undefined}
                ></textarea>
              ) : (
                <input
                  className={`bg-gray-800 border-2 border-gray-700 focus:border-[${theme.primary}] text-white rounded-md w-full py-3 px-4
                    transition-all duration-300 focus:outline-none focus:shadow-[0_0_8px_rgba(235,203,76,0.5)] hover:border-gray-600
                    ${errors[field.id] ? 'border-red-500' : ''}`}
                  id={field.id}
                  type={field.type || 'text'}
                  required={field.required}
                  placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                  value={formValues[field.id] || ''}
                  onChange={handleChange}
                  aria-invalid={!!errors[field.id]}
                  aria-describedby={errors[field.id] ? `${field.id}-error` : undefined}
                />
              )}
              {errors[field.id] && (
                <p className="text-red-500 text-xs mt-1" id={`${field.id}-error`} role="alert">
                  {errors[field.id]}
                </p>
              )}
            </div>
          ))}
          
          {errorMessage && (
            <div 
              className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-md text-white text-sm"
              role="alert"
            >
              {errorMessage}
            </div>
          )}
          
          <div className="text-center">
            <button
              className={`hover:bg-opacity-80 text-gray-900 font-bold py-3 px-6 rounded-md
                focus:outline-none focus:shadow-outline w-full transition-all duration-300
                transform hover:scale-105 active:scale-95 shadow-[0_0_10px_rgba(235,203,76,0.3)]
                ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              type="submit"
              disabled={isSubmitting}
              style={{ ...dynamicStyles.submitButton, fontFamily: "'Arial Black', 'Arial Bold', sans-serif" }}
              aria-busy={isSubmitting}
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