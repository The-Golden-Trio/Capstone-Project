#!/usr/bin/env python3
"""Flatten a LaTeX report and extract what capstone-sync-report needs.

Usage:
  python3 extract_tex.py <main.tex | report-folder> [--out DIR]
                         [--hub docs/project-hub] [--prev <older main.tex>]

Writes to --out (default /tmp/capstone-sync-report/<folder-name>):
  flat.tex    whole report in one file, comments stripped, each heading
              preceded by a marker line  [[§4.1.3 Business rules]]
  outline.md  numbered heading tree with word counts
  ids.md      every requirement-style ID (BR-01, FR-10, UC-08, RP-1 ...),
              where it appears and the line it appears on; priority
              (Must/Should/Could/Won't) when the same line has one
  diff.md     (with --prev) sections added / removed / changed since the
              previous report
Prints a short summary to stdout, including the ID comparison with the hub
when --hub is given. Standard library only.
"""
import argparse
import difflib
import re
import sys
from collections import OrderedDict, defaultdict
from pathlib import Path

ID_PREFIXES = ["BR", "FR", "NFR", "DR", "UC", "RP", "OBJ"]
VERBATIM_ENVS = ("verbatim", "minted", "lstlisting", "alltt", "Verbatim")
HEADING_RE = re.compile(
    r"\\(part|chapter|section|subsection|subsubsection|paragraph)(\*?)\s*(\[[^\]]*\])?\s*\{"
)
TWO_ARG_INC = re.compile(r"\\(import|subimport|inputfrom|subinputfrom)\*?\s*\{([^}]*)\}\s*\{([^}]*)\}")
ONE_ARG_INC = re.compile(r"\\(input|include|subfile)\b\s*\{([^}]*)\}")
PRIORITY_RE = re.compile(r"\b(Must|Should|Could|Won'?t)\b")


# ---------------------------------------------------------------- helpers
def strip_comment(line):
    out = []
    i = 0
    while i < len(line):
        c = line[i]
        if c == "\\" and i + 1 < len(line):
            out.append(line[i:i + 2])
            i += 2
            continue
        if c == "%":
            break
        out.append(c)
        i += 1
    return "".join(out)


def match_brace(text, open_idx):
    """text[open_idx] == '{'; return index of the matching '}' (or -1)."""
    depth = 0
    i = open_idx
    while i < len(text):
        c = text[i]
        if c == "\\":
            i += 2
            continue
        if c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                return i
        i += 1
    return -1


def braced_arg(text, cmd):
    m = re.search(r"\\" + cmd + r"\s*(\[[^\]]*\])?\s*\{", text)
    if not m:
        return None
    end = match_brace(text, m.end() - 1)
    return text[m.end():end] if end != -1 else None


def detex(s):
    s = s.replace("\\\\", " ").replace("~", " ").replace("``", "“").replace("''", "”")
    s = s.replace("&", "\x00").replace("\\\x00", "&")
    s = re.sub(r"\\(?:%|_|#|\$)", lambda m: m.group(0)[1], s)
    for _ in range(4):
        s = re.sub(r"\\[a-zA-Z]+\*?\s*(?:\[[^\]]*\])?\{([^{}]*)\}", r"\1", s)
    s = re.sub(r"\\(label|cite|ref|autoref|cref)\{[^}]*\}", "", s)
    s = re.sub(r"\\[a-zA-Z]+\*?", "", s)
    s = s.replace("{", "").replace("}", "").replace("\x00", "|")
    s = s.replace("---", "—").replace("--", "–")
    return re.sub(r"\s+", " ", s).strip()


def slug_title(t):
    return re.sub(r"[^a-z0-9à-ỹ]+", " ", t.lower()).strip()


