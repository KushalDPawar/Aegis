import React from 'react';

interface PillButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export const PillButton: React.FC<PillButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  icon
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs font-medium',
    md: 'px-4 py-2 text-sm font-medium',
    lg: 'px-6 py-2.5 text-base font-semibold'
  };

  const variantClasses = {
    primary: 'bg-ink text-paper-bottom hover:opacity-90 active:scale-[0.98]',
    secondary: 'bg-paper-elevated text-ink border border-hairline hover:border-hairlineStrong hover:bg-paper-surface active:scale-[0.98]',
    danger: 'bg-accent-rose text-white hover:bg-accent-rose/90 active:scale-[0.98]',
    ghost: 'text-ink-muted hover:text-ink hover:bg-hairline/20',
    outline: 'border border-hairlineStrong text-ink hover:bg-hairline/15 active:scale-[0.98]'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2 rounded-full font-sans
        transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-accent-cyan/30
        disabled:opacity-40 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
