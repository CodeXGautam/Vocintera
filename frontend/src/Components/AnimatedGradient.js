import React from 'react';

const AnimatedGradient = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Subtle gradient overlay on top of slate-950 */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: 'linear-gradient(45deg, #1e293b, #334155, #475569, #64748b)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 20s ease infinite'
        }}
      ></div>
      
      {/* Dark blue floating orbs - very subtle */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-900/15 rounded-full blur-3xl animate-enhanced-pulse"></div>
      <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-slate-700/20 rounded-full blur-3xl animate-enhanced-pulse" style={{ animationDelay: '3s' }}></div>
      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-blue-800/25 rounded-full blur-3xl animate-enhanced-pulse" style={{ animationDelay: '6s' }}></div>
      
      {/* Subtle mesh gradient */}
      <div 
        className="absolute inset-0 opacity-15"
        style={{
          background: 'radial-gradient(circle at 20% 80%, rgba(30, 58, 138, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(51, 65, 85, 0.2) 0%, transparent 50%)',
          animation: 'meshMove 25s ease-in-out infinite alternate'
        }}
      ></div>
      
      {/* Additional floating elements - very subtle */}
      <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-slate-600/10 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '8s' }}></div>
      <div className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-blue-700/15 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
      
      {/* Small floating particles - subtle */}
      <div className="absolute top-1/6 right-1/6 w-32 h-32 bg-slate-500/20 rounded-full blur-xl animate-pulse" style={{ animationDuration: '4s' }}></div>
      <div className="absolute bottom-1/6 left-1/6 w-24 h-24 bg-blue-600/25 rounded-full blur-xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
      <div className="absolute top-2/3 left-1/6 w-40 h-40 bg-slate-600/15 rounded-full blur-xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '3s' }}></div>
      
      {/* Very subtle wave effect */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32 opacity-10"
        style={{
          background: 'linear-gradient(to top, rgba(30, 58, 138, 0.2), transparent)',
          animation: 'gradientShift 15s ease infinite'
        }}
      ></div>
      
      {/* Additional subtle blue accents */}
      <div className="absolute top-1/5 right-1/5 w-56 h-56 bg-blue-800/10 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }}></div>
      <div className="absolute bottom-1/5 right-1/5 w-40 h-40 bg-slate-700/15 rounded-full blur-xl animate-pulse" style={{ animationDuration: '9s', animationDelay: '2s' }}></div>
    </div>
  );
};

export default AnimatedGradient; 