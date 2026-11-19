import { Fragment, type ReactNode } from 'react';

/**
 * Giữ nguyên các từ có gạch nối trên một dòng ("Back-end", "UI/UX"), tránh
 * tiêu đề bị ngắt thành "Back-" / "end" ở màn hẹp.
 */
export function keepHyphenated(text: string): ReactNode {
  return text.split(/(\S*-\S*)/).map((part, i) =>
    part.includes('-') ? (
      <span key={i} className="whitespace-nowrap">
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}
