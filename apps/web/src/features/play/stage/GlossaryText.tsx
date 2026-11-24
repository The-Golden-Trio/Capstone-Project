import type { SceneView } from '../../../api/types';
import { splitTerms, TermTooltip } from '../desktop/TermTooltip';

export function GlossaryText({
  text,
  glossary,
  visible = text.length,
}: {
  text: string;
  glossary: SceneView['glossary'];
  visible?: number;
}) {
  const meanings = new Map(
    glossary.map(({ term, plain }) => [term.toLowerCase(), plain]),
  );
  let offset = 0;
  return splitTerms(
    text,
    glossary.map(({ term }) => term),
  ).map((part, i) => {
    const rendered = part.slice(0, Math.max(0, visible - offset));
    offset += part.length;
    if (!rendered) return null;
    const meaning =
      i % 2 && rendered === part ? meanings.get(part.toLowerCase()) : undefined;
    return meaning ? (
      <TermTooltip key={i} token={part} text={meaning} />
    ) : (
      rendered
    );
  });
}
