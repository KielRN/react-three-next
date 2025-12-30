'use client'

import { useEffect } from 'react'
import Script from 'next/script'

/**
 * A reusable contact form component with iframe integration
 * 
 * @param {boolean} isVisible - Whether to show the contact form
 * @param {function} onClose - Function to call when form is closed
 * @param {string} position - Position of the form ('right', 'left', 'center')
 * @param {object} theme - Custom theme colors
 */
export function ContactForm({
  isVisible,
  onClose,
  position = "right",
  theme = {
    primary: "#ebcb4c",
    background: "bg-gray-900/90",
    border: "border-4 border-[#ebcb4c]/60",
    shadow: "shadow-[0_0_15px_rgba(235,203,76,0.3)]"
  }
}) {

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
          formWrapper: 'w-full max-w-2xl h-[90vh]',
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

  const dynamicStyles = {
    button: { color: theme.primary },
  };

  return (
    <div
      className={`fixed ${positionClasses.container} z-50 transform transition-all duration-500 ease-in-out ${positionClasses.animation}
        ${position === 'center' ? '' : `w-96 ${theme.background} backdrop-blur-md p-2 rounded-lg ${theme.border} ${theme.shadow}`}`}
      role="dialog"
      aria-modal="true"
    >
      {position === 'center' ? (
        <div className={`${positionClasses.formWrapper} ${theme.background} backdrop-blur-md p-2 rounded-lg ${theme.border} ${theme.shadow} overflow-hidden flex flex-col`}>
          <div className="flex justify-end p-2 border-b border-gray-700/50 mb-2">
            <button
              onClick={onClose}
              className="hover:text-white transition-colors transform hover:rotate-90 duration-300"
              style={dynamicStyles.button}
              aria-label="Close contact form"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto bg-white rounded-md">
            <iframe
              src="https://link.texasaiconsulting.com/widget/form/m2QtgBWrIRiB0n3BnPwz"
              style={{ width: '100%', height: '100%', border: 'none', borderRadius: '3px' }}
              id="inline-m2QtgBWrIRiB0n3BnPwz"
              data-layout="{'id':'INLINE'}"
              data-trigger-type="alwaysShow"
              data-trigger-value=""
              data-activation-type="alwaysActivated"
              data-activation-value=""
              data-deactivation-type="neverDeactivate"
              data-deactivation-value=""
              data-form-name="TX_AI_Website Form"
              data-height="1283"
              data-layout-iframe-id="inline-m2QtgBWrIRiB0n3BnPwz"
              data-form-id="m2QtgBWrIRiB0n3BnPwz"
              title="TX_AI_Website Form"
            >
            </iframe>
            <Script src="https://link.texasaiconsulting.com/js/form_embed.js" strategy="lazyOnload" />
          </div>
        </div>
      ) : (
        <div className="h-[600px] flex flex-col">
          <div className="flex justify-end mb-2">
            <button
              onClick={onClose}
              className="hover:text-white transition-colors transform hover:rotate-90 duration-300"
              style={dynamicStyles.button}
              aria-label="Close contact form"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto bg-white rounded-md no-scrollbar">
            <iframe
              src="https://link.texasaiconsulting.com/widget/form/m2QtgBWrIRiB0n3BnPwz"
              style={{ width: '100%', minHeight: '800px', border: 'none', borderRadius: '3px' }}
              id="inline-m2QtgBWrIRiB0n3BnPwz"
              data-layout="{'id':'INLINE'}"
              data-trigger-type="alwaysShow"
              data-trigger-value=""
              data-activation-type="alwaysActivated"
              data-activation-value=""
              data-deactivation-type="neverDeactivate"
              data-deactivation-value=""
              data-form-name="TX_AI_Website Form"
              data-height="1283"
              data-layout-iframe-id="inline-m2QtgBWrIRiB0n3BnPwz"
              data-form-id="m2QtgBWrIRiB0n3BnPwz"
              title="TX_AI_Website Form"
            >
            </iframe>
            <Script src="https://link.texasaiconsulting.com/js/form_embed.js" strategy="lazyOnload" />
          </div>
        </div>
      )}
    </div>
  )
}