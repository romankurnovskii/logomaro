/**
 * @file blobMark.tsx
 * @description Blob creature marks via the blobatar library (MIT).
 * The same seed string always draws the same body; each pose is an expression on that body.
 */
import { blobatar, type Expression } from 'blobatar';
import { happy, smug, surprised, thinking, wink } from 'blobatar/expression';
import type { Logo } from '../../types/logo';
import type { Rng } from './rng';
import { pick } from './rng';
import { buildProceduralId } from './index';

const POSES: Expression[] = [happy, smug, wink, surprised, thinking];

/** Fragments combine into a large name space. Two or three pieces per name. */
const NAME_PARTS = [
  'aer',
  'axo',
  'bal',
  'bri',
  'cael',
  'cor',
  'dax',
  'dra',
  'elm',
  'fen',
  'gal',
  'gry',
  'hel',
  'ira',
  'jor',
  'kai',
  'lex',
  'lum',
  'mir',
  'nox',
  'ora',
  'pel',
  'qua',
  'ryn',
  'sol',
  'tor',
  'uli',
  'vex',
  'wyn',
  'xel',
  'yor',
  'zen',
  'ark',
  'bly',
  'cind',
  'dusk',
  'echo',
  'flint',
  'glow',
  'haze',
  'ion',
  'jade',
  'kel',
  'lark',
  'mist',
  'nyx',
  'onyx',
  'pyre',
  'quill',
  'rift',
  'sage',
  'thorn',
  'umbra',
  'vale',
  'wisp',
  'zeph',
  'bram',
  'cleo',
  'dori',
  'ember',
] as const;

const markupFor = (seed: string, expression: Expression): string =>
  blobatar(seed, { background: false, expression, title: seed });

const titleCase = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1);

/**
 * A random display name. The pool is the cartesian product of the fragments,
 * so repeats inside a session are avoided by `used` (compared case-insensitively).
 */
export const randomBlobName = (rng: Rng, used: Set<string>): string => {
  for (let attempt = 0; attempt < 48; attempt++) {
    const pieces = 2 + Math.floor(rng() * 2);
    let raw = '';
    for (let i = 0; i < pieces; i++) raw += pick(rng, NAME_PARTS);
    const name = titleCase(raw);
    const key = name.toLowerCase();
    if (used.has(key)) continue;
    used.add(key);
    return name;
  }
  const fallback = titleCase(
    `${pick(rng, NAME_PARTS)}${pick(rng, NAME_PARTS)}${Math.floor(rng() * 0xffffff).toString(36)}`
  );
  used.add(fallback.toLowerCase());
  return fallback;
};

export const createBlobLogo = (seed: string, index: number, poseIndex: number): Logo => {
  const expression = POSES[((poseIndex % POSES.length) + POSES.length) % POSES.length];
  const markup = markupFor(seed, expression);

  const Component = ({ isPaused }: { isPaused: boolean }) => (
    <div
      className="h-full w-full [&>svg]:h-full [&>svg]:w-full"
      data-paused={isPaused ? 'true' : 'false'}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );

  return {
    id: buildProceduralId('BLOB', index),
    type: 'blob',
    motif: seed,
    Component,
  };
};

/** Several unrelated creatures, each with its own name. Ids stay unique per index. */
export const createBlobSet = (
  startIndex: number,
  rng: Rng,
  used: Set<string> = new Set(),
  count = 5
): Logo[] =>
  Array.from({ length: count }, (_, i) => {
    const name = randomBlobName(rng, used);
    const poseIndex = Math.floor(rng() * POSES.length);
    return createBlobLogo(name, startIndex + i, poseIndex);
  });

/** One blob in the live procedural pool. */
export const blobMark = (rng: Rng, index: number): Logo => {
  const name = randomBlobName(rng, new Set());
  const poseIndex = Math.floor(rng() * POSES.length);
  return createBlobLogo(name, index, poseIndex);
};
