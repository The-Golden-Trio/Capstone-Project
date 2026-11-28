import { useId, useState, type ReactNode } from 'react';
import {
  Activity,
  BookOpen,
  ChevronRight,
  Code2,
  FileSpreadsheet,
  List,
  SquareTerminal,
} from 'lucide-react';
import type { SceneView } from '../../../api/types';
import { CodeEditor } from './CodeEditor';

type Document = SceneView['documents'][number];
type View = NonNullable<Document['view']>;

export function DocumentViewer({ document: doc }: { document: Document }) {
  const view = doc.kind === 'form' && doc.saved ? undefined : doc.view;
  if (view?.type === 'code') return <CodeEditor {...view} />;
  if (view?.type === 'wiki') return <Wiki view={view} />;
  if (view?.type === 'table') return <LogTable view={view} />;
  if (view?.type === 'dashboard') return <Dashboard view={view} />;
  if (view?.type === 'terminal') {
    return (
      <div className="tool-terminal">
        {view.command && (
          <header>
            <SquareTerminal size={16} aria-hidden />
            <code>{view.command}</code>
          </header>
        )}
        <pre tabIndex={0} aria-label="Kết quả lệnh">
          {doc.lines?.map((line, i) => (
            <span key={i} data-warning={line.includes('⚠')}>
              {line}
              {'\n'}
            </span>
          ))}
        </pre>
      </div>
    );
  }
  if (view?.type === 'file') {
    const lines = doc.lines?.map((line) => {
      if (line === view.filename) return '';
      return line.startsWith(`${view.filename} · `)
        ? line.slice(view.filename.length + 3)
        : line;
    });
    return (
      <div className="tool-file">
        <article>
          <div className="file-icon">
            <FileSpreadsheet size={34} aria-hidden />
          </div>
          <div>
            <p className="file-status">Đã xuất file</p>
            <h3>{view.filename}</h3>
            {lines?.filter(Boolean).map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="tool-paper">
      {(doc.body ?? []).map((line, i) => (
        <p key={i}>{line}</p>
      ))}
      {doc.lines && <pre>{doc.lines.join('\n')}</pre>}
      {doc.saved && (
        <>
          <p className="file-status">
            {doc.saved.status === 'draft' ? 'Bản nháp' : 'Đã lưu'}
          </p>
          <SavedForm form={doc.form} saved={doc.saved} />
        </>
      )}
    </div>
  );
}

const choiceLabels: Record<string, string> = {
  loai: 'Loại',
  giu: 'Giữ',
  chua_ro: 'Chưa rõ',
};

function SavedForm({
  form,
  saved,
}: {
  form?: Document['form'];
  saved: NonNullable<Document['saved']>;
}) {
  const choices = new Map<string, string>();
  const ticks: string[] = [];
  for (const tick of saved.ticks) {
    const [id, option] = tick.split('=', 2);
    if (option) choices.set(id, option);
    else ticks.push(tick);
  }
  const fields = Object.entries(saved.fields).filter(([, text]) =>
    Boolean(text),
  );
  const selectionIds = new Set(choices.keys());
  for (const [id] of fields) {
    if (id.endsWith('__why')) selectionIds.add(id.slice(0, -5));
  }

  return (
    <dl className="space-y-3">
      {fields
        .filter(([id]) => !id.endsWith('__why'))
        .map(([id, text]) => {
          const label = form?.fields.find((field) => field.id === id)?.label;
          return (
            <div key={id}>
              <dt className={label ? 'font-semibold' : 'sr-only'}>
                {label ?? id}
              </dt>
              <dd className="whitespace-pre-wrap">{text}</dd>
            </div>
          );
        })}
      {ticks.map((id) => (
        <div key={id}>
          <dt className="sr-only">Đã chọn</dt>
          <dd>✓ {form?.ticks.find((tick) => tick.id === id)?.label ?? id}</dd>
        </div>
      ))}
      {[...selectionIds].map((id) => {
        const select = form?.selects?.find((entry) => entry.id === id);
        const optionId = choices.get(id);
        const label =
          optionId &&
          (select?.options.find((option) => option.id === optionId)?.label ??
            choiceLabels[optionId] ??
            optionId);
        const reason = saved.fields[`${id}__why`];
        return (
          <div key={id}>
            <dt className="font-semibold">{select?.label ?? id}</dt>
            {label && <dd>{label}</dd>}
            {reason && (
              <dd className="whitespace-pre-wrap">Vì sao: {reason}</dd>
            )}
          </div>
        );
      })}
    </dl>
  );
}

function LogTable({ view }: { view: Extract<View, { type: 'table' }> }) {
  const [raw, setRaw] = useState(false);

  return (
    <div className="tool-table">
      <header className="tool-toolbar">
        <span>
          <List size={16} aria-hidden /> {view.rows.length} dòng
        </span>
        {!!view.raw?.length && (
          <button type="button" onClick={() => setRaw((value) => !value)}>
            <Code2 size={16} aria-hidden /> {raw ? 'Xem bảng' : 'Xem dạng gốc'}
          </button>
        )}
      </header>
      {view.caption && <p className="table-caption">{view.caption}</p>}
      {raw ? (
        <pre className="table-raw" tabIndex={0} aria-label="Log dạng gốc">
          {view.raw?.join('\n')}
        </pre>
      ) : (
        <DataTable columns={view.columns} rows={view.rows} />
      )}
    </div>
  );
}

function DataTable({
  columns,
  rows,
  markdown = false,
}: {
  columns: string[];
  rows: string[][];
  markdown?: boolean;
}) {
  const cell = (text: string) =>
    markdown ? <InlineMarkdown text={text} /> : text;
  return (
    <div
      className="tool-table-scroll"
      tabIndex={0}
      role="region"
      aria-label="Bảng dữ liệu"
    >
      <table>
        <thead>
          <tr>
            {columns.map((label, i) => (
              <th key={i} scope="col">
                {cell(label)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((value, j) => (
                <td key={j}>{cell(value)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Dashboard({ view }: { view: Extract<View, { type: 'dashboard' }> }) {
  const tones = { ok: 'Bình thường', warn: 'Cần theo dõi', bad: 'Cảnh báo' };
  return (
    <div className="tool-dashboard">
      {view.caption && (
        <header>
          <Activity size={19} aria-hidden />
          {view.caption}
        </header>
      )}
      <dl>
        {view.metrics.map((metric, i) => (
          <div key={i} className="dashboard-metric" data-tone={metric.tone}>
            <dt>{metric.label}</dt>
            <dd className="metric-value">{metric.value}</dd>
            {metric.tone && (
              <dd className="metric-tone">{tones[metric.tone]}</dd>
            )}
            {metric.note && <dd className="metric-note">{metric.note}</dd>}
          </div>
        ))}
      </dl>
    </div>
  );
}

function Wiki({ view }: { view: Extract<View, { type: 'wiki' }> }) {
  const id = useId();
  const [sectionId, setSectionId] = useState(view.sections[0]?.id);
  const section =
    view.sections.find((item) => item.id === sectionId) ?? view.sections[0];

  return (
    <div className="tool-wiki">
      <header className="wiki-header">
        <BookOpen size={18} aria-hidden />
        {view.space}
      </header>
      <nav aria-label="Mục lục wiki">
        <p>Mục lục</p>
        {view.sections.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-current={item.id === section?.id ? 'page' : undefined}
            aria-controls={id}
            onClick={() => setSectionId(item.id)}
          >
            {item.id.toUpperCase()} · {item.title}
          </button>
        ))}
      </nav>
      <article id={id}>
        {section && (
          <>
            <div className="wiki-breadcrumb">
              {view.space} <ChevronRight size={13} aria-hidden />{' '}
              {section.id.toUpperCase()}
            </div>
            <h3>{section.title}</h3>
            <Markdown key={section.id} lines={section.body} />
          </>
        )}
      </article>
    </div>
  );
}

const BULLET = /^\s*-\s+/;
const ORDERED = /^\s*\d+\.\s+/;
const TABLE = /^\s*\|/;
const DIVIDER = /^:?-{3,}:?$/;

function splitCells(row: string) {
  return row
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((cell) => cell.trim());
}

function Markdown({ lines }: { lines: string[] }) {
  const blocks: ReactNode[] = [];
  for (let i = 0; i < lines.length;) {
    const line = lines[i];
    const start = i++;
    if (!line.trim()) continue;
    if (TABLE.test(line)) {
      const columns = splitCells(line);
      const rows: string[][] = [];
      if (
        lines[i] &&
        TABLE.test(lines[i]) &&
        splitCells(lines[i]).every((cell) => DIVIDER.test(cell))
      )
        i++;
      while (i < lines.length && TABLE.test(lines[i]))
        rows.push(splitCells(lines[i++]));
      blocks.push(
        <DataTable key={start} columns={columns} rows={rows} markdown />,
      );
      continue;
    }
    const marker = BULLET.test(line)
      ? BULLET
      : ORDERED.test(line)
        ? ORDERED
        : null;
    if (marker) {
      const items = [line.replace(marker, '')];
      while (i < lines.length && marker.test(lines[i]))
        items.push(lines[i++].replace(marker, ''));
      const ListTag = marker === BULLET ? 'ul' : 'ol';
      blocks.push(
        <ListTag key={start}>
          {items.map((item, j) => (
            <li key={j}>
              <InlineMarkdown text={item} />
            </li>
          ))}
        </ListTag>,
      );
      continue;
    }
    blocks.push(
      <p key={start}>
        <InlineMarkdown text={line} />
      </p>,
    );
  }
  return blocks;
}

export function InlineMarkdown({ text }: { text: string }) {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/).map((part, i) => {
    if (!(i % 2)) return part;
    if (part.startsWith('`')) return <code key={i}>{part.slice(1, -1)}</code>;
    if (part.startsWith('**'))
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    return <em key={i}>{part.slice(1, -1)}</em>;
  });
}
