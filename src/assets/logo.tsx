import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#0EA5E9" />
        </linearGradient>
      </defs>
      
      {/* Top circle */}
      <circle cx="150" cy="50" r="35" fill="url(#logoGradient)" />
      <circle cx="150" cy="50" r="15" fill="white" />
      
      {/* Middle connecting line */}
      <rect x="145" y="85" width="10" height="130" fill="url(#logoGradient)" />
      
      {/* Left circle */}
      <circle cx="50" cy="150" r="35" fill="url(#logoGradient)" />
      <circle cx="50" cy="150" r="15" fill="white" />
      
      {/* Left connecting line */}
      <rect x="85" y="145" width="60" height="10" fill="url(#logoGradient)" />
      
      {/* Bottom circle */}
      <circle cx="150" cy="250" r="35" fill="url(#logoGradient)" />
      <circle cx="150" cy="250" r="15" fill="white" />
    </svg>
  );
};