# ---------------------------------------------------------------- flatten
class Flattener:
    def __init__(self, root_file):
        self.root_file = root_file.resolve()
        self.root_dir = self.root_file.parent
        self.files = []
        self.missing = []

    def resolve(self, name, cur_dir, extra_dir=None):
        name = name.strip()
        bases = []
        if extra_dir is not None:
            bases += [cur_dir / extra_dir, self.root_dir / extra_dir]
        bases += [cur_dir, self.root_dir]
        for b in bases:
            for cand in (b / name, b / (name + ".tex")):
                if cand.is_file():
                    return cand.resolve()
        return None

    def read(self, path, stack=()):
        if path in stack or len(stack) > 20:
            return f"\n%% [CYCLE: {path.name}]\n"
        self.files.append(path)
        raw = path.read_text(encoding="utf-8", errors="replace")
        # a subfile / standalone child: keep only its document body
        if path != self.root_file and "\\begin{document}" in raw:
            raw = raw.split("\\begin{document}", 1)[1].split("\\end{document}", 1)[0]
        lines_out = []
        in_verb = None
        in_comment_env = False
        for line in raw.splitlines():
            if in_comment_env:
                if "\\end{comment}" in line:
                    in_comment_env = False
                continue
            if "\\begin{comment}" in line:
                in_comment_env = True
                continue
            if in_verb:
                lines_out.append(line)
                if "\\end{" + in_verb in line:
                    in_verb = None
                continue
            vb = re.search(r"\\begin\{(" + "|".join(VERBATIM_ENVS) + r")\}", line)
            if vb:
                in_verb = vb.group(1)
                lines_out.append(line)
                continue
            line = strip_comment(line)
            if line.strip() == "" and line != "":
                line = ""
            lines_out.append(self.expand(line, path, stack + (path,)))
        return "\n".join(lines_out)

    def expand(self, line, path, stack):
        cur_dir = path.parent

        def two(m):
            target = self.resolve(m.group(3), cur_dir, m.group(2))
            return self.inc(target, m.group(2) + m.group(3), stack)

        def one(m):
            target = self.resolve(m.group(2), cur_dir)
            return self.inc(target, m.group(2), stack)

        line = TWO_ARG_INC.sub(two, line)
        return ONE_ARG_INC.sub(one, line)

    def inc(self, target, name, stack):
        if target is None:
            if not name.endswith((".bbl", ".sty", ".cls")):
                self.missing.append(name)
            return f"\n%% [MISSING INCLUDE: {name}]\n"
        rel = target.relative_to(self.root_dir) if str(target).startswith(str(self.root_dir)) else target
        return f"\n%% ---- begin file: {rel} ----\n" + self.read(target, stack) + f"\n%% ---- end file: {rel} ----\n"


# ---------------------------------------------------------------- headings
def number_headings(body):
    uses_chapter = re.search(r"\\chapter\*?\s*[\[{]", body) is not None
    levels = (["chapter", "section", "subsection", "subsubsection"] if uses_chapter
              else ["section", "subsection", "subsubsection"])
    counters = [0] * len(levels)
    appendix = False
    heads = []
    for m in HEADING_RE.finditer(body):
        kind, star = m.group(1), m.group(2)
        end = match_brace(body, m.end() - 1)
        title = detex(body[m.end():end]) if end != -1 else "?"
        pos = m.start()
        app = body.rfind("\\appendix", 0, pos)
        if app != -1 and not appendix:
            appendix = True
            counters = [0] * len(levels)
        if kind not in levels or star:
            num = ""
        else:
            lvl = levels.index(kind)
            counters[lvl] += 1
            for j in range(lvl + 1, len(levels)):
                counters[j] = 0
            parts = counters[:lvl + 1]
            first = chr(ord("A") + parts[0] - 1) if appendix else str(parts[0])
            num = ".".join([first] + [str(p) for p in parts[1:]])
        depth = levels.index(kind) if kind in levels else (len(levels) if kind == "paragraph" else -1)
        heads.append({"pos": pos, "kind": kind, "num": num, "title": title,
                      "depth": depth, "line": body.count("\n", 0, pos) + 1})
    return heads


def section_texts(body, heads):
    out = OrderedDict()
    bounds = [h["pos"] for h in heads] + [len(body)]
    for i, h in enumerate(heads):
        key = (h["num"] + " " if h["num"] else "") + h["title"]
        out[key] = body[bounds[i]:bounds[i + 1]]
    return out


def section_at(heads, pos):
    label = "(trước heading đầu tiên)"
    for h in heads:
        if h["pos"] > pos:
            break
        if h["kind"] != "paragraph":
            label = ("§" + h["num"] if h["num"] else "") + " " + h["title"]
    return label.strip()


# ---------------------------------------------------------------- IDs
def fmt_id(p, n):
    return f"{p}-{n}" if p == "RP" else f"{p}-{n:02d}"


def id_regex(prefixes):
    p = "|".join(sorted(prefixes, key=len, reverse=True))
    return re.compile(r"(?<![A-Za-z])(" + p + r")\s?(?:-{1,3}|–|‑)\s?(\d{1,3})(?!\d)")


def range_regex(prefixes):
    p = "|".join(sorted(prefixes, key=len, reverse=True))
    return re.compile(r"(?<![A-Za-z])(" + p + r")-(\d{1,3})\s*(?:…|\.\.\.|–|—|-|to|đến)\s*(?:\1-)?(\d{1,3})(?!\d)")


