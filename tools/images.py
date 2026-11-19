# -*- coding: utf-8 -*-
"""Converte as fotografias de site/assets/images para WebP em 800, 1200 e 1600 px
e cria as imagens Open Graph (1200x630). Correr depois de juntar fotografias novas:
    pip install pillow
    python tools/images.py
"""
import re
from pathlib import Path
from PIL import Image, ImageOps

IMG = Path(__file__).resolve().parent.parent / "site" / "assets" / "images"
WIDTHS = (800, 1200, 1600)

for jpg in sorted(IMG.glob("*.jpg")):
    name = jpg.stem
    if re.search(r"-\d{3,4}$", name) or name.startswith("og-"): continue
    im = Image.open(jpg).convert("RGB")
    for w in WIDTHS:
        out = IMG / f"{name}-{w}.webp"
        if out.exists() and out.stat().st_mtime >= jpg.stat().st_mtime: continue
        if im.width < w and w != WIDTHS[0]:
            if im.width <= WIDTHS[0]: break
            r = im.copy()
        else:
            r = im.copy(); r.thumbnail((w, w * 3))
        r.save(out, "WEBP", quality=80, method=6)
    print("ok", name)

for src, out in (("bancada-wide", "og-home"), ("caneca", "og-loja")):
    p = IMG / f"{src}.jpg"
    if p.exists():
        ImageOps.fit(Image.open(p).convert("RGB"), (1200, 630), centering=(0.5, 0.45)).save(IMG / f"{out}.jpg", quality=84, optimize=True)
print("imagens prontas")
