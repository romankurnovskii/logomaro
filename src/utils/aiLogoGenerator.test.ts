import { describe, it, expect, vi } from 'vitest';
import {
  buildMessages,
  buildUserMessage,
  callAiLogoModel,
  extractJson,
  geometrySignature,
  validateResponse,
  type AIResponseInput,
} from './aiLogoGenerator';

describe('buildUserMessage / buildMessages', () => {
  it('builds a user message that includes the user word, a seed, and a construction brief', () => {
    const m = buildUserMessage('Etemaro', 0, 42);
    expect(m).toContain('"Etemaro"');
    expect(m).toMatch(/concentric circles/i);
    expect(m).toContain('Variation: 1 of 5');
    expect(m).toContain('Random seed');
    expect(m).toContain('42');
  });

  it('produces different messages when the seed differs', () => {
    const a = buildUserMessage('x', 0, 1);
    const b = buildUserMessage('x', 0, 999);
    expect(a).not.toBe(b);
  });

  it('cycles the 5 construction briefs by index', () => {
    const a = buildUserMessage('x', 0, 1);
    const b = buildUserMessage('x', 1, 1);
    const c = buildUserMessage('x', 2, 1);
    const d = buildUserMessage('x', 3, 1);
    const e = buildUserMessage('x', 4, 1);
    const set = new Set([a, b, c, d, e]);
    expect(set.size).toBe(5);
  });

  it('wraps in [system, user] messages', () => {
    const msgs = buildMessages('hello', 0, 1);
    expect(msgs).toHaveLength(2);
    expect(msgs[0].role).toBe('system');
    expect(msgs[1].role).toBe('user');
    expect(msgs[0].content).toMatch(/strict JSON-only/);
    expect(msgs[0].content).toMatch(/Curated palette/);
    expect(msgs[1].content).toContain('"hello"');
  });
});

describe('extractJson', () => {
  it('parses a bare JSON object', () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
  });

  it('parses JSON wrapped in markdown fences', () => {
    expect(extractJson('```json\n{"a":2}\n```')).toEqual({ a: 2 });
  });

  it('parses JSON with surrounding prose', () => {
    expect(extractJson('Here you go:\n{"a":3}\nDone!')).toEqual({ a: 3 });
  });

  it('throws when no JSON is present', () => {
    expect(() => extractJson('no braces here')).toThrow();
  });
});

describe('validateResponse', () => {
  const good: AIResponseInput = {
    motifName: 'Concentric',
    primaryColor: '#d4af37',
    secondaryColor: '#8c7a70',
    elements: [
      { shape: 'circle', cx: 50, cy: 50, r: 20, strokeType: 'primary', isAnimated: false },
    ],
  };

  it('accepts a well-formed response', () => {
    const v = validateResponse(good);
    expect(v.motifName).toBe('Concentric');
    expect(v.elements).toHaveLength(1);
  });

  it('rejects when motifName is empty', () => {
    expect(() => validateResponse({ ...good, motifName: '   ' })).toThrow(/motifName/);
  });

  it('rejects when primaryColor is not a hex', () => {
    expect(() => validateResponse({ ...good, primaryColor: 'blue' })).toThrow(/primaryColor/);
  });

  it('rejects when primaryColor and secondaryColor match', () => {
    expect(() =>
      validateResponse({ ...good, primaryColor: '#fff', secondaryColor: '#fff' })
    ).not.toThrow();
  });

  it('rejects more than MAX_ELEMENTS elements', () => {
    const elements = Array.from({ length: 5 }, (_, i) => ({
      shape: 'circle',
      cx: 50,
      cy: 50,
      r: 10 + i,
      strokeType: 'primary' as const,
      isAnimated: false,
    }));
    expect(() => validateResponse({ ...good, elements })).toThrow(/too many elements/);
  });

  it('rejects elements entirely off-canvas', () => {
    const off: AIResponseInput = {
      ...good,
      elements: [
        {
          shape: 'circle',
          cx: -500,
          cy: -500,
          r: 5,
          strokeType: 'primary',
          isAnimated: false,
        },
        {
          shape: 'circle',
          cx: -510,
          cy: -500,
          r: 5,
          strokeType: 'primary',
          isAnimated: false,
        },
      ],
    };
    expect(() => validateResponse(off)).toThrow(/off-canvas/);
  });

  it('rejects a circle with invalid radius', () => {
    const bad: AIResponseInput = {
      ...good,
      elements: [
        { shape: 'circle', cx: 50, cy: 50, r: 0, strokeType: 'primary', isAnimated: false },
      ],
    };
    expect(() => validateResponse(bad)).toThrow(/circle/);
  });

  it('coerces numeric strings for circle fields', () => {
    const mixed: AIResponseInput = {
      ...good,
      elements: [
        {
          shape: 'circle',
          cx: '50',
          cy: '50',
          r: '15',
          strokeType: 'primary',
          isAnimated: false,
        },
      ],
    };
    const v = validateResponse(mixed);
    expect(v.elements[0].cx).toBe(50);
  });

  it('defaults strokeType to primary when missing', () => {
    const no: AIResponseInput = {
      ...good,
      elements: [
        { shape: 'circle', cx: 50, cy: 50, r: 5, isAnimated: false } as AIElementLike,
      ],
    };
    const v = validateResponse(no as unknown as AIResponseInput);
    expect(v.elements[0].strokeType).toBe('primary');
  });

  it('rejects an unknown shape', () => {
    const bad: AIResponseInput = {
      ...good,
      elements: [
        { shape: 'triangle', cx: 0, cy: 0, strokeType: 'primary', isAnimated: false },
      ],
    };
    expect(() => validateResponse(bad)).toThrow(/unknown shape/);
  });

  it('rejects when elements is missing or empty', () => {
    expect(() => validateResponse({ ...good, elements: [] })).toThrow(/empty/);
  });
});

