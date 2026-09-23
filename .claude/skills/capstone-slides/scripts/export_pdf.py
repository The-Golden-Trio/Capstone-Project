#!/usr/bin/env python3
"""Export an HTML deck to a 16:9 PDF (one slide per page). Fonts get embedded, so the PDF works offline.

Usage: python3 export_pdf.py deck.html [deck.pdf]
Needs: pip install playwright && playwright install chromium
Alternative without Python: open the deck in Chrome → Ctrl/Cmd+P → Destination "Save as PDF",
Margins "None", tick "Background graphics".
"""
import sys, pathlib
from playwright.sync_api import sync_playwright

src = pathlib.Path(sys.argv[1]).resolve()
dst = pathlib.Path(sys.argv[2] if len(sys.argv) > 2 else src.with_suffix('.pdf'))
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page()
    pg.goto(src.as_uri(), wait_until='networkidle')
    pg.wait_for_timeout(800)
    pg.emulate_media(media='print')
    pg.pdf(path=str(dst), width='960px', height='540px', print_background=True, margin={'top': '0', 'right': '0', 'bottom': '0', 'left': '0'})
    b.close()
print('wrote', dst)
