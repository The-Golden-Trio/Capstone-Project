import { describe, expect, it } from 'vitest';
import {
  TOON_CHARACTERS,
  castCharacters,
  characterArt,
  pickCharacterArt,
} from './toon';

const lead = TOON_CHARACTERS.lead;
const relations = TOON_CHARACTERS.relations;

describe('pickCharacterArt', () => {
  const art = {
    '../assets/toon/char-lead-lo_lang.webp': '/lead-lo-lang.webp',
    '../assets/toon/char-relations-kho_chiu.webp': '/relations-kho-chiu.webp',
  };

  it('uses the variant for that speaker and expression when the file exists', () => {
    expect(pickCharacterArt(art, lead, 'lo_lang')).toBe('/lead-lo-lang.webp');
    expect(pickCharacterArt(art, relations, 'kho_chiu')).toBe(
      '/relations-kho-chiu.webp',
    );
  });

  it('falls back to the base image when the variant is missing', () => {
    expect(pickCharacterArt(art, lead, 'vui')).toBe(lead.src);
    expect(pickCharacterArt(art, relations, 'lo_lang')).toBe(relations.src);
  });

  it('falls back to the base image without an expression', () => {
    expect(pickCharacterArt(art, lead)).toBe(lead.src);
    expect(pickCharacterArt(art, lead, null)).toBe(lead.src);
  });

  it('never throws with an empty art map', () => {
    expect(pickCharacterArt({}, lead, 'lo_lang')).toBe(lead.src);
  });
});

describe('characterArt', () => {
  it('picks up variant files dropped into assets/toon', () => {
    expect(characterArt(lead, 'lo_lang')).toContain('char-lead-lo_lang');
    expect(characterArt(relations, 'kho_chiu')).toContain(
      'char-relations-kho_chiu',
    );
  });

  it('keeps the base image for expressions without a file', () => {
    expect(characterArt(lead, 'buon')).toBe(lead.src);
    expect(characterArt(lead, undefined)).toBe(lead.src);
    expect(characterArt(TOON_CHARACTERS.designer, 'lo_lang')).toBe(
      TOON_CHARACTERS.designer.src,
    );
  });
});

describe('castCharacters', () => {
  it('maps An to the lead art and Linh to the relations art', () => {
    const looks = castCharacters([
      { slot: 'mentor', name: 'Anh An', relation: 'Trưởng nhóm Back-end' },
      { slot: 'support', name: 'Chị Linh', relation: 'Trưởng nhóm CS' },
    ]);
    expect(looks.get('mentor')?.id).toBe('lead');
    expect(looks.get('support')?.id).toBe('relations');
  });
});
