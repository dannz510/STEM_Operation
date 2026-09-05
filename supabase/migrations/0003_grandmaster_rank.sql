-- Keep the database rank enum aligned with the five-tier UI gamification model.
alter type public.rank_level add value if not exists 'GRANDMASTER';
