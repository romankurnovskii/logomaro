/**
 * @file staticBananas.tsx
 * @description Static SVG banana/crescent motif logo components.
 *
 * @features
 * - 10 geometric abstract crescent and yield-curve SVG designs
 * - Uses THEME accent colors for stroke/fill
 * - Each is a self-contained React component
 */
import { SvgWrapper } from '../utils/svg';
import { THEME } from '../utils/theme';

export const StaticBananas = [
  // 11. Pure Geometric Crescent
  () => (
    <SvgWrapper>
      <path
        d="M70 20 A 45 45 0 0 1 30 80 A 55 55 0 0 0 70 20 Z"
        fill={THEME.accentGold}
        opacity="0.9"
      />
    </SvgWrapper>
  ),
  // 12. Intersecting Orbits (Golden Ratio Banana)
  () => (
    <SvgWrapper>
      <circle
        cx="35"
        cy="35"
        r="40"
        stroke={THEME.accentWhite}
        strokeWidth="1"
        opacity="0.3"
      />
      <circle
        cx="65"
        cy="65"
        r="40"
        stroke={THEME.accentWhite}
        strokeWidth="1"
        opacity="0.3"
      />
      <path
        d="M73 27 A 40 40 0 0 0 27 73 A 40 40 0 0 0 73 27 Z"
        stroke={THEME.accentNeon}
        strokeWidth="2"
      />
    </SvgWrapper>
  ),
  // 13. Line Chart Yield Curve
  () => (
    <SvgWrapper>
      <path
        d="M15 85 Q 40 85, 60 60 T 85 15"
        stroke={THEME.accentWhite}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="85" cy="15" r="4" fill={THEME.accentGold} />
    </SvgWrapper>
  ),
  // 14. Segmented Pie/Crescent
  () => (
    <SvgWrapper>
      <path
        d="M60 20 A 40 40 0 0 1 30 75 L 40 65 A 25 25 0 0 0 60 30 Z"
        fill={THEME.accentGold}
      />
      <path
        d="M70 15 A 50 50 0 0 1 25 80 L 28 77 A 45 45 0 0 0 68 18 Z"
        fill={THEME.accentNeon}
      />
    </SvgWrapper>
  ),
  // 15. Wireframe Crescent Mesh
  () => (
    <SvgWrapper>
      <path
        d="M65 20 Q 20 20, 20 80"
        stroke={THEME.accentWhite}
        strokeWidth="1"
        opacity="0.5"
      />
      <path d="M75 15 Q 15 15, 15 85" stroke={THEME.accentWhite} strokeWidth="1.5" />
      <path d="M85 10 Q 10 10, 10 90" stroke={THEME.accentWhite} strokeWidth="2" />
      <line
        x1="15"
        y1="85"
        x2="65"
        y2="20"
        stroke={THEME.accentNeon}
        strokeWidth="1"
        opacity="0.4"
      />
    </SvgWrapper>
  ),
  // 16. Fibonacci Spiral Section
  () => (
    <SvgWrapper>
      <rect
        x="20"
        y="20"
        width="60"
        height="60"
        stroke={THEME.accentGold}
        strokeWidth="0.5"
        opacity="0.3"
        fill="none"
      />
      <path
        d="M80 80 A 60 60 0 0 1 20 20"
        stroke={THEME.accentGold}
        strokeWidth="3"
        strokeLinecap="square"
      />
    </SvgWrapper>
  ),
  // 17. Minimalist Dot and Arc
  () => (
    <SvgWrapper>
      <path
        d="M80 20 A 50 50 0 0 1 20 80"
        stroke={THEME.accentWhite}
        strokeWidth="2"
        strokeDasharray="4 6"
      />
      <path d="M70 30 A 35 35 0 0 1 30 70" stroke={THEME.accentNeon} strokeWidth="2" />
      <circle cx="70" cy="30" r="3" fill={THEME.accentWhite} />
    </SvgWrapper>
  ),
  // 18. Multi-layered Flow
  () => (
    <SvgWrapper>
      <path d="M20 90 C 20 50, 50 20, 90 20" stroke={THEME.accentGold} strokeWidth="1" />
      <path d="M25 90 C 25 55, 55 25, 90 25" stroke={THEME.accentGold} strokeWidth="2" />
      <path d="M30 90 C 30 60, 60 30, 90 30" stroke={THEME.accentGold} strokeWidth="1" />
    </SvgWrapper>
  ),
  // 19. Geometric Intersection
  () => (
    <SvgWrapper>
      <rect
        x="40"
        y="20"
        width="20"
        height="60"
        transform="rotate(45 50 50)"
        fill={THEME.accentWhite}
        opacity="0.1"
      />
      <path d="M70 30 Q 30 30, 30 70" stroke={THEME.accentNeon} strokeWidth="3" />
    </SvgWrapper>
  ),
  // 20. Institutional Sharp Curve
  () => (
    <SvgWrapper>
      <path
        d="M85 15 L 65 15 Q 15 15, 15 65 L 15 85 Q 15 35, 65 35 L 85 35 Z"
        fill={THEME.accentGold}
      />
    </SvgWrapper>
  ),
];
