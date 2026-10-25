import type { JSX } from 'preact';
import type { TypeId } from '../data/schema';

/**
 * Painted-looking scene behind a drawing, one per type (the Brumouille card's rainy night is the model).
 * Pure SVG so it scales with the card and needs no image downloads.
 */
export function CardBackground({ type, uid }: { type: TypeId; uid: string }) {
  const hatch = `hatch-${uid}`;
  const sky = `sky-${uid}`;
  const scene = SCENES[type] ?? SCENES.normal;
  return (
    <svg class="card-bg" viewBox="0 0 300 190" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color={scene.sky[0]} />
          <stop offset="1" stop-color={scene.sky[1]} />
        </linearGradient>
        <pattern id={hatch} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform={`rotate(${scene.hatchAngle})`}>
          <line x1="0" y1="0" x2="0" y2="7" stroke={scene.hatchColor} stroke-width="1.1" opacity={scene.hatchOpacity} />
        </pattern>
      </defs>
      <rect width="300" height="190" fill={`url(#${sky})`} />
      {scene.draw()}
      <rect width="300" height="190" fill={`url(#${hatch})`} />
    </svg>
  );
}

interface Scene {
  sky: [string, string];
  hatchAngle: number;
  hatchColor: string;
  hatchOpacity: number;
  draw: () => JSX.Element;
}

const hills = (y: number, amp = 14) =>
  `M0 ${y} Q 50 ${y - amp} 100 ${y - 2} T 200 ${y - 4} T 300 ${y} V190 H0Z`;

