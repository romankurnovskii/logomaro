/**
 * @file logoGenerators.tsx
 * @description Functions for creating AI-driven and random procedural logos.
 *
 * @features
 * - `createAILogo` — builds a Logo from AI-generated data
 * - `createRandomLogo` — generates a procedural random logo
 * - `GENERIC_MOTIFS` — pool of motif names for random logos
 */
import { motion } from 'framer-motion';
import type { Logo, AILogoData } from '../types/logo';
import { SvgWrapper } from './svg';
import { THEME } from './theme';

export const GENERIC_MOTIFS = [
  'Nexus',
  'Vertex',
  'Flux',
  'Orbit',
  'Aether',
  'Quantum',
  'Synapse',
  'Cipher',
  'Vortex',
  'Prism',
  'Matrix',
  'Core',
];

export const createAILogo = (aiData: AILogoData, index: number): Logo => {
  const { motifName, primaryColor, secondaryColor, elements } = aiData;
  const c1 = primaryColor || THEME.accentGold;
  const c2 = secondaryColor || THEME.accentNeon;

  const Component = ({ isPaused }: { isPaused: boolean }) => (
    <SvgWrapper>
      {elements?.map((el, i) => {
        const strokeColor = el.strokeType === 'primary' ? c1 : c2;
        const animProps =
          el.isAnimated && !isPaused
            ? {
                animate: {
                  opacity: [0.6, 1, 0.6],
                  scale: el.shape === 'circle' ? [0.95, 1.05, 0.95] : 1,
                },
                transition: {
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.2,
                },
              }
            : {};

        if (el.shape === 'path' && el.d) {
          return (
            <motion.path
              key={i}
              d={el.d}
              fill="none"
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              {...animProps}
            />
          );
        }
        if (el.shape === 'circle' && el.cx != null) {
          return (
            <motion.circle
              key={i}
              cx={el.cx}
              cy={el.cy}
              r={el.r}
              fill="none"
              stroke={strokeColor}
              strokeWidth="2"
              {...animProps}
            />
          );
        }
        if (el.shape === 'polygon' && el.points) {
          return (
            <motion.polygon
              key={i}
              points={el.points}
              fill="none"
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinejoin="round"
              {...animProps}
            />
          );
        }
        if (el.shape === 'rect' && el.x != null) {
          return (
            <motion.rect
              key={i}
              x={el.x}
              y={el.y}
              width={el.width}
              height={el.height}
              fill="none"
              stroke={strokeColor}
              strokeWidth="2"
              {...animProps}
            />
          );
        }
        return null;
      })}
    </SvgWrapper>
  );

  return {
    id: `AI-GEN-${String(index).padStart(4, '0')}`,
    type: 'ai-driven',
    motif: motifName || 'Neural Synthesis',
    Component,
  };
};

