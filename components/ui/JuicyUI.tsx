import React from 'react';

// Inline the type to avoid runtime import issues with type-only files
type ThemeColor = 'primary' | 'blue' | 'purple' | 'orange' | 'red';

// --- JUICY BUTTON ---

interface JuicyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ThemeColor | 'outline' | 'ghost' | 'secondary' | 'danger';
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const JuicyButton: React.FC<JuicyButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  size = 'md',
  className = '',
  ...props 
}) => {
  
  // Color mappings for Background and Border (Shadow)
  const variants: Record<string, string> = {
    primary: 'bg-med-primary border-med-primaryDark text-white hover:bg-[#61E002]',
    blue: 'bg-med-blue border-med-blueDark text-white hover:bg-[#5ED2F9]',
    purple: 'bg-med-purple border-med-purpleDark text-white hover:bg-[#D694FF]',
    orange: 'bg-med-orange border-med-orangeDark text-white hover:bg-[#FFA51F]',
    red: 'bg-med-red border-med-redDark text-white hover:bg-[#FF5F5F]',
    outline: 'bg-white border-med-border text-med-text hover:bg-gray-50',
    ghost: 'bg-transparent border-transparent text-med-text hover:bg-black/5 !border-b-0 active:!translate-y-0',
    // New Standard Variants
    secondary: 'bg-med-blue border-med-blueDark text-white hover:bg-[#5ED2F9]', // Mapped to Blue
    danger: 'bg-med-red border-med-redDark text-white hover:bg-[#FF5F5F]',       // Mapped to Red
  };

  const sizes = {
    sm: 'h-10 px-4 text-sm rounded-xl border-b-2',
    md: 'h-12 px-6 text-base rounded-2xl border-b-4',
    lg: 'h-14 px-8 text-lg rounded-2xl border-b-4',
  };

  // Base styles: uppercase font for buttons usually looks more "game-like" (optional), strictly bold
  const baseStyles = 'font-extrabold tracking-wide uppercase transition-all duration-150 flex items-center justify-center select-none active:border-b-0 active:translate-y-[4px]';
  const widthStyles = fullWidth ? 'w-full' : '';

  // Specific override for sm size active state
  const activeOverride = size === 'sm' ? 'active:translate-y-[2px]' : '';

  const variantStyle = variants[variant] || variants.primary;

  return (
    <button 
      className={`${baseStyles} ${variantStyle} ${sizes[size]} ${widthStyles} ${activeOverride} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// --- JUICY CARD ---

interface JuicyCardProps {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
  onClick?: () => void;
}

export const JuicyCard: React.FC<JuicyCardProps> = ({ 
  children, 
  className = '', 
  active = false,
  onClick
}) => {
  return (
    <div 
      onClick={onClick}
      className={`
        bg-med-surface 
        border-2 border-med-border 
        rounded-3xl 
        p-5 
        transition-transform duration-200
        ${onClick ? 'cursor-pointer hover:-translate-y-1 hover:border-med-blue/30' : ''}
        ${active ? 'border-med-blue bg-med-blue/5' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

// --- PROGRESS BAR ---

interface ProgressBarProps {
  progress?: number; // Legacy: 0 to 100
  value?: number;    // New: Current value
  max?: number;      // New: Max value
  color?: ThemeColor | string;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress,
  value,
  max,
  color = 'primary',
  showLabel = false
}) => {
  const colors: Record<string, string> = {
    primary: 'bg-med-primary',
    blue: 'bg-med-blue',
    purple: 'bg-med-purple',
    orange: 'bg-med-orange',
    red: 'bg-med-red',
  };

  // Calculate percentage: favor value/max if present, otherwise fallback to progress
  let percentage = 0;
  if (value !== undefined && max !== undefined && max > 0) {
    percentage = (value / max) * 100;
  } else if (progress !== undefined) {
    percentage = progress;
  }

  // Handle color: check if it's a theme key, otherwise treat as raw class string
  const colorClass = colors[color] || color;

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-1 text-sm font-bold text-med-text/70">
          <span>Progression</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="h-4 w-full bg-med-border/50 rounded-full overflow-hidden relative">
        <div 
          className={`h-full ${colorClass} transition-all duration-500 ease-out relative`}
          style={{ width: `${Math.max(5, percentage)}%` }} // Minimum width to show rounded corners
        >
          {/* Glossy highlight effect on top half of the bar */}
          <div className="absolute top-2 left-2 right-2 h-1 bg-white/30 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

// --- ICON BUTTON (For nav or simple actions) ---

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon: React.ReactNode;
    active?: boolean;
}

export const JuicyIconButton: React.FC<IconButtonProps> = ({ icon, active, className, ...props }) => {
    return (
        <button 
            className={`
                p-3 rounded-xl border-b-4 transition-all duration-150 active:border-b-0 active:translate-y-[4px]
                ${active 
                    ? 'bg-med-blue/10 border-med-blue text-med-blueDark' 
                    : 'bg-transparent border-transparent text-gray-400 hover:bg-gray-100'}
                ${className}
            `}
            {...props}
        >
            {icon}
        </button>
    )
}