#!/usr/bin/env python3
"""Sanity-check docs/project-hub after an edit.

Usage: python3 check_hub.py [docs/project-hub]

Checks every top-level *.md, everything under tuan/, and reports/README.md:
  - relative links point to files that exist, and #anchors exist
    (GitHub heading slugs or <a id="..."> tags)
  - every row of a markdown table has the same number of cells as its header
  - decision IDs D-xx in 02-quyet-dinh.md are unique, and every D-xx cited
    in another file exists in 02
Exit code 1 if anything is wrong. Standard library only.
"""
import re
import sys
from collections import Counter
from pathlib import Path

LINK_RE = re.compile(r"(?<!!)\[[^\]]*\]\(([^)\s]+)\)|!\[[^\]]*\]\(([^)\s]+)\)")


def slug(h):
    h = re.sub(r"<[^>]+>", "", h)
    h = h.replace("`", "").replace("*", "").strip().lower()
    h = re.sub(r"[^\w\- ]", "", h, flags=re.UNICODE)
    return h.replace(" ", "-")


def anchors(path, cache={}):
    if path not in cache:
        t = path.read_text(encoding="utf-8", errors="replace")
        a = set(re.findall(r'<a\s+(?:id|name)="([^"]+)"', t))
        seen = Counter()
        in_code = False
        for line in t.splitlines():
            if line.startswith("```"):
                in_code = not in_code
            if in_code:
                continue
            m = re.match(r"#{1,6}\s+(.*)", line)
            if m:
                s = slug(m.group(1))
                a.add(s if seen[s] == 0 else f"{s}-{seen[s]}")
                seen[s] += 1
        cache[path] = a
    return cache[path]


def split_row(line):
    line = re.sub(r"`[^`]*`", lambda m: m.group(0).replace("|", "¦"), line)
    line = line.replace("\\|", "¦").strip()
    if line.startswith("|"):
        line = line[1:]
    if line.endswith("|"):
        line = line[:-1]
    return line.split("|")


def main():
    hub = Path(sys.argv[1] if len(sys.argv) > 1 else "docs/project-hub").resolve()
    files = sorted(hub.glob("*.md")) + sorted((hub / "tuan").rglob("*.md"))
    rep = hub.parent.parent / "reports" / "README.md"
    if rep.is_file():
        files.append(rep)
    errors = []

    def rel(f):
        try:
            return f.relative_to(hub.parent.parent)
        except ValueError:
            return f.name

    for f in files:
        lines = f.read_text(encoding="utf-8", errors="replace").splitlines()
        in_code = False
        header_cells = None
        for i, line in enumerate(lines, 1):
            if line.startswith("```"):
                in_code = not in_code
                continue
            if in_code:
                continue
            # links
            for m in LINK_RE.finditer(line):
                target = m.group(1) or m.group(2)
                if re.match(r"[a-z]+:", target):
                    continue
                path_part, _, anchor = target.partition("#")
                dest = (f.parent / path_part).resolve() if path_part else f
                if path_part and not dest.exists():
                    errors.append(f"{rel(f)}:{i}: link hỏng → {target}")
                elif anchor and dest.suffix == ".md" and anchor not in anchors(dest):
                    errors.append(f"{rel(f)}:{i}: anchor không có → {target}")
            # tables
            if line.lstrip().startswith("|"):
                cells = split_row(line)
                if header_cells is None:
                    header_cells = len(cells)
                elif not re.match(r"^\s*\|?\s*:?-{2,}", line) and len(cells) != header_cells:
                    errors.append(f"{rel(f)}:{i}: bảng có {len(cells)} ô, header có {header_cells}")
            else:
                header_cells = None

    dec = hub / "02-quyet-dinh.md"
    if dec.is_file():
        rows = re.findall(r"^\|\s*(D-\d+)\s*\|", dec.read_text(encoding="utf-8"), flags=re.M)
        for d, n in Counter(rows).items():
            if n > 1:
                errors.append(f"02-quyet-dinh.md: {d} bị trùng ({n} dòng)")
        known = set(rows)
        for f in files:
            if f == dec:
                continue
            for d in set(re.findall(r"\bD-\d{2}\b", f.read_text(encoding="utf-8"))):
                if d not in known:
                    errors.append(f"{f.name}: nhắc {d} nhưng 02 không có dòng này")

    if errors:
        print("\n".join(errors))
        print(f"\n{len(errors)} lỗi")
        sys.exit(1)
    print(f"OK: {len(files)} file, link/anchor/bảng/D-ID đều ổn")


if __name__ == "__main__":
    main()
