import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { initialState, step } from './engine.js';
import { fold } from './fold.js';
import { LevelPackSchema, ShiftSeedSchema } from './schema.js';
import type { ShiftInput } from './state.js';

function fixture(name: string): unknown {
  const url = new URL(`../../fixtures/shift-v4/${name}.json`, import.meta.url);
  return JSON.parse(readFileSync(url, 'utf8'));
}

function digest(value: unknown): string {
  const json = JSON.stringify(value, (_, item) =>
    item && typeof item === 'object' && !Array.isArray(item)
      ? Object.fromEntries(
          Object.keys(item)
            .sort()
            .map((key) => [key, item[key]]),
        )
      : item,
  );
  return createHash('sha256').update(json).digest('hex');
}

it('replays every turn of a published v4 shift as main did', () => {
  const ctx = {
    seed: ShiftSeedSchema.parse(fixture('L3.m2')),
    pack: LevelPackSchema.parse(fixture('L3.pack')),
  };
  // Inputs (including AI outputs) and digests of each step were captured from main.
  const { inputs, traceDigests } = fixture('run') as {
    inputs: ShiftInput[];
    traceDigests: string[];
  };
  expect(ctx.seed.version).toBe(4);
  expect(ctx.seed.player_first_at_fallback).toBe(false);
  expect(traceDigests).toHaveLength(inputs.length);

  let state = initialState(ctx);
  for (const [index, input] of inputs.entries()) {
    if (input.type === 'SAVE_ARTEFACT' && input.artefact === 'ghi_chu_su_co') {
      expect(state.nodes.n2).toMatchObject({ via: 'fallback', openedAt: 20 });
      expect(state.await).toEqual({
        kind: 'node_artefact',
        node: 'n2',
        artefact: 'ghi_chu_su_co',
      });
    }
    const result = step(state, input, ctx);
    expect(digest(result), `input ${index + 1}: ${input.type}`).toBe(
      traceDigests[index],
    );
    state = result.state;
  }
  expect(state.ended).toBe(true);
  expect(fold(ctx, inputs)).toEqual(state);
});
