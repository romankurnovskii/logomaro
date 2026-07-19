/**
 * @file staticMonkeys.tsx
 * @description Static SVG monkey/ape motif logo components.
 *
 * @features
 * - 10 geometric abstract primate SVG designs
 * - Uses THEME accent colors for stroke/fill
 * - Each is a self-contained React component
 */
import { SvgWrapper } from '../utils/svg';
import { THEME } from '../utils/theme';

export const StaticMonkeys = [
  // 1. Hexagonal Abstract Brow
  () => (
    <SvgWrapper>
      <path
        d="M20 50 L35 30 L50 40 L65 30 L80 50 L65 70 L50 60 L35 70 Z"
        stroke={THEME.accentGold}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="35" cy="50" r="3" fill={THEME.accentGold} />
      <circle cx="65" cy="50" r="3" fill={THEME.accentGold} />
    </SvgWrapper>
  ),
  // 2. Wireframe Node Primate
  () => (
    <SvgWrapper>
      <polyline
        points="15,45 30,25 50,35 70,25 85,45"
        stroke={THEME.accentWhite}
        strokeWidth="1.5"
        strokeLinejoin="bevel"
      />
      <polyline
        points="30,25 35,55 50,75 65,55 70,25"
        stroke={THEME.accentWhite}
        strokeWidth="1.5"
        opacity="0.5"
      />
      <circle cx="50" cy="75" r="2" fill={THEME.accentNeon} />
    </SvgWrapper>
  ),
  // 3. Continuous Monoline Face
  () => (
    <SvgWrapper>
      <path
        d="M25 60 C 25 30, 45 20, 50 35 C 55 20, 75 30, 75 60 C 75 80, 60 85, 50 75 C 40 85, 25 80, 25 60 Z"
        stroke={THEME.accentNeon}
        strokeWidth="2"
      />
    </SvgWrapper>
  ),
  // 4. Intersecting Data Circles (Eyes/Brain)
  () => (
    <SvgWrapper>
      <circle cx="40" cy="45" r="20" stroke={THEME.accentGold} strokeWidth="1" opacity="0.7" />
      <circle cx="60" cy="45" r="20" stroke={THEME.accentGold} strokeWidth="1" opacity="0.7" />
      <circle
        cx="50"
        cy="65"
        r="15"
        stroke={THEME.accentWhite}
        strokeWidth="1.5"
        strokeDasharray="4 2"
      />
    </SvgWrapper>
  ),
  // 5. M-Shape Financial Chart
  () => (
    <SvgWrapper>
      <path
        d="M10 80 L30 30 L50 50 L70 20 L90 70"
        stroke={THEME.accentWhite}
        strokeWidth="2"
        strokeLinecap="square"
      />
      <path d="M30 30 L50 70 L70 20" stroke={THEME.accentNeon} strokeWidth="2" opacity="0.8" />
    </SvgWrapper>
  ),
  // 6. Isometric Cube Primate
  () => (
    <SvgWrapper>
      <polygon
        points="50,15 80,30 80,65 50,80 20,65 20,30"
        stroke={THEME.accentGold}
        strokeWidth="1.5"
      />
      <polyline points="20,30 50,45 80,30" stroke={THEME.accentGold} strokeWidth="1.5" />
      <polyline points="50,45 50,80" stroke={THEME.accentGold} strokeWidth="1.5" />
      <circle cx="35" cy="45" r="2" fill={THEME.accentWhite} />
      <circle cx="65" cy="45" r="2" fill={THEME.accentWhite} />
    </SvgWrapper>
  ),
  // 7. Radar Sweep Ape
  () => (
    <SvgWrapper>
      <path d="M50 10 A40 40 0 0 1 90 50" stroke={THEME.accentNeon} strokeWidth="2" />
      <path
        d="M50 90 A40 40 0 0 1 10 50"
        stroke={THEME.accentNeon}
        strokeWidth="2"
        opacity="0.4"
      />
      <polygon points="45,45 55,45 50,60" fill={THEME.accentWhite} />
    </SvgWrapper>
  ),
  // 8. Concentric Diamond Brow
  () => (
    <SvgWrapper>
      <polygon points="50,20 75,45 50,70 25,45" stroke={THEME.accentWhite} strokeWidth="1" />
      <polygon points="50,30 65,45 50,60 35,45" stroke={THEME.accentGold} strokeWidth="2" />
      <line x1="25" y1="45" x2="10" y2="45" stroke={THEME.accentWhite} strokeWidth="1" />
      <line x1="75" y1="45" x2="90" y2="45" stroke={THEME.accentWhite} strokeWidth="1" />
    </SvgWrapper>
  ),
  // 9. Soundwave Vertical Bars
  () => (
    <SvgWrapper>
      <rect x="25" y="30" width="4" height="40" fill={THEME.accentNeon} opacity="0.5" />
      <rect x="35" y="20" width="4" height="60" fill={THEME.accentNeon} />
      <rect x="45" y="40" width="4" height="30" fill={THEME.accentWhite} />
      <rect x="55" y="40" width="4" height="30" fill={THEME.accentWhite} />
      <rect x="65" y="20" width="4" height="60" fill={THEME.accentNeon} />
      <rect x="75" y="30" width="4" height="40" fill={THEME.accentNeon} opacity="0.5" />
    </SvgWrapper>
  ),
  // 10. Minimalist Shield/Primate
  () => (
    <SvgWrapper>
      <path
        d="M20 20 L80 20 L70 70 L50 90 L30 70 Z"
        stroke={THEME.accentGold}
        strokeWidth="1.5"
      />
      <path d="M35 40 L65 40" stroke={THEME.accentWhite} strokeWidth="2" />
    </SvgWrapper>
  ),
];
