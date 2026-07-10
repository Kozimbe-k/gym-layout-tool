# Equipment sprites

Top-view equipment images (official Matrix product top views, or AI-generated
ones) go in this folder. The canvas uses them automatically instead of the
built-in vector symbols; anything without a sprite keeps the vector fallback.

Rules:

- **Format**: PNG with transparent background
- **View**: top view — looking straight down at the machine (regular ¾-angle
  product photos do not work on a floor plan)
- **Orientation**: landscape — equipment length runs left-to-right
- **Size**: any; it is scaled to the item's real footprint on the canvas
- **Naming**: the full equipment name from the catalog (including the article
  code in parentheses), lowercased, with every run of non-alphanumeric
  characters replaced by `-`

Examples with the current Matrix catalog:

| Equipment name                               | File                                          |
| -------------------------------------------- | --------------------------------------------- |
| Treadmill Endurance Touch (T-ES-F/TOUCH-C)   | `treadmill-endurance-touch-t-es-f-touch-c.png` |
| Chest Press (G3-S10)                         | `chest-press-g3-s10.png`                      |
| Smith Machine (MG-PL62)                      | `smith-machine-mg-pl62.png`                   |
| Adjustable Cable Crossover (G3-MS20)         | `adjustable-cable-crossover-g3-ms20.png`      |

The full list of names comes from `GET /api/equipment` or
`backend/src/data/seedData.js`.

## From DWG CAD blocks

Manufacturer DWG top-view blocks convert directly:

```
python tools/dwg2sprite.py "path/to/Machine.DWG" "<sprite-slug>"
```

Requires ODA File Converter (`winget install ODA.ODAFileConverter`) and
`pip install ezdxf matplotlib pillow`. The script converts DWG→DXF, renders
the line art, rotates to landscape, fills the interior white and makes the
outside transparent. DWG source files themselves stay out of git.
