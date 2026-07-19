/**
 * @file dynamicLogos.tsx
 * @description Animated SVG logo components using framer-motion.
 *
 * @features
 * - 10 animated logo designs (5 monkey, 5 banana motifs)
 * - Each accepts `isPaused` prop to freeze animation
 * - Uses DYNAMIC_SPEED for base animation duration
 */
import { motion } from 'framer-motion';
import { SvgWrapper } from '../utils/svg';
import { THEME, DYNAMIC_SPEED } from '../utils/theme';

export const DynamicLogos = [
  // 21. Morphing Polygon Ape
  ({ isPaused }: { isPaused: boolean }) => (
    <SvgWrapper>
      <motion.polygon
        points="30,40 50,30 70,40 60,60 40,60"
        fill="none"
        stroke={THEME.accentGold}
        strokeWidth="2"
        animate={
          isPaused
            ? { points: '30,40 50,30 70,40 60,60 40,60' }
            : {
                points: [
                  '30,40 50,30 70,40 60,60 40,60',
                  '25,45 50,20 75,45 65,70 35,70',
                  '30,40 50,30 70,40 60,60 40,60',
                ],
              }
        }
        transition={{ duration: DYNAMIC_SPEED, repeat: Infinity, ease: 'easeInOut' }}
      />
    </SvgWrapper>
  ),
  // 22. Pulsing Neon Nodes (Data Primate)
  ({ isPaused }: { isPaused: boolean }) => (
    <SvgWrapper>
      <polyline
        points="20,40 40,30 60,30 80,40"
        fill="none"
        stroke={THEME.accentWhite}
        strokeWidth="1"
        opacity="0.3"
      />
      {[20, 40, 60, 80].map((x, i) => (
        <motion.circle
          key={i}
          cx={x}
          cy={i === 1 || i === 2 ? 30 : 40}
          r="3"
          fill={THEME.accentNeon}
          animate={
            isPaused
              ? { scale: 1, opacity: 0.5 }
              : {
                  scale: [1, 2, 1],
                  opacity: [0.5, 1, 0.5],
                }
          }
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}
    </SvgWrapper>
  ),
  // 23. Drawing Monoline Face
  ({ isPaused }: { isPaused: boolean }) => (
    <SvgWrapper>
      <motion.path
        d="M20 50 C 20 20, 50 10, 50 30 C 50 10, 80 20, 80 50 C 80 80, 50 90, 50 70 C 50 90, 20 80, 20 50 Z"
        stroke={THEME.accentWhite}
        strokeWidth="1.5"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={isPaused ? { pathLength: 1 } : { pathLength: [0, 1, 0] }}
        transition={{ duration: DYNAMIC_SPEED * 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />
    </SvgWrapper>
  ),
  // 24. Orbiting Geometric Brain (Monkey)
  ({ isPaused }: { isPaused: boolean }) => (
    <SvgWrapper>
      <circle cx="50" cy="50" r="15" fill="none" stroke={THEME.accentGold} strokeWidth="2" />
      <motion.g
        animate={isPaused ? { rotate: 0 } : { rotate: 360 }}
        transition={{ duration: DYNAMIC_SPEED * 2, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: '50px 50px' }}
      >
        <circle cx="50" cy="20" r="4" fill={THEME.accentNeon} />
        <circle cx="50" cy="80" r="4" fill={THEME.accentNeon} />
      </motion.g>
    </SvgWrapper>
  ),
  // 25. Shifting Isometric Ape Grid
  ({ isPaused }: { isPaused: boolean }) => (
    <SvgWrapper>
      <motion.path
        d="M50 20 L80 35 L80 65 L50 80 L20 65 L20 35 Z"
        stroke={THEME.accentWhite}
        strokeWidth="1"
        fill="none"
        animate={
          isPaused
            ? { strokeWidth: 1 }
            : {
                strokeWidth: [1, 3, 1],
                stroke: [THEME.accentWhite, THEME.accentGold, THEME.accentWhite],
              }
        }
        transition={{ duration: DYNAMIC_SPEED, repeat: Infinity }}
      />
    </SvgWrapper>
  ),
  // 26. Dynamic Yield Curve (Banana)
  ({ isPaused }: { isPaused: boolean }) => (
    <SvgWrapper>
      <path d="M10 90 L 90 90" stroke={THEME.accentWhite} strokeWidth="1" opacity="0.2" />
      <motion.path
        d="M10 90 Q 50 90, 90 10"
        stroke={THEME.accentNeon}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={isPaused ? { pathLength: 1 } : { pathLength: [0, 1, 1, 0] }}
        transition={{ duration: DYNAMIC_SPEED, repeat: Infinity, ease: 'easeInOut' }}
      />
    </SvgWrapper>
  ),
  // 27. Morphing Crescent Thickness
  ({ isPaused }: { isPaused: boolean }) => (
    <SvgWrapper>
      <motion.path
        fill={THEME.accentGold}
        animate={
          isPaused
            ? { d: 'M70 20 A 45 45 0 0 1 30 80 A 55 55 0 0 0 70 20 Z' }
            : {
                d: [
                  'M70 20 A 45 45 0 0 1 30 80 A 55 55 0 0 0 70 20 Z',
                  'M70 20 A 45 45 0 0 1 30 80 A 40 40 0 0 0 70 20 Z',
                  'M70 20 A 45 45 0 0 1 30 80 A 55 55 0 0 0 70 20 Z',
                ],
              }
        }
        transition={{ duration: DYNAMIC_SPEED, repeat: Infinity, ease: 'easeInOut' }}
      />
    </SvgWrapper>
  ),
  // 28. Orbiting Liquidity Nodes (Banana Curve)
  ({ isPaused }: { isPaused: boolean }) => (
    <SvgWrapper>
      <path
        d="M80 20 A 60 60 0 0 1 20 80"
        stroke={THEME.accentWhite}
        strokeWidth="1"
        opacity="0.3"
        fill="none"
      />
      <motion.circle
        r="4"
        fill={THEME.accentNeon}
        animate={
          isPaused ? { offsetDistance: '100%' } : { offsetDistance: ['0%', '100%', '0%'] }
        }
        transition={{ duration: DYNAMIC_SPEED * 1.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ offsetPath: 'path("M80 20 A 60 60 0 0 1 20 80")' }}
      />
    </SvgWrapper>
  ),
  // 29. Sine Wave Amplitude Shift
  ({ isPaused }: { isPaused: boolean }) => (
    <SvgWrapper>
      <motion.path
        stroke={THEME.accentGold}
        strokeWidth="2"
        fill="none"
        animate={
          isPaused
            ? { d: 'M10 50 Q 30 10, 50 50 T 90 50' }
            : {
                d: [
                  'M10 50 Q 30 10, 50 50 T 90 50',
                  'M10 50 Q 30 30, 50 50 T 90 50',
                  'M10 50 Q 30 10, 50 50 T 90 50',
                ],
              }
        }
        transition={{ duration: DYNAMIC_SPEED, repeat: Infinity, ease: 'easeInOut' }}
      />
    </SvgWrapper>
  ),
  // 30. Glowing Perimeter Traversal
  ({ isPaused }: { isPaused: boolean }) => (
    <SvgWrapper>
      <path
        d="M75 25 Q 25 25, 25 75"
        stroke={THEME.accentWhite}
        strokeWidth="4"
        opacity="0.1"
        fill="none"
        strokeLinecap="round"
      />
      <motion.path
        d="M75 25 Q 25 25, 25 75"
        stroke={THEME.accentWhite}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeDasharray="50 150"
        animate={isPaused ? { strokeDashoffset: 0 } : { strokeDashoffset: [200, -50] }}
        transition={{ duration: DYNAMIC_SPEED, repeat: Infinity, ease: 'linear' }}
      />
    </SvgWrapper>
  ),
];
