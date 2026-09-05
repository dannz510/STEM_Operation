import React from 'react';
import { RankLevel } from '../types';
import { RankGlyph } from './brand/UIAssets';

interface RankBadgeProps {
  rank: RankLevel;
  points?: number;
  compact?: boolean;
}

const rankConfig: Record<RankLevel, { label: string; color: string }> = {
  CADET: { label: 'Novice', color: '#94A3B8' },
  OPERATOR: { label: 'Apprentice', color: '#10B981' },
  LEAD: { label: 'Specialist', color: '#0284C7' },
  CHIEF: { label: 'Master', color: '#8B5CF6' },
  GRANDMASTER: { label: 'Grandmaster', color: '#F59E0B' },
};

export const RankBadge: React.FC<RankBadgeProps> = ({ rank, points, compact = false }) => {
  const config = rankConfig[rank];
  return (
    <span
      className={`inline-flex items-center gap-1 border font-mono font-bold ${compact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-1 text-[10px]'}`}
      style={{ color: config.color, borderColor: `${config.color}66`, backgroundColor: `${config.color}14` }}
      title={`${config.label} · ${rank}`}
    >
      <RankGlyph rank={rank} size={compact ? 18 : 26} />
      {compact ? rank : `${config.label} · ${rank}`}
      {points !== undefined && <span className="opacity-70">{points} pts</span>}
    </span>
  );
};

export const GrandmasterMark: React.FC = () => <RankGlyph rank="GRANDMASTER" size={18} />;
