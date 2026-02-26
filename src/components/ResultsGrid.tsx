import type { Player } from '../types';
import { getTrajectoryColour, getTrajectoryLabel } from '../lib/calculateTrajectory';
import { ROLE_MAP } from '../lib/roleFormulas';
import { PlayStyleRow } from './PlayStyleBadge';
import { getNationYouthRating, getClubRecruitment, getNationTier } from '../lib/youthData';

interface Props {
  players: Player[];
  favourites: string[];
  focusRoleKey?: string | null;
  rankOffset?: number;
  onPlayerClick: (p: Player) => void;
  onToggleFavourite: (uid: string) => void;
}

export function ResultsGrid({ players, favourites, focusRoleKey, rankOffset = 0, onPlayerClick, onToggleFavourite }: Props) {
  if (players.length === 0) return null;

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-[#7c8db0] uppercase tracking-wider">
        Search Results
      </h2>
      <div className="grid gap-2">
        {players.map((p, i) => (
          <PlayerCard
            key={p.uid}
            player={p}
            rank={rankOffset + i + 1}
            focusRoleKey={focusRoleKey ?? null}
            isFavourite={favourites.includes(p.uid)}
            onClick={() => onPlayerClick(p)}
            onToggleFavourite={() => onToggleFavourite(p.uid)}
          />
        ))}
      </div>
    </div>
  );
}

interface CardProps {
  player: Player;
  rank: number;
  focusRoleKey: string | null;
  isFavourite: boolean;
  onClick: () => void;
  onToggleFavourite: () => void;
}

function PlayerCard({ player: p, rank, focusRoleKey, isFavourite, onClick, onToggleFavourite }: CardProps) {
  const trajColor = getTrajectoryColour(p.trajectoryPct);
  const trajLabel = getTrajectoryLabel(p.trajectoryPct, p.age);

  const displayRole = focusRoleKey && ROLE_MAP[focusRoleKey]
    ? ROLE_MAP[focusRoleKey].label
    : p.bestRoleLabel;
  const displayScore = focusRoleKey && p.roleScores[focusRoleKey] !== undefined
    ? p.roleScores[focusRoleKey]
    : p.bestRoleScore;

  const isYoung     = p.age <= 24;
  const youthRating = isYoung ? getNationYouthRating(p.nationality) : null;
  const nationTier  = youthRating !== null ? getNationTier(youthRating) : null;
  const clubRec     = isYoung ? getClubRecruitment(p.club) : null;
  const showYouth   = nationTier !== null || clubRec !== null;

  return (
    <div
      className="bg-[#1a2035] border border-[#2a3350] hover:border-[#4f8ef7]/50 rounded-xl p-4 cursor-pointer transition-all hover:bg-[#1e2640] group"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        {/* Rank */}
        <span className="text-[#7c8db0] text-sm font-mono w-5 text-center shrink-0">{rank}</span>

        {/* Name, Info & PlayStyles */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-white text-sm truncate">{p.name}</span>
            {p.inf && (
              <span className="text-xs text-[#f87171] font-medium">{p.inf}</span>
            )}
          </div>
          <div className="text-xs text-[#7c8db0] mt-0.5 flex flex-wrap gap-x-2">
            <span>{p.age}y</span>
            <span>{p.nationality}</span>
            <span className="truncate">{p.position}</span>
            <span className="truncate">{p.club}</span>
          </div>
          {p.playStyles.length > 0 && (
            <div className="mt-1.5">
              <PlayStyleRow playStyles={p.playStyles} max={19} />
            </div>
          )}
          {showYouth && (
            <div className="flex gap-1 mt-1 flex-wrap">
              {nationTier === 'Exceptional' && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-medium leading-none">
                  Exceptional Nation
                </span>
              )}
              {nationTier === 'Excellent' && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-300 font-medium leading-none">
                  Excellent Nation
                </span>
              )}
              {clubRec === 'Exceptional' && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-medium leading-none">
                  Exceptional Academy
                </span>
              )}
              {clubRec === 'Excellent' && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-300 font-medium leading-none">
                  Excellent Academy
                </span>
              )}
            </div>
          )}
        </div>

        {/* Role score */}
        <div className="hidden sm:block text-right min-w-0 shrink-0">
          <p className="text-xs text-[#7c8db0] truncate max-w-32">{displayRole}</p>
          <p className="text-sm font-mono text-white">{displayScore.toFixed(1)}</p>
        </div>

        {/* Trajectory */}
        <div className="text-right shrink-0">
          <div className="text-xs font-medium" style={{ color: trajColor }}>{trajLabel}</div>
          <div className="text-lg font-bold font-mono" style={{ color: trajColor }}>
            {p.trajectoryPct.toFixed(1)}%
          </div>
          <div className="text-xs text-[#7c8db0]">→ {p.projectedPeak.toFixed(1)}</div>
        </div>

        {/* Favourite button */}
        <button
          className="shrink-0 text-lg hover:scale-110 transition-transform"
          onClick={e => { e.stopPropagation(); onToggleFavourite(); }}
          title={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
        >
          {isFavourite ? '⭐' : '☆'}
        </button>
      </div>
    </div>
  );
}
