/**
 * @file aiLogoGenerator.ts
 * @description Pure logic for the AI logo flow:
 * - builds the system + user messages
 * - validates the parsed JSON response
 * - runs the model call (delegated, so unit tests can mock)
 *
 * Splitting this from the React container keeps it testable.
 */

import {
  DEFI_PALETTE,
  type AIElementInput,
  type AIResponseInput,
  type ValidatedElement,
  type ValidatedLogo,
} from './logoGenerators';

export type { AIElementInput, AIResponseInput, ValidatedElement, ValidatedLogo };

export const MAX_ELEMENTS = 3;
export const CANVAS_MIN = -50;
export const CANVAS_MAX = 150;

const HEX_COLOR = /^#([0-9a-f]{6}|[0-9a-f]{3})$/i;

const asFiniteNumber = (v: unknown): number | null => {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return null;
};

const bboxOfD = (d: string): [number, number, number, number] | null => {
  const nums = d.match(/-?\d+(?:\.\d+)?/g);
  if (!nums) return null;
  const arr = nums.map(Number);
  if (arr.length < 2) return null;
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (let i = 0; i + 1 < arr.length; i += 2) {
    const x = arr[i];
    const y = arr[i + 1];
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  if (!isFinite(minX)) return null;
  return [minX, minY, maxX, maxY];
};

const bboxOfPoints = (points: string): [number, number, number, number] | null => {
  const arr = points
    .split(/[\s,]+/)
    .filter(Boolean)
    .map(Number);
  if (arr.length < 4 || arr.some(isNaN)) return null;
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (let i = 0; i + 1 < arr.length; i += 2) {
    const x = arr[i];
    const y = arr[i + 1];
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return [minX, minY, maxX, maxY];
};

const elementBbox = (e: ValidatedElement): [number, number, number, number] | null => {
  if (e.shape === 'circle' && e.cx != null && e.cy != null && e.r != null) {
    return [e.cx - e.r, e.cy - e.r, e.cx + e.r, e.cy + e.r];
  }
  if (
    e.shape === 'rect' &&
    e.x != null &&
    e.y != null &&
    e.width != null &&
    e.height != null
  ) {
    return [e.x, e.y, e.x + e.width, e.y + e.height];
  }
  if (e.shape === 'polygon' && e.points) return bboxOfPoints(e.points);
  if (e.shape === 'path' && e.d) return bboxOfD(e.d);
  return null;
};

export const validateResponse = (raw: AIResponseInput): ValidatedLogo => {
  const errors: string[] = [];

  if (!raw || typeof raw !== 'object') {
    throw new Error('Response is not an object.');
  }

  const motifName = String(raw.motifName ?? '').trim();
  if (!motifName) errors.push('motifName is empty.');

  const primaryColor =
    typeof raw.primaryColor === 'string' && HEX_COLOR.test(raw.primaryColor)
      ? raw.primaryColor
      : null;
  if (!primaryColor) errors.push('primaryColor is missing or not a hex color.');

  const secondaryColor =
    typeof raw.secondaryColor === 'string' && HEX_COLOR.test(raw.secondaryColor)
      ? raw.secondaryColor
      : null;
  if (!secondaryColor) errors.push('secondaryColor is missing or not a hex color.');

  const rawElements = Array.isArray(raw.elements) ? raw.elements : [];
  if (rawElements.length === 0) errors.push('elements array is empty.');

  const validated: ValidatedElement[] = [];
  for (const el of rawElements) {
    const shape = String(el.shape ?? '').toLowerCase();
    const strokeType: 'primary' | 'secondary' =
      el.strokeType === 'secondary' ? 'secondary' : 'primary';
    const isAnimated = Boolean(el.isAnimated);

    if (shape === 'path') {
      if (typeof el.d !== 'string' || el.d.trim().length < 4) {
        errors.push('path element missing valid d.');
        continue;
      }
      validated.push({ shape: 'path', d: el.d, strokeType, isAnimated });
      continue;
    }
    if (shape === 'circle') {
      const cx = asFiniteNumber(el.cx);
      const cy = asFiniteNumber(el.cy);
      const r = asFiniteNumber(el.r);
      if (cx == null || cy == null || r == null || r <= 0) {
        errors.push('circle element missing valid cx/cy/r.');
        continue;
      }
      validated.push({ shape: 'circle', cx, cy, r, strokeType, isAnimated });
      continue;
    }
    if (shape === 'polygon') {
      if (typeof el.points !== 'string' || el.points.trim().length < 4) {
        errors.push('polygon element missing valid points.');
        continue;
      }
      validated.push({ shape: 'polygon', points: el.points, strokeType, isAnimated });
      continue;
    }
    if (shape === 'rect') {
      const x = asFiniteNumber(el.x);
      const y = asFiniteNumber(el.y);
      const w = asFiniteNumber(el.width);
      const h = asFiniteNumber(el.height);
      if (x == null || y == null || w == null || h == null || w <= 0 || h <= 0) {
        errors.push('rect element missing valid x/y/width/height.');
        continue;
      }
      validated.push({ shape: 'rect', x, y, width: w, height: h, strokeType, isAnimated });
      continue;
    }
    errors.push(`unknown shape "${el.shape}".`);
  }

  if (validated.length > MAX_ELEMENTS) {
    errors.push(`too many elements (${validated.length} > ${MAX_ELEMENTS}).`);
  }

  if (validated.length === 0) {
    errors.push('no valid elements after normalization.');
  } else {
    for (const el of validated) {
      const b = elementBbox(el);
      if (!b) {
        errors.push('element bbox could not be computed.');
        continue;
      }
      const [, , maxX, maxY] = b;
      if (maxX < CANVAS_MIN || maxY < CANVAS_MIN) {
        errors.push('element entirely off-canvas.');
      }
    }
  }

  if (errors.length) {
    throw new Error(`Invalid AI response: ${errors.join(' ')}`);
  }

  return {
    motifName,
    primaryColor: primaryColor!,
    secondaryColor: secondaryColor!,
    elements: validated,
  };
};

const SYSTEM_PROMPT = `You are a strict JSON-only logo generator.
You ALWAYS return exactly one valid JSON object and nothing else — no prose, no markdown, no code fences.
You design minimalist, institutional-grade DeFi brand marks. Composition is geometry-first; user text influences theme/feeling but NEVER overrides the geometric plan.
Hard rules:
- The composition MUST follow the SINGLE construction the user describes (concentric circles, inscribed triangle, hexagon + diagonal, wave + bar, star, etc.). Do not invent extra elements.
- Maximum 3 elements. Fewer is better.
- Use ONLY coordinates in [0, 100]. Whole integers preferred; decimals allowed to one place.
- Every element MUST contribute visually. No floating bars, no near-duplicate paths.
- motifName is 1–2 words that describe the construction (e.g. "Concentric", "Inscribed Shield"), not the user word.
- Colors: pick primaryColor and secondaryColor from the curated palette below. Each call MUST use a DIFFERENT pair than the same user might have seen before — do NOT default to gold + neon or blue + navy. They must differ.
- Output ONLY the JSON object.

Curated palette (pick any two distinct):
${DEFI_PALETTE.join(', ')}`;

const VARIATION_BRIEFS: readonly string[] = [
  'Construction: three concentric circles centered at (50,50) with radii 22, 34, 46. Optional one short chord across the outer ring.',
  'Construction: one equilateral triangle inscribed in a circle of radius 40 centered at (50,50), plus one horizontal stroke bisecting the triangle at y=50 from x=22 to x=78.',
  'Construction: a regular hexagon centered at (50,50) with circumradius 40, plus one diagonal stroke from the top vertex (~50,10) to the bottom-right vertex (~84.6, 70).',
  'Construction: one closed quadratic Bezier forming a smooth wave from (10,55) through (50,30) to (90,55), plus one perpendicular straight bar at the wave crest from (45,30) to (55,30).',
  'Construction: a 5-pointed star inscribed in a circle of radius 42 centered at (50,50), plus one dot of radius 4 at the center.',
];

export const buildUserMessage = (userPrompt: string, index: number, seed: number): string => {
  const brief = VARIATION_BRIEFS[index % VARIATION_BRIEFS.length];
  return `Random seed (use it to vary colors and micro-geometry; do NOT echo it back): ${seed}.
User word (theme only, do NOT render the letters verbatim): "${userPrompt}".
Variation: ${index + 1} of ${VARIATION_BRIEFS.length}. ${brief}

Return a JSON object with this exact schema:
{
  "motifName": "string",
  "primaryColor": "#RRGGBB",
  "secondaryColor": "#RRGGBB",
  "elements": [
    { "shape": "path|circle|polygon|rect", "...shape-specific fields...": "value", "strokeType": "primary|secondary", "isAnimated": false }
  ]
}`;
};

export const buildMessages = (userPrompt: string, index: number, seed: number) => [
  { role: 'system' as const, content: SYSTEM_PROMPT },
  { role: 'user' as const, content: buildUserMessage(userPrompt, index, seed) },
];

export const extractJson = (text: string): unknown => {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const first = candidate.indexOf('{');
  const last = candidate.lastIndexOf('}');
  if (first === -1 || last === -1 || last <= first) {
    throw new Error('No JSON object found in response.');
  }
  return JSON.parse(candidate.slice(first, last + 1));
};

export const geometrySignature = (logo: ValidatedLogo): string =>
  JSON.stringify(
    logo.elements.map((e) => {
      if (e.shape === 'path') return { shape: 'path', d: e.d };
      if (e.shape === 'circle') return { shape: 'circle', cx: e.cx, cy: e.cy, r: e.r };
      if (e.shape === 'polygon') return { shape: 'polygon', points: e.points };
      return { shape: 'rect', x: e.x, y: e.y, w: e.width, h: e.height };
    })
  );

export const callAiLogoModel = async (
  userPrompt: string,
  index: number,
  chat: (
    messages: Array<{ role: string; content: string }>,
    options?: { model?: string; temperature?: number; max_tokens?: number; seed?: number }
  ) => Promise<{ message?: { content: string } } | string>,
  seed: number = Math.floor(Math.random() * 0xffffffff)
): Promise<ValidatedLogo> => {
  const messages = buildMessages(userPrompt, index, seed);
  const response = await chat(messages, {
    model: 'claude-sonnet-4-5',
    temperature: 0.7,
    max_tokens: 600,
    seed,
  });
  const text = extractResponseText(response);
  if (!text) throw new Error('Empty model response.');
  const parsed = extractJson(text) as AIResponseInput;
  return validateResponse(parsed);
};

const extractResponseText = (response: unknown): string => {
  if (typeof response === 'string') return response;
  if (!response || typeof response !== 'object') return '';

  const obj = response as { message?: { content?: unknown }; content?: unknown };

  if (typeof obj.message?.content === 'string') return obj.message.content;
  if (Array.isArray(obj.message?.content)) {
    return obj
      .message!.content!.map((block) => {
        if (!block || typeof block !== 'object') return '';
        const b = block as { type?: string; text?: unknown };
        if (b.type === 'text' && typeof b.text === 'string') return b.text;
        if (typeof b.text === 'string') return b.text;
        return '';
      })
      .filter(Boolean)
      .join('\n');
  }

  if (typeof obj.content === 'string') return obj.content;
  if (Array.isArray(obj.content)) {
    return (obj.content as Array<{ type?: string; text?: unknown }>)
      .map((b) => (typeof b?.text === 'string' ? b.text : ''))
      .filter(Boolean)
      .join('\n');
  }

  return '';
};
