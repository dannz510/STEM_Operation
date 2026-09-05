import React from 'react';
import { RankLevel } from '../../types';

const rankStyles: Record<RankLevel, { color: string; glow: string; label: string }> = {
  CADET: { color: '#94A3B8', glow: '#CBD5E1', label: 'N' },
  OPERATOR: { color: '#10B981', glow: '#6EE7B7', label: 'A' },
  LEAD: { color: '#0284C7', glow: '#7DD3FC', label: 'S' },
  CHIEF: { color: '#8B5CF6', glow: '#C4B5FD', label: 'M' },
  GRANDMASTER: { color: '#F59E0B', glow: '#FDE68A', label: 'G' },
};

export const BrandMark: React.FC<{ size?: number; className?: string }> = ({ size = 42, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-label="STEM Lab OS">
    <defs><linearGradient id="ct-brand" x1="6" y1="4" x2="43" y2="44" gradientUnits="userSpaceOnUse"><stop stopColor="#0F172A" /><stop offset="1" stopColor="#0284C7" /></linearGradient></defs>
    <rect x="1" y="1" width="46" height="46" rx="15" fill="url(#ct-brand)" />
    <path d="M12 34V14h9.5c4.3 0 7.3 2.4 7.3 6.2 0 2.4-1.2 4.2-3.4 5.3l5.4 8.5h-6.2l-4.1-7.3h-2.7V34H12Zm5.8-11.8h3.2c1.6 0 2.3-.7 2.3-1.9s-.7-1.9-2.3-1.9h-3.2v3.8Z" fill="white" />
    <path d="m33 16 3 4 4-2-2 5 3 3-5 .2-2 5-2-5-4-.2 3-3-2-5 4 2 3-4Z" fill="#A7F3D0" />
    <circle cx="37" cy="36" r="2" fill="#FDE68A" />
  </svg>
);

export const RankGlyph: React.FC<{ rank: RankLevel; size?: number; className?: string }> = ({ rank, size = 44, className = '' }) => {
  const style = rankStyles[rank];
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-label={`${rank} rank badge`}>
      <circle cx="24" cy="24" r="21" fill={`${style.color}18`} stroke={style.color} strokeWidth="1.4" />
      <circle cx="24" cy="24" r="16" stroke={style.glow} strokeOpacity=".55" strokeDasharray="2 4" />
      {rank === 'CADET' && <><path d="M24 33V20m0 4-6-5m6 2 6-6m-5 18c-5-1-8-4-8-8 4 0 7 2 8 5m1 3c5-1 8-4 8-8-4 0-7 2-8 5" stroke={style.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></>}
      {rank === 'OPERATOR' && <><path d="m15 30 6-6 4 4 8-10" stroke={style.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M30 18h5v5" stroke={style.color} strokeWidth="2" strokeLinecap="round" /></>}
      {rank === 'LEAD' && <><rect x="16" y="16" width="16" height="16" rx="3" stroke={style.color} strokeWidth="2" /><path d="M20 12v4m8-4v4m-8 16v4m8-4v4m4-16h4m-4 8h4m-20-8h-4m4 8h-4M21 21h6v6h-6z" stroke={style.color} strokeWidth="1.8" strokeLinecap="round" /></>}
      {rank === 'CHIEF' && <><path d="m24 13 9 8-9 14-9-14 9-8Z" stroke={style.color} strokeWidth="2" /><path d="m24 18 4 4-4 7-4-7 4-4Z" fill={style.color} /></>}
      {rank === 'GRANDMASTER' && <><path d="m14 17 4 5 6-9 6 9 4-5-2 17H16l-2-17Z" stroke={style.color} strokeWidth="2" strokeLinejoin="round" /><path d="M17 38h14" stroke={style.color} strokeWidth="2" strokeLinecap="round" /></>}
      <text x="24" y="10" textAnchor="middle" fill={style.color} fontSize="5" fontWeight="800" letterSpacing="1">{style.label}</text>
    </svg>
  );
};

export const AvatarGlyph: React.FC<{ mood?: 'steady' | 'happy' | 'late'; size?: number }> = ({ mood = 'steady', size = 42 }) => {
  const accent = mood === 'happy' ? '#10B981' : mood === 'late' ? '#F59E0B' : '#0284C7';
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-label={`${mood} avatar`}>
    <circle cx="24" cy="24" r="22" fill={`${accent}18`} stroke={accent} />
    <path d="M15 21c0-6 4-10 9-10s9 4 9 10v3H15v-3Z" fill={accent} opacity=".85" />
    <circle cx="24" cy="25" r="9" fill="#FFF7ED" stroke={accent} />
    <circle cx="21" cy="24" r="1.2" fill="#0F172A" /><circle cx="27" cy="24" r="1.2" fill="#0F172A" />
    {mood === 'happy' ? <path d="M20 28c2 2 6 2 8 0" stroke="#0F172A" strokeWidth="1.3" strokeLinecap="round" /> : mood === 'late' ? <path d="M21 29h6" stroke="#0F172A" strokeWidth="1.3" strokeLinecap="round" /> : <path d="M21 28h6" stroke="#0F172A" strokeWidth="1.3" strokeLinecap="round" />}
    {mood === 'late' && <path d="M35 10v7m0 3v1" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />}
  </svg>;
};