def extract_ids(body, heads, prefixes):
    rx = id_regex(prefixes)
    found = OrderedDict()
    line_starts = [0] + [m.end() for m in re.finditer("\n", body)]
    lines = body.split("\n")
    import bisect
    hits = [(m.start(), m.group(1), int(m.group(2)), m.group(2)) for m in rx.finditer(body)]
    for m in range_regex(prefixes).finditer(body):
        a, b = int(m.group(2)), int(m.group(3))
        if 0 < b - a < 60:
            w = len(m.group(2))
            hits += [(m.start(), m.group(1), n, str(n).zfill(w)) for n in range(a + 1, b)]
    hits.sort()
    for start, pfx, n, raw_n in hits:
        key = (pfx, n)
        li = bisect.bisect_right(line_starts, start) - 1
        row = lines[li]
        rec = found.setdefault(key, {"form": f"{pfx}-{raw_n}", "where": [], "text": None, "prio": None})
        sec = section_at(heads, start)
        if sec not in rec["where"]:
            rec["where"].append(sec)
        if rec["text"] is None:
            rec["text"] = detex(row)[:220]
            pm = PRIORITY_RE.search(row) if re.search(r"&|\\\\", row) else None
            if pm:
                rec["prio"] = pm.group(1).replace("Wont", "Won't")
    return found


def hub_ids(hub_dir, prefixes):
    rx, rr = id_regex(prefixes), range_regex(prefixes)
    ids = defaultdict(set)
    for f in sorted(Path(hub_dir).glob("*.md")):
        t = f.read_text(encoding="utf-8", errors="replace")
        for m in rr.finditer(t):
            a, b = int(m.group(2)), int(m.group(3))
            if 0 < b - a < 60:
                for n in range(a, b + 1):
                    ids[(m.group(1), n)].add(f.name)
        for m in rx.finditer(t):
            ids[(m.group(1), int(m.group(2)))].add(f.name)
    return ids


# ---------------------------------------------------------------- main
def find_main(p):
    p = Path(p)
    if p.is_file():
        return p
    cands = [f for f in sorted(p.rglob("*.tex")) if "\\documentclass" in f.read_text(errors="replace")]
    if not cands:
        sys.exit(f"Không tìm thấy file .tex có \\documentclass trong {p}")
    for c in cands:
        if c.name == "main.tex":
            return c
    return cands[0]


