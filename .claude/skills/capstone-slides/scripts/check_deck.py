#!/usr/bin/env python3
"""Validate a deck built with the capstone-slides design system.

Usage:
  python3 check_deck.py deck.html                 # static checks only (no deps)
  python3 check_deck.py deck.html --render out/   # + render every slide to PNG and run layout checks
                                                  #   (needs: pip install playwright; playwright install chromium)
Options:
  --wide-font   render with a wider fallback font (DejaVu Sans) to stress-test text overflow
                when Montserrat cannot be downloaded (offline machines).

Exit code 0 = no errors (warnings may still be printed).
"""
import re, sys, pathlib, argparse

PALETTE = {'#003ba3', '#4a8cff', '#efefef', '#000000', '#ffffff', '#000', '#fff'}
LAYOUTS = {'l-cover', 'l-toc', 'l-section', 'l-intro', 'l-statement', 'l-text', 'l-2col', 'l-3col', 'l-grid6',
           'l-4items', 'l-quad', 'l-rows', 'l-table', 'l-process', 'l-roadmap', 'l-tree', 'l-breakdown', 'l-matrix',
           'l-cycle', 'l-diagram', 'l-quote', 'l-bignum', 'l-photo', 'l-photoleft', 'l-demo', 'l-bars', 'l-donuts',
           'l-chart', 'l-team', 'l-testi', 'l-thanks'}
ALLOWED_FONTS = {'montserrat', 'arial', 'helvetica', 'sans-serif', 'inherit', 'var(--font)'}


def static_checks(html):
    errs, warns = [], []
    # 1. palette
    for m in set(re.findall(r'#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b', html)):
        if m.lower() not in PALETTE:
            errs.append(f'color {m} is not in the palette (navy #003BA3, blue #4A8CFF, gray #EFEFEF, black, white)')
    for m in set(re.findall(r'rgba?\(([^)]*)\)', html)):
        nums = [x.strip() for x in m.split(',')][:3]
        if nums not in (['255', '255', '255'], ['0', '0', '0']):
            errs.append(f'rgba({m}) is not a palette color')
    # 2. fonts
    for m in re.findall(r'font-family\s*:\s*([^;}"]+)', html):
        fams = {f.strip().strip('\'"').lower() for f in m.split(',')}
        bad = fams - ALLOWED_FONTS
        if bad:
            errs.append(f'font-family {m.strip()} — only Montserrat is allowed')
    # 3. slides + layouts
    slides = re.findall(r'<section\s+class="slide\b([^"]*)"', html)
    if not slides:
        errs.append('no <section class="slide ..."> found')
    for i, cls in enumerate(slides, 1):
        ls = [c for c in cls.split() if c.startswith('l-')]
        if len(ls) != 1 or ls[0] not in LAYOUTS:
            errs.append(f'slide {i}: must have exactly one known layout class (got {ls or "none"})')
    if slides and 'l-cover' not in slides[0]:
        warns.append('slide 1 is not l-cover')
    if slides and 'l-thanks' not in slides[-1]:
        warns.append('last slide is not l-thanks')
    # 4. tokens untouched
    if '--navy:  #003BA3' not in html or '--blue:  #4A8CFF' not in html:
        errs.append('design tokens in :root were modified or removed — start from assets/starter.html')
    # 5. forbidden styling
    for pat, why in [(r'box-shadow\s*:(?!\s*none)', 'shadows are not part of the style'),
                     (r'border-radius\s*:\s*(?!50%|0\b)[\d.]+px', 'rounded corners are not part of the style (only circles)'),
                     (r'linear-gradient\((?![^)]*var\(--navy\) 50%)(?![^)]*var\(--blue\) 50%)(?![^)]*rgba\(255,255,255)', 'gradients are not part of the style'),
                     (r'<img(?![^>]*class="[^"]*(photo|shot))', '<img> must use class "photo" (grayscale) or "shot" (screenshot)')]:
        if re.search(pat, html):
            warns.append(why)
    return slides, errs, warns


