#!/usr/bin/env python3
"""Chuyển báo cáo Markdown (reports/<ngày>/report.md) sang LaTeX theo class hcmut-report.

Usage:
  python tools/report/md2tex.py reports/master/report.md reports/master

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

    # Công thức trong dòng $...$: giữ nguyên cho LaTeX.
    text = re.sub(r"\$([^$\n]+?)\$", lambda m: hold("$" + m.group(1) + "$"), text)
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
        if keep < 0.9 and sum(floor) > keep:
            scale = (0.9 - keep) / (sum(floor) - keep)
            floor = [f if lw <= 8 else f * scale for f, lw in zip(floor, longest_word)]
        else:  # bảng nhiều cột mà cột nào cũng chỉ có từ ngắn: co đều mọi cột
            floor = [f * 0.9 / sum(floor) for f in floor]
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


def figure(n, caption, outdir, img=None, width=None):
    img = img or f"figures/fig{n}.png"
    # {width=0.63} sau ảnh: rộng 0.63\textwidth, cao tối đa 0.85\textheight (sơ đồ hoạt động dạng dọc).
    size = "width=\\textwidth,height=0.9\\textheight" if width is None else (
        "width=" + ("" if width == "1" else width) + "\\textwidth,height=0.85\\textheight")
    if (outdir / img).exists():
        inner = f"\\includegraphics[{size},keepaspectratio]{{{img}}}"
    else:
        inner = f"\\fbox{{\\parbox{{0.8\\textwidth}}{{\\centering Thiếu {inl(img)}}}}}"
    return f"\\begin{{figure}}[H]\n\\centering\n{inner}\n\\caption{{{inl(caption.rstrip('.'))}}}\n\\end{{figure}}"


def convert(md, outdir):
    # Dòng phụ trên bìa lấy từ comment <!-- reporttype: ... --> trong report.md, nếu có.
    rt = re.search(r"<!--\s*reporttype:\s*(.+?)\s*-->", md)
    md = re.sub(r"<!--\s*reporttype:.*?-->\n?", "", md)
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
            # Cho phép bỏ qua chương chưa viết (ví dụ có Chương 7 khi chưa có Chương 6):
            # LaTeX được đặt lại bộ đếm để vẫn đánh đúng số chương ghi trong báo cáo.
            skip = int(m.group(1)) - 1 - counters[0]
            if skip > 0:
                counters[0] += skip
            check_number(0, m.group(1))
            start(f"ch{m.group(1)}")
            setc = f"\\setcounter{{section}}{{{counters[0] - 1}}}\n" if skip > 0 else ""
            cur.append(f"\\newpage\n{setc}\\section{{{inl(m.group(2))}}}")
            i += 1
            continue
        m = re.match(r"(#{2,3}) (\d+(?:\.\d+)+) (.+)$", ln)
        if m:
            level = len(m.group(1)) - 1
            # Như với chương: cho phép bỏ qua mục chưa viết (ví dụ 5.3.6 ngay sau 5.3.1).
            gap = int(m.group(2).split(".")[-1]) - 1 - counters[level]
            if gap > 0:
                counters[level] += gap
                cur.append(f"\\setcounter{{{'sub' * level}section}}{{{counters[level]}}}")
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
        m = re.match(r"!\[(.+)\]\((?:latex/)?(figures/[^)]+)\)(?:\{width=([\d.]+)\}|\{(landscape)\})?\s*$", ln)
        if m:
            # Ảnh có sẵn (README): không tính vào số thứ tự fig<n> của sơ đồ Mermaid.
            fig = figure(None, m.group(1), outdir, img=m.group(2), width=m.group(3))
            if m.group(4):
                # {landscape}: hình rất ngang, đặt riêng một trang xoay ngang, rộng hết dòng.
                fig = "\\begin{landscape}\n" + fig.replace("width=\\textwidth,height=0.9\\textheight", "width=\\linewidth") + "\n\\end{landscape}"
            cur.append(fig)
            i += 1
            continue
        m = re.match(r"\$\$(.+)\$\$\s*$", ln)
        if m:
            # Công thức một dòng $$...$$: thành equation có đánh số.
            cur.append("\\begin{equation}\n" + m.group(1).strip() + "\n\\end{equation}")
            i += 1
            continue
        if ln.startswith("\\begin{usecase}"):
            # Bảng use case viết thẳng bằng LaTeX (môi trường usecase trong MAIN): chép nguyên văn.
            j = i
            while not lines[j].startswith("\\end{usecase}"):
                j += 1
            cur.append("\n".join(lines[i : j + 1]))
            i = j + 1
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
    main = MAIN.replace("Report: Chapters 1 to 5.1", inl(rt.group(1)) if rt else "Report: Chapters 1 to 5.1")
    main = main.replace("%%FRONT%%", "\n".join(
        f"\\input{{chapters/{n}}}\n\\newpage" + ("\n\\tableofcontents\n\\newpage" if n == front[0] else "")
        for n in front
    )).replace("%%CHAPTERS%%", "\n".join(f"\\input{{chapters/{n}}}" for n in chapters))
    (outdir / "main.tex").write_text(main, encoding="utf-8")
    return len(files), len(refs), nfig


MAIN = r"""% Sinh tự động từ report.md bằng tools/report/md2tex.py. Sửa report.md rồi chạy lại.
% longtable v4.24 (10/2025) báo "Infinite glue shrinkage" ở mọi chỗ bảng ngắt trang; dùng bản v4.13 kèm sẵn.
\makeatletter\declare@file@substitution{longtable.sty}{longtable-2020-01-07.sty}\makeatother
\PassOptionsToPackage{table}{xcolor}
\documentclass[twoside,final]{hcmut-report}
\usepackage{pdflscape}
\usepackage{array}
\usepackage{longtable}
\usepackage{xcolor}

