import React from 'react';
import { BrandMark } from './UIAssets';

interface LogoProps {
  size?: number;
  variant?: 'full' | 'mark' | 'wordmark';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 40, variant = 'full', className = '' }) => {
  if (variant === 'mark') {
    return <BrandMark size={size} className={className} />;
  }

  if (variant === 'wordmark') {
    return (
      <svg
        width={size * 2.4}
        height={size}
        viewBox="0 0 240 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="STEM Lab Command Center"
      >
        <text x="0" y="42" fontFamily="Space Grotesk, sans-serif" fontWeight="700" fontSize="28" fill="#0F172A" letterSpacing="0">
          STEM.Lab
        </text>
        <text x="160" y="42" fontFamily="JetBrains Mono, monospace" fontWeight="500" fontSize="18" fill="#475569">
          /OS
        </text>
        <circle cx="222" cy="36" r="4" fill="#38BDF8" />
      </svg>
    );
  }

  return (
    <svg
      width={size * 3.2}
      height={size}
      viewBox="0 0 256 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="STEM Lab Command Center"
    >
      <defs>
        <linearGradient id="brand-grad-full" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0F172A" />
          <stop offset="1" stopColor="#1E3A8A" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#brand-grad-full)" />
      <path
        d="M16 46V18h12.4c4.8 0 8.4 3.4 8.4 8.2s-3.6 8.4-8.4 8.4H22V46h-6Zm6-16h6.2c1.6 0 2.6-1 2.6-2.6s-1-2.6-2.6-2.6H22V30Z"
        fill="#FFFFFF"
      />
      <circle cx="46" cy="22" r="3.5" fill="#38BDF8" />
      <path
        d="M40 50l8-13 4 6 4-6"
        stroke="#38BDF8"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <text x="80" y="30" fontFamily="Space Grotesk, sans-serif" fontWeight="700" fontSize="20" fill="#0F172A" letterSpacing="0">
        STEM.Lab OS
      </text>
      <text x="80" y="48" fontFamily="JetBrains Mono, monospace" fontWeight="500" fontSize="11" fill="#64748B" letterSpacing="0.5">
        Châu Thành · Ban Hậu cần
      </text>
    </svg>
  );
};

export default Logo;