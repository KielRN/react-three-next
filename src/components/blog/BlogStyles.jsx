'use client';

export default function BlogStyles() {
    return (
        <style jsx global>{`
      pre {
        max-width: 100%;
        overflow-x: auto;
        white-space: pre-wrap;
        word-wrap: break-word;
        background-color: #1e2538 !important;
        border: 1px solid #2d3748;
        border-radius: 0.5rem;
        padding: 1.25rem;
        margin: 1.5rem 0;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      
      .prose pre code {
        color: #f8f8f2 !important;
        font-size: 1rem !important;
        font-family: 'Courier New', Courier, monospace !important;
      }
      
      .prose * {
        color: white !important;
      }
      
      .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
        color: #2c75ff !important;
        font-family: 'HesDeadJim', Arial, sans-serif !important;
        margin-top: 1.5rem;
        margin-bottom: 1rem;
        text-shadow: 0 0 5px rgba(44, 117, 255, 0.7);
        position: relative;
        padding-left: 10px;
      }
      
      .prose h2::before, .prose h3::before, .prose h4::before {
        content: '';
        position: absolute;
        left: -8px;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 70%;
        background-color: #ffcc00;
        box-shadow: 0 0 5px rgba(255, 204, 0, 0.7);
        border-radius: 2px;
      }
      
      .prose a {
        color: #2c75ff !important;
        text-decoration: none;
        text-shadow: 0 0 3px rgba(44, 117, 255, 0.5);
        padding: 0 2px;
        border-bottom: 1px solid #2c75ff;
        transition: all 0.3s ease;
      }
      
      .prose a:hover {
        background-color: rgba(44, 117, 255, 0.1);
        text-shadow: 0 0 5px rgba(44, 117, 255, 0.7);
      }
      
      .prose p {
        margin-bottom: 1.25rem;
        line-height: 1.75;
      }
      
      .prose ul, .prose ol {
        margin-top: 1rem;
        margin-bottom: 1rem;
        margin-left: 1.5rem;
      }
      
      .prose li {
        margin-bottom: 0.5rem;
      }
      
      .prose blockquote {
        color: white !important;
        border-left-color: #ffcc00 !important;
        border-left-width: 3px;
        background-color: rgba(14, 32, 66, 0.4);
        padding: 1rem;
        margin: 1.5rem 0;
        box-shadow: 0 0 10px rgba(44, 117, 255, 0.2);
      }
      
      .prose img {
        margin: 1.5rem 0;
        border-radius: 0.5rem;
      }

      .prose table {
        width: 100%;
        border-collapse: collapse;
        margin: 1.5rem 0;
        background-color: rgba(14, 32, 66, 0.4);
        border-radius: 0.5rem;
        overflow: hidden;
      }
      
      .prose th {
        background-color: #0e2042 !important;
        color: #ffcc00 !important;
        font-family: 'HesDeadJim', Arial, sans-serif !important;
        font-weight: bold;
        padding: 1rem;
        text-align: left;
        border-bottom: 2px solid #2c75ff;
      }
      
      .prose td {
        padding: 0.75rem 1rem;
        border-bottom: 1px solid rgba(44, 117, 255, 0.2);
        color: white !important;
      }
      
      .prose tr:nth-child(even) {
        background-color: rgba(44, 117, 255, 0.05);
      }
      
      .prose tr:hover {
        background-color: rgba(44, 117, 255, 0.1);
      }
      
      .prose strong {
        color: #ffcc00 !important;
        font-weight: bold;
      }
      
      .prose em {
        color: #2c75ff !important;
        font-style: italic;
      }
    `}</style>
    );
}