JS_CHECK = r"""
(idx) => {
  const s = document.querySelectorAll('.slide')[idx];
  const sr = s.getBoundingClientRect();
  const deco = [...s.querySelectorAll('.blk,.footbar,.edge-r,.edge-l')].map(e => e.getBoundingClientRect());
  const out = [];
  const walker = document.createTreeWalker(s, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) {
    if (!n.textContent.trim()) continue;
    const el = n.parentElement;
    if (el.closest('svg') || el.closest('.ph')) continue;
    const r = document.createRange(); r.selectNodeContents(n);
    for (const b of r.getClientRects()) {
      const x = b.left - sr.left, y = b.top - sr.top, x2 = x + b.width, y2 = y + b.height;
      const txt = n.textContent.trim().slice(0, 40);
      if (x < 20 || y < 8 || x2 > 940 || y2 > 532) { out.push(`text outside safe area: "${txt}"`); break; }
      for (const d of deco) {
        const dx = d.left - sr.left, dy = d.top - sr.top;
        if (x < dx + d.width - 1 && x2 > dx + 1 && y < dy + d.height - 1 && y2 > dy + 1) { out.push(`text overlaps a decorative block: "${txt}"`); break; }
      }
    }
  }
  for (const t of s.querySelectorAll('svg text')) {
    const b = t.getBoundingClientRect(), v = t.closest('svg').getBoundingClientRect();
    if (b.left < v.left - 1 || b.right > v.right + 1 || b.top < v.top - 1 || b.bottom > v.bottom + 1)
      out.push(`SVG text clipped by its <svg> box: "${t.textContent.trim().slice(0, 40)}"`);
  }
  for (const el of s.querySelectorAll('.node,.kpi,.cell,.lab,.q-h,.side,.toc-num,.v')) {
    if (el.scrollWidth > el.clientWidth + 2) out.push(`text wider than its box: "${el.textContent.trim().slice(0, 40)}"`);
  }
  return [...new Set(out)];
}
"""


def render_checks(path, outdir, wide):
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print('! playwright not installed — skipped render checks (pip install playwright)')
        return []
    out = pathlib.Path(outdir); out.mkdir(parents=True, exist_ok=True)
    errs = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 960, 'height': 540})
        pg.goto(pathlib.Path(path).resolve().as_uri())
        if wide:
            pg.add_style_tag(content=".slide,.slide *{font-family:'DejaVu Sans',sans-serif!important}")
        pg.wait_for_timeout(1200)
        pg.add_style_tag(content='.hud{display:none!important}')
        n = pg.evaluate("document.querySelectorAll('.slide').length")
        for i in range(n):
            pg.evaluate(f"document.querySelectorAll('.slide').forEach((s,k)=>s.classList.toggle('active',k=={i}))")
            pg.screenshot(path=str(out / f'slide-{i+1:02d}.png'))
            for msg in pg.evaluate(JS_CHECK, i):
                errs.append(f'slide {i+1}: {msg}')
        b.close()
    try:  # contact sheet
        from PIL import Image
        files = sorted(out.glob('slide-*.png'))
        cols, w, h = 3, 480, 270
        sheet = Image.new('RGB', (cols * (w + 8), ((len(files) + cols - 1) // cols) * (h + 8)), '#555')
        for k, f in enumerate(files):
            sheet.paste(Image.open(f).resize((w, h)), ((k % cols) * (w + 8), (k // cols) * (h + 8)))
        sheet.save(out / 'contact-sheet.png')
        print(f'  contact sheet: {out / "contact-sheet.png"}')
    except ImportError:
        pass
    return errs


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('deck'); ap.add_argument('--render'); ap.add_argument('--wide-font', action='store_true')
    a = ap.parse_args()
    html = pathlib.Path(a.deck).read_text(encoding='utf-8')
    slides, errs, warns = static_checks(html)
    if a.render:
        errs += render_checks(a.deck, a.render, a.wide_font)
    print(f'{len(slides)} slides checked')
    for w in warns: print('  WARN ', w)
    for e in errs: print('  ERROR', e)
    print('OK' if not errs else f'{len(errs)} error(s)')
    sys.exit(1 if errs else 0)


if __name__ == '__main__':
    main()
