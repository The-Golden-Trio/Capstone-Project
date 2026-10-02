#!/usr/bin/env python3
"""Chuyển báo cáo Markdown (reports/<ngày>/report.md) sang LaTeX theo class hcmut-report.

Usage:
  python tools/report/md2tex.py reports/2026-10-02_ch1-5/report.md reports/2026-10-02_ch1-5/latex

Ghi vào thư mục đích: main.tex, chapters/*.tex, references.tex.
Thư mục đích phải có sẵn hcmut-report.cls, graphics/hcmut.png và figures/fig<n>.png
(sơ đồ Mermaid thứ n của report.md, dựng riêng). Thiếu ảnh thì chèn khung giữ chỗ.
Markdown là bản gốc: sửa report.md rồi chạy lại, không sửa tay các file .tex sinh ra.
Chỉ dùng thư viện chuẩn.
"""
import re
import sys
from pathlib import Path

UNICODE = {
    "—": "---", "–": "--", "−": "$-$", "ρ": "$\\rho$",
    "●": "$\\bullet$", "◐": "$\\ominus$", "○": "$\\circ$",
}
CHAR_CM = 0.18      # bề rộng trung bình một ký tự ở cỡ \small
TEXT_CM = 16.0      # \textwidth của hcmut-report


def fix_unicode(s):
    for k, v in UNICODE.items():
        s = s.replace(k, v)
    return s


def inl(text, cites=True):
    """Markdown trong dòng → LaTeX."""
    text = text.replace("\\*", "\x00AST\x00")
    holders = []

    def hold(tex):
        holders.append(tex)
        return f"\x00H{len(holders) - 1}\x00"

    if cites:
        text = re.sub(
            r"\s*((?:\[\d+\])+)",
            lambda m: hold("\\cite{" + ",".join("r" + n for n in re.findall(r"\d+", m.group(1))) + "}"),
            text,
        )
    text = text.replace("\\", "\\textbackslash{}")
    text = re.sub(r"([&%$#_{}])", r"\\\1", text).replace("\\textbackslash\\{\\}", "\\textbackslash{}")
    text = text.replace("~", "\\textasciitilde{}").replace("^", "\\textasciicircum{}")
    text = re.sub(r"\*\*(.+?)\*\*", r"\\textbf{\1}", text)
    text = re.sub(r"\*(.+?)\*", r"\\textit{\1}", text)
    text = re.sub(r'"([^"]*)"', r"``\1''", text)
    text = fix_unicode(text).replace("\x00AST\x00", "*")
    return re.sub(r"\x00H(\d+)\x00", lambda m: holders[int(m.group(1))], text)


def table(rows, caption):
    header, body = rows[0], rows[2:]
    ncol = len(header)
    cells = [header] + body
    size = "\\footnotesize" if ncol >= 6 else "\\small"
    char_cm = CHAR_CM * (0.9 if ncol >= 6 else 1)
    # Mỗi cột rộng tối thiểu bằng từ dài nhất của nó; phần còn lại chia theo độ dài nội dung trung bình.
    longest_word = [max(max((len(w) for w in re.split(r"[\s/]+|(?<=[a-z])-(?=[a-z])", r[i])), default=1) for r in cells) for i in range(ncol)]
    floor = [min((lw * char_cm + 0.75) / TEXT_CM, 0.30) for lw in longest_word]
    if sum(floor) > 0.9:    # quá chật: chỉ bóp các cột có từ dài, giữ nguyên cột ID
        keep = sum(f for f, lw in zip(floor, longest_word) if lw <= 8)
        scale = (0.9 - keep) / (sum(floor) - keep)
        floor = [f if lw <= 8 else f * scale for f, lw in zip(floor, longest_word)]
    want = [max(sum(len(r[i]) for r in cells) / len(cells), lw) ** 0.75 for i, lw in enumerate(longest_word)]
    frac, free = [None] * ncol, set(range(ncol))
    while True:
        room = 0.995 - sum(f for f in frac if f is not None)
        tight = [i for i in free if room * want[i] / sum(want[j] for j in free) < floor[i]]
        if not tight:
            break
        for i in tight:
            frac[i] = floor[i]
            free.discard(i)
    for i in free:
        frac[i] = room * want[i] / sum(want[j] for j in free)
    cols = "|" + "|".join(
        f">{{\\raggedright\\arraybackslash}}p{{\\dimexpr {f:.3f}\\textwidth-2\\tabcolsep-\\arrayrulewidth\\relax}}"
        for f in frac
    ) + "|"
    head = " & ".join(f"\\textbf{{{inl(c)}}}" for c in header) + " \\\\ \\hline"
    out = ["{" + size, f"\\begin{{longtable}}{{{cols}}}"]
    if caption:
        out.append(f"\\caption{{{inl(caption)}}} \\\\")
    out += ["\\hline", head, "\\endfirsthead", "\\hline", head, "\\endhead"]
    out += [" & ".join(inl(c) for c in r) + " \\\\ \\hline" for r in body]
    out += ["\\end{longtable}", "}"]
    return "\n".join(out)


