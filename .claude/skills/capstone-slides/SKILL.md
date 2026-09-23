---
name: capstone-slides
description: Build HTML presentation slides for the HCMUT capstone project (bảo vệ đồ án, thuyết trình, báo cáo tiến độ) that follow the team's navy/blue Montserrat design system. Use whenever someone asks for slides, a deck, a presentation or "slide HTML" for the capstone, even if they don't mention the design system.
---

# Capstone Slides: design system and deck builder

This skill produces **one self-contained HTML file** per deck: 16:9 slides (960×540 px canvas) that scale to any screen, go fullscreen with F, and print to PDF. The look is taken from slides 1–35 of the team's Google Slides template: flat, white background, navy and blue, Montserrat, with **square colour blocks that meet at the slide's midline**.

Files in this skill:

| Path | What it is |
|---|---|
| `assets/starter.html` | The deck shell: design tokens, all layout CSS, and the runtime. **Every deck starts as a copy of this file.** |
| `references/layouts.md` | Catalogue of the 33 allowed layouts, each with a copy-paste HTML snippet. |
| `examples/showcase.html` | Every layout rendered with sample capstone content. Open it to see the target look. |
| `scripts/check_deck.py` | Validator. Static checks need no dependencies; `--render` also screenshots each slide and flags text that overflows. |
| `scripts/export_pdf.py` | HTML → PDF (one slide per page, fonts embedded). |

## Workflow

1. **Get the content first.** Ask for, or pull from the repo or docs: the purpose (defense, progress report, demo day), the time limit, the audience, and real facts (numbers, features, architecture, results). Do not invent data. When a number is unknown, show `[số liệu]` as a placeholder and list it for the user.
2. **Write the outline as a table** with slide number, layout id and key message (one sentence). For a defense, use the outline below. Show it to the user before building if they are available.
3. **Build the deck.** Copy `assets/starter.html` to the output path. Set `<title>`. Paste one snippet per slide from `references/layouts.md` between the `SLIDES START` and `SLIDES END` markers. Replace the text only. Keep every class name, block position, `footbar` and `edge-*` element exactly as in the snippet.
4. **Validate.** Run `python3 <skill>/scripts/check_deck.py deck.html --render /tmp/deck-check` and fix every ERROR. Then look at `contact-sheet.png` yourself. If Montserrat can't be downloaded in your environment, add `--wide-font`, which stress-tests with a wider font. When a slide overflows, shorten the text. Do not shrink the font or move blocks.
5. **Deliver** the single `.html` file. Offer a PDF made with `scripts/export_pdf.py`. The PDF is the safest file for presenting offline, because the HTML loads Montserrat from Google Fonts.

## Hard rules (the design system)

### Colour: only these five, always through the CSS variables

| Token | Hex | Used for |
|---|---|---|
| `--navy` | `#003BA3` | slide titles, headings (`.h3`), `<b>`, dark blocks, table/card headers, KPI box |
| `--blue` | `#4A8CFF` | big numbers, TOC and section numbers, highlighted title word (`.hl`), icons, bullets, light blocks, chevrons, connector lines |
| `--gray` | `#EFEFEF` | cards, cells, bar tracks, neutral blocks |
| `--ink` | `#000000` | body text |
| `--white` | `#FFFFFF` | background, text on navy or blue |

No other colours: no red or green for good/bad, no tints, no gradients (the white `.wash` on photo slides is the only exception). In SVG, paint with the `.f-navy / .f-blue / .f-gray / .f-ink / .f-white` and `.s-*` classes, never with hex values.

### Typography: Montserrat only, fixed scale

| Role | Token | Size | Weight / colour |
|---|---|---|---|
| Slide title | `--fs-h2` | 37.3px (28pt) | 700, navy |
| Item heading | `--fs-h3` | 24px (18pt) | 700, navy |
| Body | `--fs-body` | 18.7px (14pt) | 400, black |
| Caption / dense text | `--fs-sm` | 16px | 400 |
| Cover title | `--fs-d3` | 70.7px | 700, navy, last keyword blue |
| Section title / number | `--fs-d4` / `--fs-d2` | 62.7px / 93.3px | 700, navy / blue |
| Big number | `--fs-d1` | 122.7px | 700, blue |

Never set a font size in px on a slide; use the tokens. Titles are sentence case (not UPPERCASE). No italics except inside quotes, no underlines, no emoji, no text shadows. Vietnamese needs full diacritics.

