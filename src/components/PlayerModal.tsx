import { useState } from 'react';
import type { Player, PlayStyleResult } from '../types';
import { getAttrColour, getTrajectoryColour, getTrajectoryLabel } from '../lib/calculateTrajectory';
import type { Shortlist } from '../types';
import { PlayStyleBadge } from './PlayStyleBadge';
import { PLAY_STYLE_DEFS } from '../lib/playStyles';
import { getNationYouthRating, getClubRecruitment, nationRatingColour } from '../lib/youthData';

interface Props {
  player: Player;
  isFavourite: boolean;
  shortlists: Shortlist[];
  onToggleFavourite: () => void;
  onAddToShortlist: (shortlistId: string) => void;
  onCreateShortlist: (name: string) => string;
  onClose: () => void;
}

const TECHNICAL = ['Cor','Cro','Dri','Fin','Fir','Fla','Hea','Lon','Mar','Pas','Tck','Tec'] as const;
const MENTAL    = ['Agg','Ant','Bra','Cmp','Cnt','Dec','Det','Fla','Ldr','OtB','Pos','Tea','Vis','Wor'] as const;
const PHYSICAL  = ['Acc','Agi','Bal','Jum','Pac','Sta','Str'] as const;
const GK_ATTRS  = ['1v1','Aer','Cmd','Han','Kic','Ref','TRO','Thr'] as const;