const SCENES: Partial<Record<TypeId, Scene>> & { normal: Scene } = {
  spectre: {
    sky: ['#3d4866', '#56627c'], hatchAngle: 20, hatchColor: '#dfe6f5', hatchOpacity: 0.28,
    draw: () => (
      <g>
        <circle cx="42" cy="34" r="22" fill="#e8d980" />
        <circle cx="36" cy="30" r="4" fill="#d6c46a" />
        <circle cx="50" cy="42" r="3" fill="#d6c46a" />
        {[[110, 22], [250, 70], [80, 60], [200, 16], [275, 30]].map(([x, y]) => (
          <path d={`M${x} ${y} l2 -5 l2 5 l5 1 l-5 1 l-2 5 l-2 -5 l-5 -1z`} fill="#f4e7a1" />
        ))}
        <path d="M120 24 q6 -6 10 0 q4 -6 10 0 q-4 -2 -10 4 q-6 -6 -10 -4z" fill="#1c1a26" />
        <path d="M228 58 q6 -6 10 0 q4 -6 10 0 q-4 -2 -10 4 q-6 -6 -10 -4z" fill="#1c1a26" />
        <path d={hills(128, 20)} fill="#3e5a4c" />
        <path d={hills(150, 10)} fill="#30493d" />
        <path d="M262 150 V108 M262 120 l-12 -12 M262 116 l10 -14 M262 128 l14 -8 M276 120 l6 -8" stroke="#3a2a22" stroke-width="3" fill="none" stroke-linecap="round" />
        <path d="M240 152 V120 M240 130 l-8 -9 M240 126 l7 -10" stroke="#3a2a22" stroke-width="2.4" fill="none" stroke-linecap="round" />
        {[[40, 168], [252, 172]].map(([x, y]) => (
          <g>
            <ellipse cx={x} cy={y} rx="12" ry="9" fill="#e8892e" />
            <path d={`M${x - 5} ${y - 2} l2 -2 l2 2 M${x + 1} ${y - 2} l2 -2 l2 2 M${x - 5} ${y + 3} q5 4 10 0`} stroke="#5a2a0a" stroke-width="1.2" fill="none" />
            <rect x={x - 1} y={y - 12} width="2" height="4" fill="#4a6a2a" />
          </g>
        ))}
      </g>
    ),
  },
  plante: {
    sky: ['#a9dcf5', '#e4f6d8'], hatchAngle: -30, hatchColor: '#ffffff', hatchOpacity: 0.22,
    draw: () => (
      <g>
        <circle cx="255" cy="32" r="18" fill="#ffe27a" />
        <ellipse cx="70" cy="34" rx="30" ry="10" fill="#fff" opacity="0.8" />
        <ellipse cx="170" cy="22" rx="22" ry="8" fill="#fff" opacity="0.7" />
        <path d={hills(120, 24)} fill="#8ccf6a" />
        <path d={hills(148, 12)} fill="#5fae4a" />
        {[[30, 160, '#ff7aa8'], [80, 172, '#ffd23f'], [220, 166, '#ff7aa8'], [270, 176, '#fff'], [140, 180, '#ffd23f']].map(([x, y, c]) => (
          <g>
            <circle cx={x as number} cy={y as number} r="4" fill={c as string} />
            <circle cx={x as number} cy={y as number} r="1.6" fill="#f2a516" />
          </g>
        ))}
      </g>
    ),
  },
  feu: {
    sky: ['#f7a26a', '#fde3a8'], hatchAngle: 70, hatchColor: '#fff3d6', hatchOpacity: 0.25,
    draw: () => (
      <g>
        <circle cx="60" cy="60" r="26" fill="#ffde85" opacity="0.9" />
        <path d="M150 140 L205 50 h22 L285 140z" fill="#7b4a3a" />
        <path d="M205 50 h22 l-6 18 l-6 -8 l-5 10z" fill="#ff6b2b" />
        <path d="M212 46 q4 -16 14 -22 q-2 10 4 16" fill="#ff9a3c" opacity="0.8" />
        <path d={hills(140, 12)} fill="#c9714a" />
        <path d={hills(160, 8)} fill="#a5543a" />
        {[[40, 120], [110, 100], [250, 96], [180, 116]].map(([x, y]) => (
          <circle cx={x} cy={y} r="2.5" fill="#ffb43c" />
        ))}
      </g>
    ),
  },
  eau: {
    sky: ['#8fd0f3', '#d9f2fb'], hatchAngle: 0, hatchColor: '#ffffff', hatchOpacity: 0.2,
    draw: () => (
      <g>
        <circle cx="50" cy="34" r="16" fill="#fff4a8" />
        <ellipse cx="200" cy="30" rx="34" ry="10" fill="#fff" opacity="0.8" />
        <rect y="104" width="300" height="86" fill="#3f93d6" />
        {[112, 128, 146, 164].map((y, i) => (
          <path d={`M0 ${y} q 15 -6 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0`} stroke="#bfe6fb" stroke-width={2 - i * 0.3} fill="none" opacity="0.8" />
        ))}
        <path d="M0 176 Q 80 166 160 174 T 300 170 V190 H0Z" fill="#f2dfa6" />
        {[[40, 140], [260, 130], [230, 150]].map(([x, y]) => (
          <circle cx={x} cy={y} r="4" fill="none" stroke="#e7f7ff" stroke-width="1.4" />
        ))}
      </g>
    ),
  },
  electrique: {
    sky: ['#6f7a8f', '#e9dc93'], hatchAngle: 60, hatchColor: '#fffbe0', hatchOpacity: 0.25,
    draw: () => (
      <g>
        <ellipse cx="70" cy="30" rx="50" ry="16" fill="#58607a" />
        <ellipse cx="220" cy="24" rx="60" ry="16" fill="#58607a" />
        <path d="M60 40 l-10 26 h10 l-8 24 l22 -32 h-10 l8 -18z" fill="#ffe14a" />
        <path d="M232 36 l-8 20 h8 l-6 18 l18 -26 h-8 l6 -12z" fill="#ffe14a" />
        <path d={hills(132, 16)} fill="#b9b46a" />
        <path d={hills(156, 8)} fill="#9a9550" />
      </g>
    ),
  },
  fee: {
    sky: ['#f8c6e0', '#fdeef6'], hatchAngle: -45, hatchColor: '#ffffff', hatchOpacity: 0.3,
    draw: () => (
      <g>
        <path d="M30 150 A 120 120 0 0 1 270 150" stroke="#ff9ab8" stroke-width="7" fill="none" opacity="0.6" />
        <path d="M40 150 A 110 110 0 0 1 260 150" stroke="#ffd36e" stroke-width="7" fill="none" opacity="0.6" />
        <path d="M50 150 A 100 100 0 0 1 250 150" stroke="#9ad6ff" stroke-width="7" fill="none" opacity="0.6" />
        <ellipse cx="60" cy="40" rx="28" ry="10" fill="#fff" />
        <ellipse cx="240" cy="54" rx="24" ry="9" fill="#fff" />
        <path d={hills(150, 10)} fill="#f3b3d1" />
        {[[100, 30], [180, 60], [270, 20], [30, 90], [150, 110]].map(([x, y]) => (
          <path d={`M${x} ${y} l2 -6 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2z`} fill="#fff" />
        ))}
      </g>
    ),
  },
  insecte: {
    sky: ['#c3e6a8', '#eef7d8'], hatchAngle: 15, hatchColor: '#ffffff', hatchOpacity: 0.22,
    draw: () => (
      <g>
        <path d="M0 0 L60 0 L20 190 L0 190z" fill="#ffffff" opacity="0.25" />
        <path d="M150 0 L200 0 L170 190 L130 190z" fill="#ffffff" opacity="0.18" />
        <rect x="18" y="20" width="16" height="170" fill="#7a5a3a" />
        <rect x="262" y="10" width="14" height="180" fill="#7a5a3a" />
        <ellipse cx="26" cy="20" rx="40" ry="26" fill="#5c9a3a" />
        <ellipse cx="270" cy="14" rx="38" ry="26" fill="#5c9a3a" />
        <path d={hills(150, 10)} fill="#7dbb4e" />
        {[[80, 168], [200, 176], [240, 162]].map(([x, y]) => (
          <path d={`M${x} ${y} q-6 -10 0 -16 q6 6 0 16z`} fill="#4f8a32" />
        ))}
      </g>
    ),
  },
  normal: {
    sky: ['#bfe0f2', '#f4f1e4'], hatchAngle: -20, hatchColor: '#ffffff', hatchOpacity: 0.22,
    draw: () => (
      <g>
        <ellipse cx="80" cy="36" rx="34" ry="11" fill="#fff" />
        <ellipse cx="220" cy="28" rx="26" ry="9" fill="#fff" />
        <path d={hills(126, 18)} fill="#a8d38a" />
        <path d="M120 190 Q 150 150 140 126 L160 126 Q 170 150 200 190z" fill="#e8d5a8" />
        <path d={hills(156, 8)} fill="#8cc070" opacity="0.6" />
      </g>
    ),
  },
};
