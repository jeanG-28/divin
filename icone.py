# -*- coding: utf-8 -*-
"""Rend le logo Divin (silhouette ailee) en PNG, sans dependance SVG."""
import re
from PIL import Image, ImageDraw

CORPS = """M60 30 C63.6 30.4 65.2 33 65.6 36.2
  C67.2 39.4 69.8 42.4 70.2 47.2
  C70.6 52.2 67.6 55.4 66 59.2
  C64.4 63.2 66.6 67.4 69.6 72
  C72.2 76.2 71.6 81.4 69.6 87.2
  C68 92.4 65.6 98.4 64.6 104.2
  C64 108 63.6 111 63.3 114 L60 114 Z"""

AILE = """M65 39 C77 35 89 25 97 11 C97 29 90 44 77 53
  C87 52 94 47 100 40 C97 55 87 66 71 70 Z"""

TETE = (60.0, 21.5, 7.2)          # cx, cy, r
VB = 120.0                         # viewBox
FOND = (14, 12, 13, 255)
TRAIT = (192, 139, 119, 255)


def parse(d, pas=28):
    """Path SVG (M/L/C/Z absolus) -> liste de sous-chemins, chacun une liste de points."""
    jetons = re.findall(r"[MLCZmlcz]|-?\d*\.?\d+", d)
    chemins, pts, i = [], [], 0
    cur = (0.0, 0.0)
    while i < len(jetons):
        c = jetons[i]
        if c in "MLCZmlcz":
            cmd = c
            i += 1
            if cmd in "Zz":
                if pts:
                    chemins.append(pts)
                    pts = []
                continue
        n = lambda k: float(jetons[k])
        if cmd in "Mm":
            cur = (n(i), n(i + 1)); i += 2
            if pts:
                chemins.append(pts)
            pts = [cur]
        elif cmd in "Ll":
            cur = (n(i), n(i + 1)); i += 2
            pts.append(cur)
        elif cmd in "Cc":
            p1 = (n(i), n(i + 1)); p2 = (n(i + 2), n(i + 3)); p3 = (n(i + 4), n(i + 5))
            i += 6
            x0, y0 = cur
            for s in range(1, pas + 1):
                t = s / float(pas)
                u = 1 - t
                x = u**3*x0 + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t**3*p3[0]
                y = u**3*y0 + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t**3*p3[1]
                pts.append((x, y))
            cur = p3
    if pts:
        chemins.append(pts)
    return chemins


def rendre(taille, part=0.74, coin=None, decal_y=0.012):
    """part : proportion du cote occupee par le dessin ; coin : rayon d arrondi du fond."""
    F = 4                                   # sur-echantillonnage
    T = taille * F
    img = Image.new("RGBA", (T, T), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    if coin is None:
        coin = int(T * 0.22)
    d.rounded_rectangle([0, 0, T - 1, T - 1], radius=coin, fill=FOND)

    k = T * part / VB
    dx = (T - VB * k) / 2.0
    dy = (T - VB * k) / 2.0 + T * decal_y

    def place(p, miroir):
        x, y = p
        if miroir:
            x = VB - x
        return (dx + x * k, dy + y * k)

    for path in (AILE, CORPS):
        for miroir in (False, True):
            for sous in parse(path):
                d.polygon([place(p, miroir) for p in sous], fill=TRAIT)

    cx, cy, r = TETE
    d.ellipse([dx + (cx - r) * k, dy + (cy - r) * k,
               dx + (cx + r) * k, dy + (cy + r) * k], fill=TRAIT)

    return img.resize((taille, taille), Image.LANCZOS)


if __name__ == "__main__":
    base = r"E:\Desktop\CLAUDE ALL PROJECT\FEUILLE DE ROUTE\divin-app"
    im = rendre(512)
    im.save(base + r"\icone.png")
    print("icone.png 512x512 ecrite")
    rendre(180).save(base + r"\icone-180.png")
    print("icone-180.png ecrite")