def figure(n, caption, outdir):
    img = f"figures/fig{n}.png"
    if (outdir / img).exists():
        inner = f"\\includegraphics[width=\\textwidth,height=0.9\\textheight,keepaspectratio]{{{img}}}"
    else:
        inner = f"\\fbox{{\\parbox{{0.8\\textwidth}}{{\\centering Thiếu {inl(img)}}}}}"
    return f"\\begin{{figure}}[H]\n\\centering\n{inner}\n\\caption{{{inl(caption.rstrip('.'))}}}\n\\end{{figure}}"


def convert(md, outdir):
    lines = md.split("\n")
    files, cur = [], None            # [(tên file, [khối LaTeX])]
    refs, in_refs = [], False
    counters = [0, 0, 0]
    nfig = 0
    i = 0

    def start(name):
        nonlocal cur
        cur = []
        files.append((name, cur))

    def check_number(level, manual):
        counters[level] += 1
        for k in range(level + 1, 3):
            counters[k] = 0
        auto = ".".join(str(c) for c in counters[: level + 1])
        assert auto == manual, f"Số mục lệch: báo cáo ghi {manual}, LaTeX sẽ đánh {auto}"

    while i < len(lines):
        ln = lines[i]
        if in_refs:
            m = re.match(r"\[(\d+)\] (.+)", ln)
            if m:
                refs.append(f"\\bibitem{{r{m.group(1)}}} {inl(m.group(2), cites=False)}")
            i += 1
            continue
        if not ln.strip() or ln.strip() == "---":
            i += 1
            continue
        if ln.startswith("## References"):
            in_refs = True
            i += 1
            continue
        m = re.match(r"# (.+?) \{-\}$", ln)
        if m:
            title = m.group(1)
            start("00-" + re.sub(r"\W+", "-", title.lower()).strip("-"))
            cur.append(f"\\section*{{{inl(title)}}}\n\\addcontentsline{{toc}}{{section}}{{{inl(title)}}}")
            i += 1
            continue
        m = re.match(r"# Chapter (\d+) — (.+)$", ln)
        if m:
            check_number(0, m.group(1))
            start(f"ch{m.group(1)}")
            cur.append(f"\\newpage\n\\section{{{inl(m.group(2))}}}")
            i += 1
            continue
        m = re.match(r"(#{2,3}) (\d+(?:\.\d+)+) (.+)$", ln)
        if m:
            level = len(m.group(1)) - 1
            check_number(level, m.group(2))
            cur.append(f"\\{'sub' * level}section{{{inl(m.group(3))}}}")
            i += 1
            continue
        assert not ln.startswith("#"), f"Heading không nhận ra: {ln}"
        if ln.startswith("```"):
            j = i + 1
            while not lines[j].startswith("```"):
                j += 1
            k = j + 1
            while not lines[k].strip():
                k += 1
            cap = re.match(r"\*(.+)\*$", lines[k].strip())
            assert cap, f"Sơ đồ ở dòng {i + 1} thiếu dòng chú thích *...*"
            nfig += 1
            cur.append(figure(nfig, cap.group(1), outdir))
            i = k + 1
            continue
        if ln.startswith("\\begin{landscape}"):
            j = i
            while not lines[j].startswith("\\end{landscape}"):
                j += 1
            cur.append(fix_unicode("\n".join(lines[i : j + 1])))
            i = j + 1
            continue
        if ln.startswith("|"):
            j = i
            while j < len(lines) and lines[j].startswith("|"):
                j += 1
            rows = [[c.strip() for c in r.strip().strip("|").split("|")] for r in lines[i:j]]
            assert all(len(r) == len(rows[0]) for r in rows), f"Bảng ở dòng {i + 1} lệch số cột"
            k = j
            while k < len(lines) and not lines[k].strip():
                k += 1
            caption = None
            if k < len(lines) and lines[k].startswith(": "):
                caption = lines[k][2:].strip()
                j = k + 1
            cur.append(table(rows, caption))
            i = j
            continue
        for pat, env in ((r"- ", "itemize"), (r"\d+\. ", "enumerate")):
            if re.match(pat, ln):
                items = []
                while i < len(lines) and re.match(pat, lines[i]):
                    items.append("  \\item " + inl(re.sub("^" + pat, "", lines[i])))
                    i += 1
                cur.append(f"\\begin{{{env}}}[leftmargin=1.5em]\n" + "\n".join(items) + f"\n\\end{{{env}}}")
                break
        else:
            cur.append(inl(ln))
            i += 1

    (outdir / "chapters").mkdir(parents=True, exist_ok=True)
    for name, blocks in files:
        (outdir / "chapters" / f"{name}.tex").write_text("\n\n".join(blocks) + "\n", encoding="utf-8")
    (outdir / "references.tex").write_text(
        "\\newpage\n\\begingroup\\sloppy\n\\begin{thebibliography}{" + str(len(refs)) + "}\n"
        "\\addcontentsline{toc}{section}{References}\n" + "\n\n".join(refs) + "\n\\end{thebibliography}\n\\endgroup\n",
        encoding="utf-8",
    )
    front = [n for n, _ in files if n.startswith("00-")]
    chapters = [n for n, _ in files if n.startswith("ch")]
    main = MAIN.replace("%%FRONT%%", "\n".join(
        f"\\input{{chapters/{n}}}\n\\newpage" + ("\n\\tableofcontents\n\\newpage" if n == front[0] else "")
        for n in front
    )).replace("%%CHAPTERS%%", "\n".join(f"\\input{{chapters/{n}}}" for n in chapters))
    (outdir / "main.tex").write_text(main, encoding="utf-8")
    return len(files), len(refs), nfig


