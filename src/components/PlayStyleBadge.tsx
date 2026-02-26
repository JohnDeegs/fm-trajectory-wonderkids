import type { PlayStyleResult } from '../types';

// Maps playstyle ID → filename in /public/playstyle-icons/
const ICON_FILES: Record<string, string> = {
  finesse_shot:     'finesseshot.png',
  power_shot:       'powershot.png',
  gamechanger:      'gamechanger.png',
  precision_header: 'precisionheader.png',
  dead_ball:        'deadball.png',
  incisive_pass:    'incisivepass.png',
  pinged_pass:      'pingedpass.png',
  inventive:        'inventive.png',
  whipped_pass:     'whippedpass.png',
  tiki_taka:        'tikitaka.png',
  anticipate:       'anticipate.png',
  intercept:        'intercept.png',
  bruiser:          'bruiser.png',
  aerial_fortress:  'arielfortress.png',
  enforcer:         'enforcer.png',
  quick_step:       'quickstep.png',
  rapid:            'rapid.png',
  technical:        'technical.png',
  press_proven:     'pressproven.png',
};

interface Props {
  playStyle: PlayStyleResult;
  size?: number;
  showLabel?: boolean;
}

export function PlayStyleBadge({ playStyle, size = 32, showLabel = false }: Props) {
  const isPlus = playStyle.tier === 'plus';
  const filename = ICON_FILES[playStyle.id];

  const badge = (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      title={playStyle.label + (isPlus ? ' (PlayStyle+)' : '')}
    >
      {filename ? (
        <img
          src={`/playstyle-icons/${filename}`}
          alt={playStyle.label}
          style={{ width: size, height: size, objectFit: 'contain', display: 'block' }}
        />
      ) : (
        <div
          className="rounded-full bg-[#2a3350]"
          style={{ width: size, height: size }}
        />
      )}

      {/* PlayStyle+ gold chevron — top-right corner */}
      {isPlus && (
        <div
          className="absolute top-0 right-0 flex items-center justify-center"
          style={{ width: size * 0.42, height: size * 0.42 }}
        >
          <svg
            viewBox="0 0 12 12"
            style={{ width: size * 0.38, height: size * 0.38 }}
            fill="none"
          >
            <circle cx="6" cy="6" r="5.5" fill="#1a1a2e" />
            <polyline
              points="4,8 7,5 10,8"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  );

  if (showLabel) {
    return (
      <div className="flex flex-col items-center gap-1">
        {badge}
        <span
          className="text-center leading-tight"
          style={{
            fontSize: Math.max(9, size * 0.3),
            color: isPlus ? '#f59e0b' : '#7c8db0',
            maxWidth: size * 1.8,
          }}
        >
          {playStyle.label}
        </span>
      </div>
    );
  }

  return badge;
}

/** Compact row of playstyle badges for search result cards. */
export function PlayStyleRow({ playStyles, max = 5 }: { playStyles: PlayStyleResult[]; max?: number }) {
  if (playStyles.length === 0) return null;

  // Sort: plus first, then standard
  const sorted = [...playStyles].sort((a, b) => {
    if (a.tier === b.tier) return 0;
    return a.tier === 'plus' ? -1 : 1;
  });

  const visible = sorted.slice(0, max);
  const overflow = sorted.length - max;

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {visible.map(ps => (
        <PlayStyleBadge key={ps.id} playStyle={ps} size={30} />
      ))}
      {overflow > 0 && (
        <span className="text-[10px] text-[#7c8db0] bg-[#2a3350] rounded px-1 py-0.5 leading-none">
          +{overflow}
        </span>
      )}
    </div>
  );
}