function PlayStylesSection({
  playStyles,
  hoveredId,
  onHover,
}: {
  playStyles: PlayStyleResult[];
  hoveredId: string | null;
  onHover: (id: string | null) => void;
}) {
  const plus = playStyles.filter(ps => ps.tier === 'plus');
  const standard = playStyles.filter(ps => ps.tier === 'standard');

  const renderBadge = (ps: PlayStyleResult) => (
    <div
      key={ps.id}
      onMouseEnter={() => onHover(ps.id)}
      onMouseLeave={() => onHover(null)}
      className={`rounded-lg p-1 transition-colors cursor-default ${
        hoveredId === ps.id ? 'bg-[#2a3350]' : 'hover:bg-[#1e2640]'
      }`}
    >
      <PlayStyleBadge playStyle={ps} size={48} showLabel />
    </div>
  );

  return (
    <div className="px-5 pb-4 border-b border-[#2a3350]">
      <h4 className="text-xs font-semibold text-[#7c8db0] uppercase tracking-wider mb-3">
        Play Styles
        {hoveredId && (
          <span className="ml-2 normal-case font-normal text-[#4f8ef7]">
            — hover highlights contributing attributes
          </span>
        )}
      </h4>
      {playStyles.length === 0 ? (
        <p className="text-xs text-[#7c8db0]">No PlayStyles unlocked.</p>
      ) : (
        <div className="space-y-3">
          {plus.length > 0 && (
            <div>
              <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider mb-2">PlayStyle+</p>
              <div className="flex flex-wrap gap-1">{plus.map(renderBadge)}</div>
            </div>
          )}
          {standard.length > 0 && (
            <div>
              <p className="text-[10px] text-[#7c8db0] font-semibold uppercase tracking-wider mb-2">PlayStyle</p>
              <div className="flex flex-wrap gap-1">{standard.map(renderBadge)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AttrBlock({
  label,
  keys,
  attrs,
  primaryHighlight,
  supportHighlight,
}: {
  label: string;
  keys: readonly string[];
  attrs: Record<string, number>;
  primaryHighlight?: Set<string>;
  supportHighlight?: Set<string>;
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-[#7c8db0] uppercase tracking-wider mb-2">{label}</h4>
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
        {keys.map(k => {
          const isPrimary = primaryHighlight?.has(k);
          const isSupport = supportHighlight?.has(k);
          return (
            <div
              key={k}
              className={`flex items-center justify-between text-sm rounded px-1 py-0.5 transition-colors ${
                isPrimary
                  ? 'bg-amber-400/15'
                  : isSupport
                    ? 'bg-[#4f8ef7]/10'
                    : ''
              }`}
            >
              <span className={
                isPrimary
                  ? 'text-amber-300 font-semibold'
                  : isSupport
                    ? 'text-[#7ab4ff]'
                    : 'text-[#7c8db0]'
              }>
                {k}
              </span>
              <span className="font-bold font-mono" style={{ color: getAttrColour(attrs[k] ?? 0) }}>
                {attrs[k] ?? '-'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PlayerModal({ player: p, isFavourite, shortlists, onToggleFavourite, onAddToShortlist, onCreateShortlist, onClose }: Props) {
  const trajColor = getTrajectoryColour(p.trajectoryPct);
  const trajLabel = getTrajectoryLabel(p.trajectoryPct, p.age);
  const attrs = p.attrs as Record<string, number>;

  const [hoveredPsId, setHoveredPsId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(p.name);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const hoveredDef = hoveredPsId ? PLAY_STYLE_DEFS.find(d => d.id === hoveredPsId) : null;
  const primarySet = new Set<string>(hoveredDef?.primary ?? []);
  const supportSet = new Set<string>(hoveredDef?.support ?? []);

  const isYoung     = p.age <= 24;
  const youthRating = isYoung ? getNationYouthRating(p.nationality) : null;
  const clubRec     = isYoung ? getClubRecruitment(p.club) : null;

  const handleNewShortlist = () => {
    const name = prompt('Shortlist name:');
    if (!name?.trim()) return;
    const id = onCreateShortlist(name.trim());
    onAddToShortlist(id);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-start justify-center z-50 p-4 overflow-y-auto" onClick={onClose}>
      <div
        className="bg-[#1a2035] border border-[#2a3350] rounded-xl w-full max-w-2xl my-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#2a3350]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white truncate">{p.name}</h2>
                <button
                  onClick={handleCopy}
                  title="Copy name"
                  className="text-xs px-2 py-0.5 rounded border border-[#2a3350] text-[#7c8db0] hover:text-white hover:border-[#4a5568] transition-colors shrink-0"
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-sm text-[#7c8db0]">
                <span>{p.age} years old</span>
                <span>{p.nationality}{p.nationality2 ? ` / ${p.nationality2}` : ''}</span>
                <span>{p.position}</span>
                <span>{p.club}</span>
                {p.height && <span>{p.height}</span>}
              </div>
              <div className="flex gap-3 mt-1 text-xs text-[#7c8db0]">
                <span>L: <span className="text-white">{p.leftFoot}</span></span>
                <span>R: <span className="text-white">{p.rightFoot}</span></span>
                {p.personality && <span>{p.personality}</span>}
              </div>
              <div className="flex gap-3 mt-1 text-xs text-[#7c8db0]">
                <span>Wage: <span className="text-white">{p.wage || '-'}</span></span>
                <span>Value: <span className="text-white">{p.transferValue || '-'}</span></span>
                {p.avgRating && <span>Avg Rat: <span className="text-white">{p.avgRating}</span></span>}
              </div>
              {(youthRating !== null || clubRec) && (
                <div className="flex gap-3 mt-1 text-xs text-[#7c8db0]">
                  {youthRating !== null && (
                    <span>
                      Youth:{' '}
                      <span className="font-bold font-mono" style={{ color: nationRatingColour(youthRating) }}>
                        {youthRating}
                      </span>
                    </span>
                  )}
                  {clubRec && (
                    <span>
                      Academy:{' '}
                      <span className="font-semibold" style={{ color: clubRec === 'Exceptional' ? '#f59e0b' : '#34d399' }}>
                        {clubRec}
                      </span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Trajectory panel */}
            <div className="text-right shrink-0">
              <div className="text-xs font-medium mb-0.5" style={{ color: trajColor }}>{trajLabel}</div>
              <div className="text-3xl font-bold font-mono" style={{ color: trajColor }}>
                {p.trajectoryPct.toFixed(1)}%
              </div>
              <div className="text-sm text-[#7c8db0]">
                Peak: <span className="text-white font-mono">{p.projectedPeak.toFixed(1)}</span>
              </div>
              <div className="text-xs text-[#7c8db0] mt-1">Best role:</div>
              <div className="text-xs text-white font-medium">{p.bestRoleLabel}</div>
              <div className="text-sm font-mono text-white">{p.bestRoleScore.toFixed(1)}</div>
            </div>
          </div>
        </div>

        {/* PlayStyles */}
        <PlayStylesSection
          playStyles={p.playStyles}
          hoveredId={hoveredPsId}
          onHover={setHoveredPsId}
        />

        {/* Attributes */}
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <AttrBlock label="Technical" keys={TECHNICAL} attrs={attrs} primaryHighlight={primarySet} supportHighlight={supportSet} />
          <AttrBlock label="Mental" keys={MENTAL} attrs={attrs} primaryHighlight={primarySet} supportHighlight={supportSet} />
          <AttrBlock label="Physical" keys={PHYSICAL} attrs={attrs} primaryHighlight={primarySet} supportHighlight={supportSet} />
          {p.positionCategory === 'GK' && (
            <AttrBlock label="Goalkeeping" keys={GK_ATTRS} attrs={attrs} primaryHighlight={primarySet} supportHighlight={supportSet} />
          )}
        </div>

        {/* Highlight legend */}
        {hoveredPsId && (
          <div className="px-5 pb-3 flex gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm bg-amber-400/30 border border-amber-400/50" />
              <span className="text-amber-300">Primary attribute</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm bg-[#4f8ef7]/20 border border-[#4f8ef7]/40" />
              <span className="text-[#7ab4ff]">Support attribute</span>
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="p-5 border-t border-[#2a3350] flex flex-wrap gap-3 items-center">
          <button
            onClick={onToggleFavourite}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isFavourite
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30'
                : 'bg-[#0f1320] text-[#7c8db0] border border-[#2a3350] hover:text-white hover:border-[#4f8ef7]/50'
            }`}
          >
            {isFavourite ? '⭐ Favourited' : '☆ Add to Favourites'}
          </button>

          {shortlists.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {shortlists.map(s => (
                <button
                  key={s.id}
                  onClick={() => onAddToShortlist(s.id)}
                  disabled={s.playerUids.includes(p.uid)}
                  className="px-3 py-2 text-xs rounded-lg bg-[#0f1320] border border-[#2a3350] text-[#7c8db0] hover:text-white hover:border-[#4f8ef7]/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {s.playerUids.includes(p.uid) ? `✓ ${s.name}` : `+ ${s.name}`}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={handleNewShortlist}
            className="px-3 py-2 text-xs rounded-lg bg-[#4f8ef7]/20 text-[#4f8ef7] border border-[#4f8ef7]/30 hover:bg-[#4f8ef7]/30 transition-colors"
          >
            + New Shortlist
          </button>

          <button onClick={onClose} className="ml-auto text-[#7c8db0] hover:text-white text-sm transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
