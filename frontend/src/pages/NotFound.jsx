import { useState } from 'react';
import FuzzyText from '../components/FuzzyText';

export default function NotFound() {
  const [enableHover] = useState(true);
  const [hoverIntensity] = useState(0.5);

  const handleBackHome = () => {
    window.location.hash = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-black flex flex-col items-center justify-center px-6">
      <div className="text-center">
        <div className="mb-8 flex justify-center">
          <FuzzyText baseIntensity={0.2} hoverIntensity={hoverIntensity} enableHover={enableHover}>
            404
          </FuzzyText>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Page Not Found</h1>
        <p className="text-xl text-gray-400 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or is under construction.
        </p>
        
        <button
          onClick={handleBackHome}
          className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-base hover:shadow-xl hover:shadow-indigo-500/30 transition-all transform hover:scale-[1.02]"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
