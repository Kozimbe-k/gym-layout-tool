"""Post-processes AI-colorized sprites: trims the white background to
transparent (flood fill from the corners), crops to content, downsizes,
and writes into frontend/public/sprites/ (machines) and sprites/decor/.

Usage: python tools/finalize_sprites.py <raw-dir>
  <raw-dir>/machines/*.png -> frontend/public/sprites/<name>.png
  <raw-dir>/decor/*.png    -> frontend/public/sprites/decor/<name>.png
"""

import sys
from pathlib import Path

from PIL import Image, ImageDraw

REPO = Path(__file__).resolve().parent.parent
SPRITES = REPO / 'frontend' / 'public' / 'sprites'
MAX_SIDE = 800


def process(src: Path, dst: Path) -> str:
    img = Image.open(src).convert('RGBA')
    marker = (255, 0, 255, 255)
    w, h = img.size
    for corner in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
        if img.getpixel(corner) != marker:
            ImageDraw.floodfill(img, corner, marker, thresh=60)
    px = img.load()
    cleared = 0
    for y in range(h):
        for x in range(w):
            if px[x, y] == marker:
                px[x, y] = (0, 0, 0, 0)
                cleared += 1
    note = ''
    if cleared < w * h * 0.03:
        note = ' !! background barely cleared — check manually'
    box = img.getbbox()
    if box:
        img = img.crop(box)
    if max(img.size) > MAX_SIDE:
        ratio = MAX_SIDE / max(img.size)
        img = img.resize((round(img.size[0] * ratio), round(img.size[1] * ratio)), Image.LANCZOS)
    dst.parent.mkdir(parents=True, exist_ok=True)
    img.save(dst)
    return note


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    raw = Path(sys.argv[1])
    count = 0
    for sub, out_dir in [('machines', SPRITES), ('decor', SPRITES / 'decor')]:
        for f in sorted((raw / sub).glob('*.png')):
            note = process(f, out_dir / f.name)
            print(f'{sub}/{f.name}{note}')
            count += 1
    print(f'finalized {count} sprites')


if __name__ == '__main__':
    main()
