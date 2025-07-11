import Link from 'next/link';

export default function CallToAction() {
  return (
    <div className="text-center my-8">
      <h2 className="text-3xl font-bold mb-4 text-[#2c75ff]">Ready to Dive Deeper?</h2>
      <p className="text-lg mb-6">Download our complete 2025 Central Texas Data Center Market Report for even more insights.</p>
      <Link
        href="/Reports/Central%20Texas%20Data%20Center%20Market%20Report%20(Austin,%20San%20Antonio,%20Waco).pdf"
        className="inline-block text-[#ffcc00] bg-[#0e2042] px-6 py-3 font-hesdeadjim text-xl"
        style={{
          clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)',
          textShadow: '0 0 5px rgba(255, 204, 0, 0.7)',
          boxShadow: '0 0 8px rgba(44, 117, 255, 0.4)'
        }}
        target="_blank"
        rel="noopener noreferrer"
      >
        Download Full Report (PDF)
      </Link>
    </div>
  );
}