import { ChevronDown, FileCode2, Folder, Lock } from 'lucide-react';
import { splitTerms, TermTooltip } from './TermTooltip';

type Language = 'js' | 'ts' | 'sql' | 'text';

const LABELS: Record<Language, string> = {
  js: 'JavaScript',
  ts: 'TypeScript',
  sql: 'SQL',
  text: 'Văn bản',
};
const SQL =
  /\b(?:SELECT|FROM|WHERE|ORDER BY|ASC|DESC|JOIN|LEFT|RIGHT|ON|AND|OR|GROUP BY|LIMIT|OFFSET|IN|AS|UPDATE|SET|INSERT|INTO|DELETE|CREATE|INDEX|VALUES|NULL)\b/gi;
const KEYWORD =
  /^(?:async|await|function|const|let|var|for|of|return|if|else|new|throw|try|catch|import|export|from|true|false|null|undefined|interface|type)$/;

export function CodeEditor({
  path,
  language,
  code,
  hovers = [],
}: {
  path: string;
  language: Language;
  code: string[];
  hovers?: Array<{ token: string; text: string }>;
}) {
  const parts = path.split('/');
  const file = parts[parts.length - 1] ?? path;
  const hoversByToken = new Map(
    hovers.map(({ token, text }) => [token.toLowerCase(), text]),
  );
  const tokens = hovers.map(({ token }) => token);

  return (
    <div className="tool-ide">
      <aside className="ide-sidebar" aria-label="Cây thư mục">
        <span className="ide-sidebar-label">Tệp</span>
        {parts.slice(0, -1).map((part, index) => (
          <div
            key={index}
            className="ide-tree-item"
            style={{ paddingInlineStart: 10 + index * 9 }}
          >
            <ChevronDown size={12} aria-hidden />
            <Folder size={14} aria-hidden /> {part}
          </div>
        ))}
        <div
          className="ide-tree-file"
          style={{ paddingInlineStart: 12 + (parts.length - 1) * 9 }}
        >
          <FileCode2 size={14} aria-hidden /> {file}
        </div>
      </aside>
      <div className="ide-main">
        <div className="ide-tabbar">
          <span>
            <FileCode2 size={15} aria-hidden /> {file}
          </span>
        </div>
        <div className="ide-path">{parts.join('  ›  ')}</div>
        <div
          className="ide-source"
          tabIndex={0}
          aria-label={`Mã nguồn ${file}`}
        >
          {code.map((line, row) => (
            <div className="ide-line" key={row}>
              <span aria-hidden className="ide-line-no">
                {row + 1}
              </span>
              <code>
                {splitTerms(line, tokens).map((part, index) => {
                  const tip =
                    index % 2
                      ? hoversByToken.get(part.toLowerCase())
                      : undefined;
                  return tip ? (
                    <TermTooltip key={index} token={part} text={tip} />
                  ) : (
                    <Syntax key={index} text={part} language={language} />
                  );
                })}
              </code>
            </div>
          ))}
        </div>
      </div>
      <div className="ide-status">
        <span>
          <Lock size={13} aria-hidden /> Chỉ đọc
        </span>
        <span>{code.length} dòng</span>
        <span>UTF-8</span>
        <span>{LABELS[language]}</span>
      </div>
    </div>
  );
}

function Syntax({ text, language }: { text: string; language: Language }) {
  if (language === 'text') return text;
  if (language === 'sql') {
    return text
      .split(
        new RegExp(
          `(${SQL.source}|--.*$|'(?:\\\\.|[^'\\\\])*'|\\b\\d+\\b)`,
          'gi',
        ),
      )
      .map((part, index) =>
        index % 2 ? (
          <span
            key={index}
            className={
              part.startsWith('--')
                ? 'syntax-comment'
                : part.startsWith("'")
                  ? 'syntax-string'
                  : /^\d/.test(part)
                    ? 'syntax-number'
                    : 'syntax-keyword'
            }
          >
            {part}
          </span>
        ) : (
          part
        ),
      );
  }
  const pattern =
    /(\/\/.*$|\/\*.*?\*\/|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][\w$]*\b)/g;
  return text.split(pattern).map((part, index) => {
    if (!(index % 2)) return part;
    if (part.startsWith('//') || part.startsWith('/*'))
      return (
        <span key={index} className="syntax-comment">
          {part}
        </span>
      );
    if (/^['"`]/.test(part)) {
      const sql = /^['"]\s*(?:select|update|insert|delete)\b/i.test(part);
      return (
        <span key={index} className="syntax-string">
          {sql ? (
            <>
              {part[0]}
              <Syntax language="sql" text={part.slice(1, -1)} />
              {part[part.length - 1]}
            </>
          ) : (
            part
          )}
        </span>
      );
    }
    if (KEYWORD.test(part))
      return (
        <span key={index} className="syntax-keyword">
          {part}
        </span>
      );
    if (/^\d/.test(part))
      return (
        <span key={index} className="syntax-number">
          {part}
        </span>
      );
    return part;
  });
}
