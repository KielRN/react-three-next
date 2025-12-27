'use client'

import React from 'react';
import { useTypewriter } from '../../templates/hooks/useTypewriter';

/**
 * A reusable component that renders text with a typewriter effect.
 * Preserves SEO by including the full text in an invisible element.
 */
export default function TypewriterText({ text, speed = 30, delay = 0, className = "" }) {
    // Helper to extract string from potential React children/arrays
    const extractString = (node) => {
        if (typeof node === 'string') return node;
        if (typeof node === 'number') return String(node);
        if (Array.isArray(node)) return node.map(extractString).join('');
        if (React.isValidElement(node)) return extractString(node.props.children);
        if (typeof node === 'object' && node !== null) {
            if (node.props && node.props.children) return extractString(node.props.children);
            // Handle specific MDX objects or other edge cases if needed
            return '';
        }
        return '';
    };

    const safeText = extractString(text);
    const { displayText, isDone } = useTypewriter(safeText, speed, delay);

    return (
        <span className={`inline-block ${className}`}>
            {/* Screen reader only text for accessibility and SEO */}
            <span className="sr-only">{safeText}</span>

            {/* Visible typewriter text */}
            <span aria-hidden="true">
                {displayText}
                {/* Blinking cursor - hidden when done to prevent distraction */}
                <span className={`inline-block w-2 h-[1em] bg-current ml-1 align-middle ${isDone ? 'opacity-0' : 'animate-blink-slow'}`}></span>
            </span>
        </span>
    );
}
