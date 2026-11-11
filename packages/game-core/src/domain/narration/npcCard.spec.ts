/**
 * Thẻ nhân vật phải đúng từng chữ với engine mẫu (`qa_v05/engine.py`, v1.0)
 * cho cả 22 lá: tài liệu Hồ sơ NPC lấy chữ engine đó dựng làm chuẩn (mục 9.12).
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { npcCast } from '../../testing/fixture.js';
import {
  PERSON_PART_MAX_WORDS,
  workAddress,
  workCard,
  type PlayerAddress,
  type SlotRelation,
  type WorkSlot,
} from './npcCard.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const goldens = JSON.parse(
  readFileSync(
    join(HERE, '..', '..', '..', 'fixtures', 'npc-card-goldens.v1.0.json'),
    'utf-8',
  ),
) as {
  slots: Record<'min' | 'full', Omit<WorkSlot, 'relation'>>;
  cases: Array<{
    card: string;
    relation: SlotRelation;
    choice: PlayerAddress;
    slot: 'min' | 'full';
    sha256: string;
    personWords: number;
  }>;
  samples: Array<{
    card: string;
    relation: SlotRelation;
    choice: PlayerAddress;
    text: string;
  }>;
};
const cast = npcCast();
const sha = (text: string) => createHash('sha256').update(text).digest('hex');

describe('đúng từng chữ với engine mẫu', () => {
  it('bản đầy đủ chữ của vài thẻ (để thấy chỗ lệch khi hỏng)', () => {
    for (const sample of goldens.samples) {
      const slot = { ...goldens.slots.full, relation: sample.relation };
      expect(workCard(cast[sample.card], slot, sample.choice).text).toBe(
        sample.text,
      );
    }
  });

  it(`cả ${goldens.cases.length} tổ hợp lá × vai × anh/chị × slot`, () => {
    const wrong = goldens.cases.filter((c) => {
      const card = workCard(
        cast[c.card],
        { ...goldens.slots[c.slot], relation: c.relation },
        c.choice,
      );
      return sha(card.text) !== c.sha256 || card.personWords !== c.personWords;
    });
    expect(
      wrong.map((c) => `${c.card}/${c.relation}/${c.choice}/${c.slot}`),
    ).toEqual([]);
  });
});

describe('luật của thẻ', () => {
  const slot = (relation: SlotRelation): WorkSlot => ({
    id: 's',
    relation,
    vai: 'vai',
  });

  it('phần người không quá trần, kể cả với dòng vai dài', () => {
    for (const c of goldens.cases)
      expect(c.personWords).toBeLessThanOrEqual(PERSON_PART_MAX_WORDS);
  });

  it('cấp trên luôn gọi người chơi "em", dù người chơi chọn gì', () => {
    expect(workAddress(cast['XVIII_mat_trang'], 'cap_tren', 'anh')).toEqual({
      self: 'anh',
      player: 'em',
    });
    expect(workAddress(cast['XVIII_mat_trang'], 'cap_tren', 'chi')).toEqual({
      self: 'anh',
      player: 'em',
    });
  });

  it('cấp dưới xưng em, gọi theo lựa chọn của người chơi', () => {
    expect(workAddress(cast['XVI_toa_thap'], 'cap_duoi', 'chi')).toEqual({
      self: 'em',
      player: 'chị',
    });
  });

  it('chọn anh hay chị chỉ đổi chữ xưng hô, không đổi gì khác (mục 9.7)', () => {
    for (const [id, profile] of Object.entries(cast))
      for (const relation of profile.nguoi.vao_vai.vai_hop_le) {
        const a = workCard(profile, slot(relation), 'anh').text.split('\n');
        const c = workCard(profile, slot(relation), 'chi').text.split('\n');
        const differ = a.filter((line, i) => line !== c[i]);
        for (const line of differ)
          expect([id, line]).toEqual([
            id,
            expect.stringMatching(/^(Xưng|Câu mẫu)/),
          ]);
      }
  });

  it('không điền lá vào vai lá đó không đóng được', () => {
    expect(() =>
      workCard(cast['XIX_mat_troi'], slot('cap_tren'), 'anh'),
    ).toThrow(/vai_hop_le/);
  });

  it('thẻ màn làm việc không chứa chữ nào của đời tư (mục 1)', () => {
    for (const profile of Object.values(cast))
      expect(profile).not.toHaveProperty('doi_tu');
  });
});