MAIN = r"""% Sinh tự động từ report.md bằng tools/report/md2tex.py. Sửa report.md rồi chạy lại.
% longtable v4.24 (10/2025) báo "Infinite glue shrinkage" ở mọi chỗ bảng ngắt trang; dùng bản v4.13 kèm sẵn.
\makeatletter\declare@file@substitution{longtable.sty}{longtable-2020-01-07.sty}\makeatother
\documentclass[twoside,final]{hcmut-report}
\usepackage{pdflscape}
\setlength{\LTleft}{0pt}
\setlength{\LTright}{0pt}
\setlength{\emergencystretch}{3em}

\coursename{Specialized Project}
\reporttype{Report: Chapters 1 to 5.1}
\title{JobQuest: An AI-Native Experiential Career-Exploration Platform}
\advisor{& Assoc. Prof. Võ Thị Ngọc Châu &}
\groupname{& Golden Trio &}
% TODO: điền họ tên và MSSV của Nhật
\stuname{%
  & Nguyễn Hữu Phúc & 2352938 \\
  & Trương Gia Kỳ Nam & 2352787 \\
  & Nhật & (MSSV)
}

\begin{document}

\coverpage%

%%FRONT%%
\listoffigures
\addcontentsline{toc}{section}{List of Figures}
\listoftables
\addcontentsline{toc}{section}{List of Tables}

%%CHAPTERS%%

\input{references}
\end{document}
"""

if __name__ == "__main__":
    src, out = Path(sys.argv[1]), Path(sys.argv[2])
    nfile, nref, nfig = convert(src.read_text(encoding="utf-8"), out)
    print(f"Đã ghi {out}/main.tex: {nfile} file chương, {nref} tài liệu tham khảo, {nfig} sơ đồ")