\definecolor{uclabel}{gray}{0.92}   % label column and title row
\definecolor{uchead}{gray}{0.85}    % "Step | Action" header row

% column widths: label | step | action
\newlength{\ucA}\newlength{\ucB}\newlength{\ucC}\newlength{\ucBC}
\AtBeginDocument{%
  \setlength{\ucA}{0.19\linewidth}%
  \setlength{\ucB}{0.07\linewidth}%
  \setlength{\ucC}{\dimexpr\linewidth-\ucA-\ucB-6\tabcolsep-4\arrayrulewidth\relax}%
  \setlength{\ucBC}{\dimexpr\ucB+\ucC+2\tabcolsep+\arrayrulewidth\relax}%
}

% \begin{usecase}{UC-E01}{Register account} ... \end{usecase}
\newenvironment{usecase}[2]{%
  \renewcommand{\arraystretch}{1.3}%
  \begin{longtable}{|>{\columncolor{uclabel}\raggedright\arraybackslash}p{\ucA}%
                    |>{\centering\arraybackslash}p{\ucB}%
                    |>{\raggedright\arraybackslash}p{\ucC}|}
  \caption{Use case #1: #2}\\
  \hline
  \textbf{#1} & \multicolumn{2}{>{\columncolor{uclabel}}p{\ucBC}|}{\textbf{#2}}\\
  \endfirsthead
  \hline
  \textbf{#1} & \multicolumn{2}{>{\columncolor{uclabel}}p{\ucBC}|}{\textbf{#2} \textit{(continued)}}\\
  \endhead
  \hline
  \endfoot
}{\end{longtable}}

% one-cell row: \ucrow{Precondition}{text}
\newcommand{\ucrow}[2]{%
  \hline \textbf{#1} & \multicolumn{2}{>{\raggedright\arraybackslash}p{\ucBC}|}{#2}\\}

% step block: \ucsteps{Ordinary Sequence} followed by \ucstep{1}{text} ...
\newcommand{\ucsteps}[1]{%
  \hline \textbf{#1} & \cellcolor{uchead}\textbf{Step} & \cellcolor{uchead}\textbf{Action}\\}
\newcommand{\ucstep}[2]{\cline{2-3} & #1 & #2\\}

% bullet line inside a cell (breaks before each item, not after the last)
\newcommand{\ucitem}[1]{\ifhmode\par\fi\textbullet~#1}
\setlength{\LTleft}{0pt}
\setlength{\LTright}{0pt}
\setlength{\emergencystretch}{3em}

\coursename{Specialized Project}
\reporttype{Report: Chapters 1 to 5.1}
\title{JobQuest: An AI-Native Experiential Career-Exploration Platform}
\advisor{& Assoc. Prof. Võ Thị Ngọc Châu &}
\groupname{& Golden Trio &}
\stuname{%
  & Nguyễn Hữu Phúc & 2352938 \\
  & Trương Gia Kỳ Nam & 2352787 \\
  & Châu Anh Nhật & 2352856
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
