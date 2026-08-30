import React from 'react';
import { Bot } from 'lucide-react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  subtitle?: string;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  subtitle = 'AI-Powered Career Intelligence',
  className = ''
}) => {
  const sizeMap = {
    sm: { box: 'w-8 h-8 rounded-xl', icon: 'w-4 h-4', title: 'text-xs', sub: 'text-[9px]' },
    md: { box: 'w-10 h-10 rounded-2xl', icon: 'w-5 h-5', title: 'text-sm sm:text-base', sub: 'text-[10px]' },
    lg: { box: 'w-14 h-14 rounded-3xl', icon: 'w-7 h-7', title: 'text-lg sm:text-xl', sub: 'text-xs' }
  };

  const current = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${current.box} bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center shrink-0`}>
        <div className="w-full h-full bg-[#06080F] rounded-[inherit] flex items-center justify-center">
          <Bot className={`${current.icon} text-cyan-400`} />
        </div>
      </div>
      {showText && (
        <div>
          <h1 className={`${current.title} font-extrabold tracking-tight text-white leading-none`}>
            Agentic Career OS
          </h1>
          {subtitle && (
            <p className={`${current.sub} font-medium text-slate-400 mt-1 leading-none`}>
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