def load(path):
    main = find_main(path)
    fl = Flattener(main)
    full = fl.read(fl.root_file)
    if "\\begin{document}" in full:
        pre, body = full.split("\\begin{document}", 1)
        body = body.split("\\end{document}", 1)[0]
    else:
        pre, body = "", full
    meta = {k: detex(braced_arg(pre + body, k) or "") for k in ("title", "author", "date")}
    body = re.sub(r"\n{3,}", "\n\n", body)
    heads = number_headings(body)
    return main, fl, body, heads, meta


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("tex")
    ap.add_argument("--out")
    ap.add_argument("--hub")
    ap.add_argument("--prev")
    ap.add_argument("--prefixes", default=",".join(ID_PREFIXES))
    a = ap.parse_args()
    prefixes = [x.strip() for x in a.prefixes.split(",") if x.strip()]

    main_file, fl, body, heads, meta = load(a.tex)
    folder = main_file.parent.name
    out = Path(a.out or f"/tmp/capstone-sync-report/{folder}")
    out.mkdir(parents=True, exist_ok=True)

    # flat.tex with markers
    pieces, last = [], 0
    for h in heads:
        pieces.append(body[last:h["pos"]])
        label = ("§" + h["num"] + " " if h["num"] else "") + h["title"]
        pieces.append(f"\n[[{label}]]\n")
        last = h["pos"]
    pieces.append(body[last:])
    (out / "flat.tex").write_text("".join(pieces), encoding="utf-8")

    # outline.md
    secs = section_texts(body, heads)
    ol = [f"# Outline: {meta['title'] or folder}", "",
          f"- Main file: `{main_file}`", f"- Author: {meta['author'] or '?'}", f"- Date: {meta['date'] or '?'}",
          f"- Files included ({len(fl.files)}): " + ", ".join(f"`{f.name}`" for f in fl.files), ""]
    if fl.missing:
        ol += ["**MISSING INCLUDES:** " + ", ".join(f"`{m}`" for m in fl.missing), ""]
    for i, (h, (k, txt)) in enumerate(zip(heads, secs.items())):
        words = len(detex(txt).split())
        indent = "  " * max(h["depth"], 0)
        has_child = i + 1 < len(heads) and heads[i + 1]["depth"] > h["depth"]
        flag = "  ⚠️ gần như trống" if words < 25 and not has_child else ""
        ol.append(f"{indent}- {('§' + h['num'] + ' ') if h['num'] else ''}{h['title']}  ({words} từ){flag}")
    (out / "outline.md").write_text("\n".join(ol) + "\n", encoding="utf-8")

    # ids.md
    ids = extract_ids(body, heads, prefixes)
    by_pfx = defaultdict(list)
    for (p, n), r in ids.items():
        by_pfx[p].append((n, r))
    il = ["# IDs trong report", ""]
    for p in prefixes:
        if p not in by_pfx:
            continue
        rows = sorted(by_pfx[p])
        prio = defaultdict(int)
        for _, r in rows:
            if r["prio"]:
                prio[r["prio"]] += 1
        ps = (" · " + " · ".join(f"{v} {k}" for k, v in prio.items())) if prio else ""
        il += [f"## {p} ({len(rows)}){ps}", "", "| ID | Ưu tiên | Ở đâu | Dòng đầu tiên chứa ID |", "|---|---|---|---|"]
        for n, r in rows:
            il.append(f"| {r['form']} | {r['prio'] or ''} | {'; '.join(r['where'][:3])} | {r['text'].replace('|', '¦')} |")
        il.append("")
    (out / "ids.md").write_text("\n".join(il) + "\n", encoding="utf-8")

    # summary
    print(f"Report: {meta['title'] or folder}")
    print(f"Main: {main_file}  | files: {len(fl.files)}  | headings: {len(heads)}  | words: {len(detex(body).split())}")
    if fl.missing:
        print("MISSING INCLUDES: " + ", ".join(fl.missing))
    print("\nOutline (chapter/section):")
    for h in heads:
        if 0 <= h["depth"] <= 1:
            print(f"  {'  ' * h['depth']}{('§' + h['num'] + ' ') if h['num'] else ''}{h['title']}")
    print("\nIDs: " + (", ".join(f"{p}={len(by_pfx[p])}" for p in prefixes if p in by_pfx) or "không có"))

    if a.hub:
        hub = hub_ids(a.hub, prefixes)
        rep_keys = set(ids)
        used = {p for p, _ in rep_keys}
        new = sorted(k for k in rep_keys if k not in hub)
        gone = sorted(k for k in hub if k[0] in used and k not in rep_keys)
        print("\nSo với hub:")
        print("  Có trong report, CHƯA có trong hub: " + (", ".join(fmt_id(p, n) for p, n in new) or "không"))
        print("  Có trong hub (cùng loại), KHÔNG còn trong report: " +
              (", ".join(f"{fmt_id(p, n)} ({', '.join(sorted(hub[(p, n)]))})" for p, n in gone) or "không"))
        print("  (ID chỉ được nhắc lướt trong hub cũng tính. Report nộp một phần thì danh sách thứ hai là bình thường)")

    if a.prev:
        _, _, pbody, pheads, _ = load(a.prev)
        old = section_texts(pbody, pheads)
        new_s = section_texts(body, heads)
        def norm(k):
            return slug_title(re.sub(r"^[\dA-Z.]+ ", "", k))
        old_by = {norm(k): (k, v) for k, v in old.items()}
        dl = [f"# Diff so với `{a.prev}`", ""]
        added, changed, same = [], [], 0
        seen = set()
        for k, v in new_s.items():
            nk = norm(k)
            if nk in old_by:
                seen.add(nk)
                ok, ov = old_by[nk]
                r = difflib.SequenceMatcher(None, detex(ov), detex(v), autojunk=False).quick_ratio()
                if r < 0.995:
                    r = difflib.SequenceMatcher(None, detex(ov), detex(v), autojunk=False).ratio()
                if r < 0.995:
                    changed.append((k, ok, r))
                else:
                    same += 1
            else:
                added.append(k)
        removed = [v[0] for nk, v in old_by.items() if nk not in seen]
        dl += ["## Mục mới", ""] + [f"- {k}" for k in added] + [""]
        dl += ["## Mục bị bỏ", ""] + [f"- {k}" for k in removed] + [""]
        dl += ["## Mục đã sửa (giống nhau %, thấp = sửa nhiều)", ""]
        dl += [f"- {k}  (trước: {ok})  {r * 100:.0f}%" for k, ok, r in sorted(changed, key=lambda x: x[2])]
        dl += ["", f"Không đổi: {same} mục"]
        (out / "diff.md").write_text("\n".join(dl) + "\n", encoding="utf-8")
        print(f"\nSo với report trước: {len(added)} mục mới, {len(removed)} mục bỏ, {len(changed)} mục sửa, {same} không đổi")

    print(f"\nĐã ghi: {out}/flat.tex, outline.md, ids.md" + (", diff.md" if a.prev else ""))


if __name__ == "__main__":
    main()
