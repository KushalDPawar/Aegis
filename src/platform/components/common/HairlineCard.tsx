import React from 'react';

interface HairlineCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  onClick?: () => void;
}

export const HairlineCard: React.FC<HairlineCardProps> = ({
  children,
  className = '',
  glow = false,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        relative rounded-xl border border-hairline bg-paper-surface p-6
        transition-all duration-300 ease-out
        ${glow ? 'shadow-[0_0_30px_-5px_rgba(0,210,255,0.12)] border-accent-cyan/30' : 'hover:border-hairlineStrong hover:shadow-lg'}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Subtle top specular hairline highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none rounded-t-xl" />
      {children}
    </div>
  );
};
