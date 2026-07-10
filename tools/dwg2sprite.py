"""DWG -> floor-plan sprite converter.

Turns a manufacturer CAD block (top view) into a transparent PNG sprite for
frontend/public/sprites/. Requires ODA File Converter (winget install
ODA.ODAFileConverter) and: pip install ezdxf matplotlib pillow

Usage:
  python tools/dwg2sprite.py "path/to/Machine.DWG" "sprite-slug"
  python tools/dwg2sprite.py "Lifestyle Treadmill Premium LED.DWG" \
      "treadmill-endurance-touch-t-es-f-touch-c"

The sprite lands in frontend/public/sprites/<slug>.png, landscape-oriented,
interior filled white, outside transparent.
"""

import glob
import subprocess
import sys
import tempfile
from pathlib import Path

import matplotlib

matplotlib.use('Agg')
import matplotlib.pyplot as plt  # noqa: E402
import ezdxf  # noqa: E402
from ezdxf import bbox  # noqa: E402
from ezdxf.addons.drawing import RenderContext, Frontend  # noqa: E402
from ezdxf.addons.drawing.config import (  # noqa: E402
    BackgroundPolicy,
    ColorPolicy,
    Configuration,
)
from ezdxf.addons.drawing.matplotlib import MatplotlibBackend  # noqa: E402
from PIL import Image, ImageDraw  # noqa: E402

REPO = Path(__file__).resolve().parent.parent
SPRITES = REPO / 'frontend' / 'public' / 'sprites'
ODA_GLOB = r'C:\Program Files\ODA\ODAFileConverter*\ODAFileConverter.exe'


def dwg_to_dxf(dwg: Path, workdir: Path) -> Path:
    matches = glob.glob(ODA_GLOB)
    if not matches:
        sys.exit('ODA File Converter not found — winget install ODA.ODAFileConverter')
    indir = workdir / 'in'
    outdir = workdir / 'out'
    indir.mkdir()
    outdir.mkdir()
    (indir / dwg.name).write_bytes(dwg.read_bytes())
    subprocess.run(
        [matches[0], str(indir), str(outdir), 'ACAD2018', 'DXF', '0', '1'],
        check=True,
        timeout=120,
    )
    dxf = outdir / (dwg.stem + '.dxf')
    if not dxf.exists():
        sys.exit(f'conversion produced no DXF for {dwg.name}')
    return dxf


def render(dxf: Path, out_png: Path) -> None:
    doc = ezdxf.readfile(dxf)
    msp = doc.modelspace()
    extents = bbox.extents(msp, fast=True)
    w, h = extents.size.x, extents.size.y
    long_side_in = 9.0  # ~1100 px at dpi 120
    scale = long_side_in / max(w, h)
    fig = plt.figure(figsize=(w * scale, h * scale), dpi=120)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_axis_off()
    cfg = Configuration(
        color_policy=ColorPolicy.BLACK,
        background_policy=BackgroundPolicy.OFF,
        lineweight_scaling=2.5,
    )
    Frontend(RenderContext(doc), MatplotlibBackend(ax), config=cfg).draw_layout(
        msp, finalize=True
    )
    fig.savefig(out_png, transparent=True, bbox_inches='tight', pad_inches=0.02)
    plt.close(fig)


def finalize(raw_png: Path, out_png: Path) -> None:
    img = Image.open(raw_png).convert('RGBA')
    if img.height > img.width:  # sprites are landscape: length left-to-right
        img = img.rotate(-90, expand=True)
    base = Image.new('RGBA', img.size, (255, 255, 255, 255))
    base.alpha_composite(img)
    # flood the outside from the corners, then punch it transparent
    marker = (255, 0, 255, 255)
    w, h = base.size
    for corner in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
        if base.getpixel(corner) != marker:
            ImageDraw.floodfill(base, corner, marker, thresh=80)
    px = base.load()
    cleared = 0
    for y in range(h):
        for x in range(w):
            if px[x, y] == marker:
                px[x, y] = (0, 0, 0, 0)
                cleared += 1
    if cleared < w * h * 0.05:
        print('warning: outline may not be watertight — outside barely cleared')
    base.save(out_png)


def main() -> None:
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    dwg = Path(sys.argv[1])
    slug = sys.argv[2]
    if not dwg.exists():
        sys.exit(f'not found: {dwg}')
    SPRITES.mkdir(parents=True, exist_ok=True)
    out = SPRITES / f'{slug}.png'
    with tempfile.TemporaryDirectory() as td:
        workdir = Path(td)
        dxf = dwg_to_dxf(dwg, workdir)
        raw = workdir / 'raw.png'
        render(dxf, raw)
        finalize(raw, out)
    print(f'sprite written: {out}')


if __name__ == '__main__':
    main()