### Grid and decoration
- The canvas is always 960×540. Text boxes start at x = 75 px (the text sits 10 px inside) and titles sit at top 40 px. Keep all text inside x 20–940 and y 8–532, and above the 32 px footbar when there is one.
- **Colour blocks** (`.blk`) are always 128 px wide, and they come in **pairs in adjacent columns that touch diagonally at the midline y = 270**. One block of each pair touches the top or bottom edge. Colour pairs are blue + navy, blue + gray or navy + blue. Blocks carry no text. Never add, move or resize blocks; use the snippet's positions.
- A slide has **at most one** decoration system: a block pair (or single block), **or** a `footbar` (the half navy, half blue strip at the bottom), **or** an `edge-r`/`edge-l` strip. Keep each layout's own choice.
- Alignment follows the layout: left, centred or right. Don't mix alignments within one text group.
- Photos are **grayscale** (`<img class="photo">`), bright and uncluttered. Product screenshots stay in colour (`<img class="shot">`). Placeholders use `<div class="ph">[ẢNH: mô tả]</div>`.
- Icons are inline SVG line icons (24-unit viewBox, Lucide style) with `class="icon"`. They render as a blue outline at 44 px. Never use filled or multicolour icons.
- Charts are inline SVG in navy / blue / gray: no 3D, no gridline clutter, and direct labels where possible. Use one KPI box (`.kpi`) at most per slide.
- Nothing rounded except circles (dots, donuts, avatars). No shadows, no borders except `node.outline` and table row rules.

### Content density
- One message per slide. The slide title states it (≤ 45 characters, 1 line; 2 lines only on `diagram`).
- Bullets: 3–6 per slide, ≤ 12 words each, one nesting level at most.
- Respect the per-layout limits in `references/layouts.md` (item counts, word counts). If content doesn't fit, split it into two slides. Never shrink the text.
- Don't use the same layout on consecutive slides, except `text`. Alternate `section` / `section-alt`.
- Numbers use the Vietnamese format in Vietnamese decks (`1,2 giây`, `12.500 người dùng`).

## Recommended outline: capstone defense (15–20 min, ~18–24 slides)

| # | Layout | Content |
|---|---|---|
| 1 | `cover` | Project name (keyword highlighted), one-line subtitle, team, advisor (GVHD), date |
| 2 | `toc` | 4 chapters: Vấn đề · Giải pháp · Hệ thống · Kết quả |
| 3 | `section` | 01 Vấn đề |
| 4 | `intro` or `bignum` | Context and the one striking statistic |
| 5 | `quote` / `bars` | Evidence from user research |
| 6 | `table` / `quad` | Existing solutions and their gaps (or SWOT) |
| 7 | `section-alt` | 02 Giải pháp |
| 8 | `statement` | The product idea in one line |
| 9 | `3col` / `grid6` | Key features / functional requirements |
| 10 | `tree` | Feature decomposition or use-case groups |
| 11 | `section` | 03 Hệ thống |
| 12 | `diagram` | Architecture (nodes + arrows in SVG) |
| 13 | `rows` | Tech stack by layer |
| 14 | `process` / `cycle` | Main flow, AI pipeline or development process |
| 15 | `demo` | Screenshots (one slide per key screen) |
| 16 | `section-alt` | 04 Kết quả |
| 17 | `donuts` / `chart` | Test and evaluation results |
| 18 | `testimonials` | User feedback |
| 19 | `roadmap` | Timeline done and future work (Hướng phát triển) |
| 20 | `team` | Members and roles |
| 21 | `thanks` | Q&A, contacts, repo and demo links |

For a progress report (báo cáo tiến độ), use the cover, toc, `roadmap` (done / doing / next), `grid6` (completed tasks), `quad` (risks), `demo` and `thanks`.

## When no layout fits
Use `diagram` (title plus a free canvas) and build inside `.stage` with the primitives: `.node.navy|blue|gray|outline`, `.kpi`, `.tbl`, `.ul`, `.dot` and inline SVG with the paint classes. Keep the canvas bounds and the palette. If you truly need a new CSS rule, put it in the `DECK-SPECIFIC` block of the copied starter, and use only the tokens. Never edit `:root`.

## Runtime (tell the presenter)
→ / Space: next slide. ←: previous. Home / End: first / last. **F**: fullscreen. **O**: overview grid (click a slide to jump). **P**: print or save as PDF. `deck.html#7` opens slide 7.