export const createRandomLogo = (index: number): Logo => {
  const type = Math.random() > 0.3 ? 'dynamic' : 'static';
  const motif = GENERIC_MOTIFS[Math.floor(Math.random() * GENERIC_MOTIFS.length)];
  const structureType = Math.floor(Math.random() * 5);

  const colors = [THEME.accentGold, THEME.accentNeon, THEME.accentWhite, THEME.textSecondary];
  const c1 = colors[Math.floor(Math.random() * colors.length)];
  let c2 = colors[Math.floor(Math.random() * colors.length)];
  while (c1 === c2) c2 = colors[Math.floor(Math.random() * colors.length)];

  const duration = Math.random() * 4 + 2;
  const isAnim = type === 'dynamic';

  const p = {
    cx: Math.random() * 20 + 40,
    cy: Math.random() * 20 + 40,
    r1: Math.random() * 15 + 15,
    r2: Math.random() * 15 + 30,
    nodes: Array(5)
      .fill(0)
      .map(() => ({ x: Math.random() * 70 + 15, y: Math.random() * 70 + 15 })),
    poly1: `${Math.random() * 30 + 10},${Math.random() * 30 + 10} ${Math.random() * 30 + 60},${Math.random() * 30 + 10} ${Math.random() * 30 + 35},${Math.random() * 30 + 70}`,
    poly2: `${Math.random() * 30 + 20},${Math.random() * 30 + 20} ${Math.random() * 30 + 70},${Math.random() * 30 + 20} ${Math.random() * 30 + 45},${Math.random() * 30 + 60}`,
    curveY: Math.random() * 40 + 30,
  };

  const Component = ({ isPaused }: { isPaused: boolean }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const animState = (activeObj: any, staticObj: any) =>
      isAnim && !isPaused ? activeObj : staticObj;

    switch (structureType) {
      case 0:
        return (
          <SvgWrapper>
            <motion.circle
              cx="50"
              cy="50"
              r={p.r1}
              fill="none"
              stroke={c1}
              strokeWidth="2"
              strokeDasharray={`${Math.random() * 20 + 10} ${Math.random() * 20 + 10}`}
              animate={animState({ rotate: 360 }, { rotate: 0 })}
              transition={{ duration, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: '50px 50px' }}
            />
            <motion.circle
              cx="50"
              cy="50"
              r={p.r2}
              fill="none"
              stroke={c2}
              strokeWidth="1.5"
              strokeDasharray={`${Math.random() * 30 + 10} ${Math.random() * 30 + 10}`}
              animate={animState({ rotate: -360 }, { rotate: 0 })}
              transition={{ duration: duration * 1.5, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: '50px 50px' }}
            />
            <circle cx="50" cy="50" r="3" fill={c1} />
          </SvgWrapper>
        );
      case 1:
        return (
          <SvgWrapper>
            <path
              d={`M${p.nodes[0].x} ${p.nodes[0].y} L${p.nodes[1].x} ${p.nodes[1].y} L${p.nodes[2].x} ${p.nodes[2].y} L${p.nodes[3].x} ${p.nodes[3].y} L${p.nodes[4].x} ${p.nodes[4].y} Z`}
              fill="none"
              stroke={c1}
              strokeWidth="1"
              opacity="0.4"
            />
            {p.nodes.map((n, i) => (
              <motion.circle
                key={i}
                cx={n.x}
                cy={n.y}
                r={i % 2 === 0 ? 4 : 2}
                fill={i % 2 === 0 ? c1 : c2}
                animate={animState(
                  { scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] },
                  { scale: 1, opacity: 1 }
                )}
                transition={{
                  duration: duration / (i % 2 === 0 ? 1 : 1.5),
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </SvgWrapper>
        );
      case 2:
        return (
          <SvgWrapper>
            <motion.polygon
              points={p.poly1}
              fill="none"
              stroke={c1}
              strokeWidth="2"
              strokeLinejoin="round"
              animate={animState({ points: [p.poly1, p.poly2, p.poly1] }, { points: p.poly1 })}
              transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
            />
            <polygon
              points="50,20 80,80 20,80"
              fill="none"
              stroke={c2}
              strokeWidth="1"
              opacity="0.3"
              strokeDasharray="4 4"
            />
          </SvgWrapper>
        );
      case 3:
        return (
          <SvgWrapper>
            <motion.path
              d={`M10 ${p.curveY} Q 30 10, 50 ${p.curveY} T 90 ${p.curveY}`}
              fill="none"
              stroke={c1}
              strokeWidth="3"
              strokeLinecap="round"
              animate={animState(
                {
                  d: [
                    `M10 ${p.curveY} Q 30 10, 50 ${p.curveY} T 90 ${p.curveY}`,
                    `M10 ${p.curveY} Q 30 90, 50 ${p.curveY} T 90 ${p.curveY}`,
                    `M10 ${p.curveY} Q 30 10, 50 ${p.curveY} T 90 ${p.curveY}`,
                  ],
                },
                { d: `M10 ${p.curveY} Q 30 10, 50 ${p.curveY} T 90 ${p.curveY}` }
              )}
              transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
            />
            <path
              d={`M10 ${p.curveY + 15} Q 30 25, 50 ${p.curveY + 15} T 90 ${p.curveY + 15}`}
              fill="none"
              stroke={c2}
              strokeWidth="1"
              opacity="0.5"
            />
          </SvgWrapper>
        );
      case 4:
      default:
        return (
          <SvgWrapper>
            <motion.rect
              x={p.cx - 15}
              y={p.cy - 15}
              width="30"
              height="30"
              fill="none"
              stroke={c1}
              strokeWidth="2"
              animate={animState(
                { rotate: [0, 90, 180], scale: [1, 0.8, 1] },
                { rotate: 0, scale: 1 }
              )}
              transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: `${p.cx}px ${p.cy}px` }}
            />
            <motion.circle
              cx={p.cx}
              cy={p.cy}
              r="25"
              fill="none"
              stroke={c2}
              strokeWidth="1.5"
              strokeDasharray="6 6"
              animate={animState({ rotate: -180 }, { rotate: 0 })}
              transition={{ duration: duration * 2, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: `${p.cx}px ${p.cy}px` }}
            />
          </SvgWrapper>
        );
    }
  };

  return { id: `GEN-${String(index).padStart(4, '0')}`, type, motif, Component };
};
