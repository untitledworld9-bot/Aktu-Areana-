import React from 'react';

export const BackgroundGlow: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Very subtle ambient depth */}
      <div className="absolute -top-40 left-1/4 w-96 h-96 bg-cyan-500/[0.04] rounded-full blur-3xl" />
      <div className="absolute top-1/3 -right-20 w-[30rem] h-[30rem] bg-indigo-500/[0.03] rounded-full blur-3xl" />
      
      {/* Subtle modern engineering dot grid */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '48px 48px'
        }}
      />
    </div>
  );
};