describe('geometrySignature', () => {
  it('returns identical signatures for identical geometry', () => {
    const a = validateResponse({
      motifName: 'A',
      primaryColor: '#000000',
      secondaryColor: '#ffffff',
      elements: [
        { shape: 'circle', cx: 50, cy: 50, r: 10, strokeType: 'primary', isAnimated: false },
      ],
    });
    const b = validateResponse({
      motifName: 'B',
      primaryColor: '#111111',
      secondaryColor: '#eeeeee',
      elements: [
        { shape: 'circle', cx: 50, cy: 50, r: 10, strokeType: 'secondary', isAnimated: true },
      ],
    });
    expect(geometrySignature(a)).toBe(geometrySignature(b));
  });

  it('differs for different geometry', () => {
    const a = validateResponse({
      motifName: 'A',
      primaryColor: '#000000',
      secondaryColor: '#ffffff',
      elements: [
        { shape: 'circle', cx: 50, cy: 50, r: 10, strokeType: 'primary', isAnimated: false },
      ],
    });
    const b = validateResponse({
      motifName: 'A',
      primaryColor: '#000000',
      secondaryColor: '#ffffff',
      elements: [
        { shape: 'circle', cx: 50, cy: 50, r: 20, strokeType: 'primary', isAnimated: false },
      ],
    });
    expect(geometrySignature(a)).not.toBe(geometrySignature(b));
  });
});

describe('callAiLogoModel', () => {
  it('passes messages + options to the chat function and returns a validated logo', async () => {
    const chat = vi.fn().mockResolvedValue({
      message: {
        content: JSON.stringify({
          motifName: 'Concentric',
          primaryColor: '#d4af37',
          secondaryColor: '#8c7a70',
          elements: [
            {
              shape: 'circle',
              cx: 50,
              cy: 50,
              r: 20,
              strokeType: 'primary',
              isAnimated: false,
            },
          ],
        }),
      },
    });
    const v = await callAiLogoModel('hello', 0, chat);
    expect(chat).toHaveBeenCalledTimes(1);
    const [msgs, opts] = chat.mock.calls[0];
    expect(msgs).toHaveLength(2);
    expect(msgs[0].role).toBe('system');
    expect(msgs[1].role).toBe('user');
    expect(opts).toMatchObject({ temperature: 0.7, max_tokens: 600 });
    expect(opts?.model).toBeTruthy();
    expect(typeof opts?.seed).toBe('number');
    expect(v.motifName).toBe('Concentric');
  });

  it('uses a caller-provided seed when supplied', async () => {
    const chat = vi.fn().mockResolvedValue({
      message: {
        content: JSON.stringify({
          motifName: 'Concentric',
          primaryColor: '#d4af37',
          secondaryColor: '#8c7a70',
          elements: [
            {
              shape: 'circle',
              cx: 50,
              cy: 50,
              r: 20,
              strokeType: 'primary',
              isAnimated: false,
            },
          ],
        }),
      },
    });
    await callAiLogoModel('hello', 0, chat, 12345);
    const [, opts] = chat.mock.calls[0];
    expect(opts?.seed).toBe(12345);
  });

  it('throws when the model returns invalid JSON', async () => {
    const chat = vi.fn().mockResolvedValue({ message: { content: 'no json here' } });
    await expect(callAiLogoModel('x', 0, chat)).rejects.toThrow();
  });

  it('throws when the model returns invalid geometry', async () => {
    const chat = vi.fn().mockResolvedValue({
      message: {
        content: JSON.stringify({
          motifName: 'Bad',
          primaryColor: '#000000',
          secondaryColor: '#ffffff',
          elements: [
            {
              shape: 'circle',
              cx: 'NaN',
              cy: 50,
              r: 10,
              strokeType: 'primary',
              isAnimated: false,
            },
          ],
        }),
      },
    });
    await expect(callAiLogoModel('x', 0, chat)).rejects.toThrow();
  });

  it('handles Anthropic-style array content blocks', async () => {
    const chat = vi.fn().mockResolvedValue({
      message: {
        content: [
          {
            type: 'text',
            text: '{"motifName":"Concentric","primaryColor":"#d4af37","secondaryColor":"#8c7a70","elements":[{"shape":"circle","cx":50,"cy":50,"r":20,"strokeType":"primary","isAnimated":false}]}',
          },
        ],
      },
    });
    const v = await callAiLogoModel('hello', 0, chat);
    expect(v.motifName).toBe('Concentric');
  });

  it('throws cleanly when message.content is an array of non-text blocks', async () => {
    const chat = vi.fn().mockResolvedValue({
      message: { content: [{ type: 'tool_use', id: 'x' }] },
    });
    await expect(callAiLogoModel('x', 0, chat)).rejects.toThrow(/Empty model response/);
  });
});

type AIElementLike = { shape: string; strokeType?: string; isAnimated?: boolean };
