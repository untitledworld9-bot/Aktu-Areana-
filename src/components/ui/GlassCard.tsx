import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glow?: 'cyan' | 'violet' | 'emerald' | 'amber' | 'none';
  interactive?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glow = 'none',
  interactive = false,
  ...props
}) => {
  // Clean, professional, human-crafted styling without loud neon halos
  const borderStyles = {
    none: 'border-slate-800/80 hover:border-slate-700/80',
    cyan: 'border-slate-800 hover:border-cyan-500/50',
    violet: 'border-slate-800 hover:border-violet-500/50',
    emerald: 'border-slate-800 hover:border-emerald-500/50',
    amber: 'border-slate-800 hover:border-amber-500/50',
  };

  return (
    <div
      className={`relative rounded-xl bg-slate-900/70 border ${borderStyles[glow]} transition-all duration-200 ${
        interactive ? 'cursor-pointer hover:bg-slate-900 hover:-translate-y-0.5' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
