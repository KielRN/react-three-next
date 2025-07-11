import Link from 'next/link';

const LCARSDecoration = ({ className = '' }) => (
  <div className={`flex items-center space-x-1 ${className}`}>
    <div className="h-6 w-2 bg-[#ffcc00] rounded-sm" style={{boxShadow: '0 0 5px rgba(255, 204, 0, 0.7)'}}></div>
    <div className="h-10 w-1 bg-[#2c75ff] rounded-sm" style={{boxShadow: '0 0 5px rgba(44, 117, 255, 0.7)'}}></div>
    <div className="h-4 w-3 bg-[#ffcc00] rounded-sm" style={{boxShadow: '0 0 5px rgba(255, 204, 0, 0.7)'}}></div>
  </div>
);

export default function DashboardHeader() {
  return (
    <header className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <LCARSDecoration className="mr-3" />
          <h1 className="text-2xl font-bold text-[#2c75ff] font-hesdeadjim" style={{textShadow: '0 0 10px rgba(44, 117, 255, 0.7)'}}>
            Central Texas Data Center Dashboard
          </h1>
        </div>
        <Link
          href="/blog/central-texas-data-centers-2025"
          className="text-[#ffcc00] bg-[#0e2042] px-4 py-1 flex items-center font-hesdeadjim"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)',
            textShadow: '0 0 5px rgba(255, 204, 0, 0.7)',
            boxShadow: '0 0 8px rgba(44, 117, 255, 0.4)'
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Blog Post
        </Link>
      </div>
    </header>
  );
}