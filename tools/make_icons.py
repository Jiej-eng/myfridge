"""Generate the PWA icon set for MyFridge (pure Pillow, no external assets)."""
from pathlib import Path

from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parents[1] / "public" / "icons"
OUT.mkdir(parents=True, exist_ok=True)

TEAL_DARK = (11, 93, 87)
TEAL = (15, 118, 110)
TEAL_LIGHT = (20, 184, 166)
CREAM = (247, 252, 250)


def gradient(size: int) -> Image.Image:
    """Diagonal gradient background."""
    base = Image.new("RGB", (size, size), TEAL)
    draw = ImageDraw.Draw(base)
    for y in range(size):
        ratio = y / (size - 1)
        r = int(TEAL_DARK[0] + (TEAL_LIGHT[0] - TEAL_DARK[0]) * ratio)
        g = int(TEAL_DARK[1] + (TEAL_LIGHT[1] - TEAL_DARK[1]) * ratio)
        b = int(TEAL_DARK[2] + (TEAL_LIGHT[2] - TEAL_DARK[2]) * ratio)
        draw.line([(0, y), (size, y)], fill=(r, g, b))
    return base


def rounded_mask(size: int, radius_ratio: float) -> Image.Image:
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [0, 0, size - 1, size - 1], radius=int(size * radius_ratio), fill=255
    )
    return mask


def draw_fridge(draw: ImageDraw.ImageDraw, size: int, inset: float, stroke: int):
    """A simple fridge: rounded rectangle, a freezer divider and two handles."""
    x0 = int(size * inset)
    y0 = int(size * inset)
    x1 = size - x0
    y1 = size - y0
    radius = int(size * 0.09)

    draw.rounded_rectangle([x0, y0, x1, y1], radius=radius, outline=CREAM, width=stroke)
    divider_y = int(y0 + (y1 - y0) * 0.38)
    draw.line([(x0 + stroke, divider_y), (x1 - stroke, divider_y)], fill=CREAM, width=stroke)

    handle_w = int(size * 0.045)
    draw.rounded_rectangle(
        [
            x0 + int(size * 0.14),
            y0 + int(size * 0.10),
            x0 + int(size * 0.14) + handle_w,
            divider_y - int(size * 0.06),
        ],
        radius=handle_w // 2,
        fill=CREAM,
    )
    draw.rounded_rectangle(
        [
            x0 + int(size * 0.14),
            divider_y + int(size * 0.07),
            x0 + int(size * 0.14) + handle_w,
            y1 - int(size * 0.10),
        ],
        radius=handle_w // 2,
        fill=CREAM,
    )


def build(size: int, filename: str, maskable: bool):
    canvas = gradient(size).convert("RGBA")
    layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    fridge_layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw_fridge(ImageDraw.Draw(fridge_layer), size, 0.24 if maskable else 0.20, max(6, size // 26))
    layer = Image.alpha_composite(layer, fridge_layer)

    if maskable:
        # Maskable icons must keep every pixel inside a 40% safe zone: a plain
        # square is the safest choice, the OS applies its own mask.
        canvas = Image.alpha_composite(canvas, layer)
    else:
        rounded = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        rounded.paste(canvas, (0, 0), rounded_mask(size, 0.22))
        canvas = Image.alpha_composite(rounded, layer)

    canvas.convert("RGB").save(OUT / filename, "PNG", optimize=True)
    print("wrote", OUT / filename)


build(192, "pwa-192.png", maskable=False)
build(512, "pwa-512.png", maskable=False)
build(512, "pwa-maskable-512.png", maskable=True)
build(180, "apple-touch-icon.png", maskable=True)
