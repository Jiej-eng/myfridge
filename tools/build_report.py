"""Build the Part A report deck for COMP10013 CW01 (MyFridge PWA).

Run:  python tools/build_report.py
Out:  ../DWT-CW01-First-Attempt-B01857661-Yijie-Shen.pptx
"""

from __future__ import annotations

import os
from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.util import Emu, Inches, Pt

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parent
SHOTS = PROJECT / "docs" / "shots"
OUT = PROJECT.parent / "DWT-CW01-First-Attempt-B01857661-Yijie-Shen.pptx"

SW, SH = 13.333, 7.5
M = 0.62           # page margin
CW = SW - 2 * M    # content width

INK = RGBColor(0x0D, 0x23, 0x20)
MUTED = RGBColor(0x5C, 0x72, 0x6C)
TEAL = RGBColor(0x0F, 0x76, 0x6E)
TEAL_DARK = RGBColor(0x0B, 0x5D, 0x57)
TEAL_SOFT = RGBColor(0xD7, 0xEF, 0xEA)
LINE = RGBColor(0xDB, 0xE9, 0xE3)
CARD = RGBColor(0xF7, 0xFA, 0xF9)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
AMBER = RGBColor(0xB4, 0x53, 0x09)
RED = RGBColor(0xB4, 0x23, 0x18)
CODE_BG = RGBColor(0x10, 0x23, 0x1F)
CODE_INK = RGBColor(0xD8, 0xEE, 0xE8)

HEAD_FONT = "Segoe UI Semibold"
BODY_FONT = "Segoe UI"
MONO_FONT = "Consolas"

prs = Presentation()
prs.slide_width = Inches(SW)
prs.slide_height = Inches(SH)
BLANK = prs.slide_layouts[6]


# --------------------------------------------------------------------------- helpers
def add_slide():
    return prs.slides.add_slide(BLANK)


def rect(slide, left, top, width, height, fill=None, line=None, radius=None, line_w=1.0):
    shape_type = MSO_SHAPE.ROUNDED_RECTANGLE if radius else MSO_SHAPE.RECTANGLE
    shape = slide.shapes.add_shape(shape_type, Inches(left), Inches(top), Inches(width), Inches(height))
    if radius:
        shape.adjustments[0] = radius
    if fill is None:
        shape.fill.background()
    else:
        shape.fill.solid()
        shape.fill.fore_color.rgb = fill
    if line is None:
        shape.line.fill.background()
    else:
        shape.line.color.rgb = line
        shape.line.width = Pt(line_w)
    shape.shadow.inherit = False
    return shape


def textbox(slide, left, top, width, height, anchor=MSO_ANCHOR.TOP):
    box = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(height))
    frame = box.text_frame
    frame.word_wrap = True
    frame.vertical_anchor = anchor
    frame.margin_left = 0
    frame.margin_right = 0
    frame.margin_top = 0
    frame.margin_bottom = 0
    return frame


def write(frame, text, size=12, color=INK, bold=False, font=BODY_FONT, align=PP_ALIGN.LEFT,
          space_after=0, line_spacing=1.15, first=True):
    paragraph = frame.paragraphs[0] if first else frame.add_paragraph()
    paragraph.alignment = align
    paragraph.space_after = Pt(space_after)
    paragraph.line_spacing = line_spacing
    run = paragraph.add_run()
    run.text = text
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color
    run.font.name = font
    return paragraph


def bullets(slide, left, top, width, height, items, size=12, color=INK, gap=8, line_spacing=1.25,
            bullet_color=TEAL):
    """items: list of str or (str, level) or (str, level, bold)."""
    frame = textbox(slide, left, top, width, height)
    first = True
    for item in items:
        if isinstance(item, tuple):
            text, level = item[0], item[1]
            bold = item[2] if len(item) > 2 else False
        else:
            text, level, bold = item, 0, False
        paragraph = frame.paragraphs[0] if first else frame.add_paragraph()
        first = False
        paragraph.space_after = Pt(gap)
        paragraph.line_spacing = line_spacing
        paragraph.alignment = PP_ALIGN.LEFT
        marker = "•  " if level == 0 else "–  "
        # Hanging indent so wrapped lines align under the text, not the bullet.
        indent = Inches(0.22 if level == 0 else 0.22)
        pPr = paragraph._p.get_or_add_pPr()
        pPr.set("marL", str(int(Inches(0.24) + indent * level if level else Inches(0.24))))
        pPr.set("indent", str(-int(Inches(0.24))))

        run = paragraph.add_run()
        run.text = marker
        run.font.size = Pt(size)
        run.font.name = BODY_FONT
        run.font.color.rgb = bullet_color if level == 0 else MUTED
        run2 = paragraph.add_run()
        run2.text = text
        run2.font.size = Pt(size)
        run2.font.name = BODY_FONT
        run2.font.color.rgb = color
        run2.font.bold = bold
    return frame


def code_block(slide, left, top, width, height, code, size=9.5, label=None, label_color=TEAL):
    if label:
        frame = textbox(slide, left, top - 0.28, width, 0.26)
        write(frame, label, size=9, color=label_color, bold=True, font=HEAD_FONT)
    box = rect(slide, left, top, width, height, fill=CODE_BG, radius=0.03)
    frame = box.text_frame
    frame.word_wrap = True
    frame.vertical_anchor = MSO_ANCHOR.TOP
    frame.margin_left = Inches(0.14)
    frame.margin_right = Inches(0.1)
    frame.margin_top = Inches(0.1)
    frame.margin_bottom = Inches(0.06)
    for index, line in enumerate(code.splitlines()):
        paragraph = frame.paragraphs[0] if index == 0 else frame.add_paragraph()
        paragraph.space_after = Pt(0)
        paragraph.line_spacing = 1.06
        paragraph.alignment = PP_ALIGN.LEFT
        run = paragraph.add_run()
        run.text = line if line.strip() else " "
        run.font.size = Pt(size)
        run.font.name = MONO_FONT
        run.font.color.rgb = CODE_INK
    return box


def slide_title(slide, kicker, title, subtitle=None):
    frame = textbox(slide, M, 0.32, CW, 0.26)
    write(frame, kicker.upper(), size=9, color=TEAL, bold=True, font=HEAD_FONT)

    frame = textbox(slide, M, 0.58, CW, 0.6)
    write(frame, title, size=24, color=INK, bold=True, font=HEAD_FONT)

    if subtitle:
        frame = textbox(slide, M, 1.12, CW, 0.3)
        write(frame, subtitle, size=11, color=MUTED)

    accent = rect(slide, M, 1.44, 1.15, 0.05, fill=TEAL)
    line = rect(slide, M + 1.25, 1.463, CW - 1.25, 0.012, fill=LINE)
    return accent, line


def footer(slide, number, label="COMP10013 · CW01 · Part A · Banner ID B01857661"):
    frame = textbox(slide, M, 7.02, CW * 0.7, 0.24)
    write(frame, label, size=8.5, color=MUTED)
    frame = textbox(slide, SW - M - 0.8, 7.02, 0.8, 0.24)
    write(frame, f"{number:02d}", size=9, color=MUTED, bold=True, font=HEAD_FONT, align=PP_ALIGN.RIGHT)


def card(slide, left, top, width, height, title, body, icon_text=None, title_size=11.5, body_size=10.5,
         fill=CARD, title_color=INK):
    shape = rect(slide, left, top, width, height, fill=fill, line=LINE, radius=0.06)
    frame = shape.text_frame
    frame.word_wrap = True
    frame.margin_left = Inches(0.16)
    frame.margin_right = Inches(0.16)
    frame.margin_top = Inches(0.12)
    frame.margin_bottom = Inches(0.08)
    frame.vertical_anchor = MSO_ANCHOR.TOP
    head = frame.paragraphs[0]
    head.space_after = Pt(4)
    head.alignment = PP_ALIGN.LEFT
    run = head.add_run()
    run.text = (icon_text + "  " if icon_text else "") + title
    run.font.size = Pt(title_size)
    run.font.bold = True
    run.font.name = HEAD_FONT
    run.font.color.rgb = title_color
    paragraph = frame.add_paragraph()
    paragraph.line_spacing = 1.18
    paragraph.alignment = PP_ALIGN.LEFT
    run = paragraph.add_run()
    run.text = body
    run.font.size = Pt(body_size)
    run.font.name = BODY_FONT
    run.font.color.rgb = MUTED
    return shape


def add_image(slide, filename, left, top, max_w, max_h, border=True):
    path = SHOTS / filename
    from PIL import Image  # Pillow is available in the build environment

    with Image.open(path) as img:
        iw, ih = img.size
    ratio = min(max_w / iw, max_h / ih)
    w, h = iw * ratio, ih * ratio
    x = left + (max_w - w) / 2
    y = top + (max_h - h) / 2
    pic = slide.shapes.add_picture(str(path), Inches(x), Inches(y), Inches(w), Inches(h))
    if border:
        pic.line.color.rgb = LINE
        pic.line.width = Pt(1)
    return pic, (x, y, w, h)


def caption(slide, left, top, width, text):
    frame = textbox(slide, left, top, width, 0.3)
    write(frame, text, size=8.5, color=MUTED, align=PP_ALIGN.CENTER)


def kv_table(slide, left, top, width, rows, col_widths, header=True, row_height=0.42, font_size=10,
             header_fill=TEAL, header_ink=WHITE):
    shape = slide.shapes.add_table(len(rows), len(rows[0]), Inches(left), Inches(top), Inches(width),
                                   Inches(row_height * len(rows)))
    table = shape.table
    table.first_row = header
    for index, width_ratio in enumerate(col_widths):
        table.columns[index].width = Inches(width * width_ratio)
    for r, row in enumerate(rows):
        table.rows[r].height = Inches(row_height)
        for c, value in enumerate(row):
            cell = table.cell(r, c)
            cell.text = ""
            cell.margin_left = Inches(0.08)
            cell.margin_right = Inches(0.06)
            cell.margin_top = Inches(0.04)
            cell.margin_bottom = Inches(0.03)
            cell.vertical_anchor = MSO_ANCHOR.MIDDLE
            cell.fill.solid()
            if header and r == 0:
                cell.fill.fore_color.rgb = header_fill
            else:
                cell.fill.fore_color.rgb = WHITE if r % 2 else CARD
            frame = cell.text_frame
            frame.word_wrap = True
            paragraph = frame.paragraphs[0]
            run = paragraph.add_run()
            run.text = value
            run.font.size = Pt(font_size)
            run.font.name = HEAD_FONT if (header and r == 0) else BODY_FONT
            run.font.bold = bool(header and r == 0)
            run.font.color.rgb = header_ink if (header and r == 0) else INK
    return table


def arrow(slide, left, top, width, height, color=TEAL):
    shape = slide.shapes.add_shape(MSO_SHAPE.RIGHT_ARROW, Inches(left), Inches(top), Inches(width), Inches(height))
    shape.fill.solid()
    shape.fill.fore_color.rgb = color
    shape.line.fill.background()
    shape.shadow.inherit = False
    return shape


# --------------------------------------------------------------------------- 01 title
slide = add_slide()
rect(slide, 0, 0, SW, SH, fill=RGBColor(0x0B, 0x4F, 0x4A))
rect(slide, 0, 0, SW, 0.16, fill=RGBColor(0x14, 0xB8, 0xA6))
rect(slide, SW - 4.6, -1.2, 4.4, 4.4, fill=RGBColor(0x10, 0x5F, 0x59), radius=0.5)
rect(slide, SW - 3.2, SH - 2.2, 3.4, 3.4, fill=RGBColor(0x12, 0x6A, 0x63), radius=0.5)

frame = textbox(slide, M, 1.5, 8.6, 0.3)
write(frame, "COMP10013 DYNAMIC WEB TECHNOLOGIES  ·  COURSEWORK 01  ·  PART A (40%)", size=10,
      color=RGBColor(0x9F, 0xD9, 0xD0), bold=True, font=HEAD_FONT)

frame = textbox(slide, M, 2.0, 9.2, 1.6)
write(frame, "MyFridge", size=54, color=WHITE, bold=True, font=HEAD_FONT, line_spacing=1.0)
write(frame, "An installable React PWA for fridge stock and expiry tracking", size=19,
      color=RGBColor(0xD8, 0xF2, 0xED), font=BODY_FONT, space_after=0, first=False)

line = rect(slide, M, 4.45, 2.2, 0.04, fill=RGBColor(0x14, 0xB8, 0xA6))

frame = textbox(slide, M, 4.72, 8.4, 1.6)
write(frame, "Formal documentation of the development process", size=12.5, color=WHITE, bold=True, font=HEAD_FONT)
write(frame, "Architecture  ·  implementation evidence  ·  installation and user guide  ·  critical reflection",
      size=11.5, color=RGBColor(0xB9, 0xDF, 0xD8), first=False, space_after=10)
write(frame, "Yijie Shen      Banner ID: B01857661      Deadline: 06 December 2026", size=10.5,
      color=RGBColor(0x9F, 0xD9, 0xD0), first=False)

frame = textbox(slide, SW - 3.5, 6.85, 2.9, 0.3)
write(frame, "Individual submission · COMP10013 CW01", size=9, color=RGBColor(0x8C, 0xC9, 0xC0), align=PP_ALIGN.RIGHT)

# --------------------------------------------------------------------------- 02 overview
slide = add_slide()
slide_title(slide, "01 · Introduction", "Project overview and purpose",
            "One screen, one job: know what is in the fridge and use it before it expires.")

bullets(slide, M, 1.72, 6.7, 4.4, [
    ("The problem", 0, True),
    ("Households buy more than they consume: items move to the back of the fridge, the date on the "
     "packet is forgotten, and food is thrown away while still edible.", 1),
    ("The solution", 0, True),
    ("MyFridge is a single-purpose, mobile-first Progressive Web App that logs each item with a "
     "quantity and an expiry date, then makes the countdown impossible to ignore.", 1),
    ("Design decisions taken before coding", 0, True),
    ("No account and no server: the app runs entirely on the device, so it works offline and keeps "
     "personal data local.", 1),
    ("One primary action (Add item) and one screen; the form is a sheet, not a separate page.", 1),
    ("Five-second rule for daily use: open the app, read the badges, act.", 1),
], size=11, gap=6)

add_image(slide, "01-mobile-home.png", 7.55, 1.6, 2.35, 5.15)
caption(slide, 7.45, 6.78, 2.55, "Figure 1 · Home screen, 390 × 844 viewport")

card(slide, 10.1, 1.66, 2.62, 2.0,
     "What the user sees",
     "Totals at a glance, colour-coded expiry badges, quantity steppers, search and status tabs.",
     body_size=10)
card(slide, 10.1, 3.9, 2.62, 1.55,
     "What the marker sees",
     "Live CRUD, persistence after reload, a camera-captured photo label, expiry reminders and an "
     "installable, offline shell.",
     body_size=10)
footer(slide, 2)

# --------------------------------------------------------------------------- 03 features
slide = add_slide()
slide_title(slide, "02 · Feature selection", "The technical features chosen from the module — and why they matter here",
            "Each feature earns its place in the application; none is bolted on to tick a box.")

rows = [
    ("Feature (module topic)", "Role inside MyFridge", "Why it was chosen", "Assessed in"),
    ("React Hooks: useState, useMemo, custom hooks",
     "Item collection, filters, derived expiry status, modal state",
     "The countdown and the badges must always agree with the stored data; one source of truth makes that automatic",
     "Part B · code quality"),
    ("On-device storage: localStorage + a persistence hook",
     "Every create, read, update and delete survives closing the app",
     "A fridge list is small (< 200 items) and personal: synchronous storage removes loading states and any server",
     "Part B · storage & CRUD (15)"),
    ("MediaDevices API (camera)",
     "Photo label attached to an item when it is added",
     "Similar items (two yoghurt pots, two milks) are indistinguishable by name alone; a photo removes ambiguity",
     "Part B · device APIs (15)"),
    ("Notifications API",
     "A single reminder listing every item due within three days",
     "The value of the app is the nudge, not the list; a reminder is the moment the user actually acts",
     "Part B · device APIs (15)"),
    ("PWA: web manifest + Workbox service worker",
     "Installable standalone app; app shell available offline",
     "It is used at the fridge, on a phone, often without signal; an installed icon removes the browser friction",
     "Part B · deployment (10)"),
]
kv_table(slide, M, 1.72, CW, rows, [0.26, 0.28, 0.31, 0.15], row_height=0.8, font_size=9)
frame = textbox(slide, M, 6.55, CW, 0.3)
write(frame, "Each row is evidenced later in this report — architecture on slide 4, code on 5–9, "
             "verification on 12.", size=9, color=MUTED)
footer(slide, 3)

# --------------------------------------------------------------------------- 04 architecture
slide = add_slide()
slide_title(slide, "03 · Technical understanding", "System architecture: four layers, one direction of data flow",
            "Callbacks go up, props go down, and every mutation passes through a single hook.")

# Presentation layer
card(slide, 0.62, 1.72, 3.55, 2.5, "Presentation layer",
     "AppHeader · StatsBar · FilterBar · ItemCard · ItemForm · CameraCapture · Modal · EmptyState\n\n"
     "No local state and no storage access: they render props and raise events.", body_size=10)

# container layer
card(slide, 4.45, 1.72, 3.55, 2.5, "Container and state layer",
     "App.jsx owns filter state, which modal is open and the toast queue.\n\n"
     "useItems() owns the collection; usePersistedState() mirrors it; useCamera() and "
     "useNotifications() wrap the browser APIs.", body_size=10)

# persistence
card(slide, 8.28, 1.72, 4.43, 2.5, "Persistence and platform layer",
     "localStorage key myfridge.items.v1 (JSON) · MediaDevices · Notifications · Service worker + manifest.\n\n"
     "The browser is the only backend the app has.", body_size=10)

arrow(slide, 4.05, 2.65, 0.3, 0.34)
arrow(slide, 7.88, 2.65, 0.3, 0.34)

kv_table(slide, M, 4.55, CW, [
    ("Contract", "What it guarantees"),
    ("props down", "ItemCard receives one item plus three callbacks; it never reads storage, so it can be tested with a plain object."),
    ("callbacks up", "onEdit / onDelete / onAdjustQuantity are resolved in App, which decides whether to open a form or a confirmation."),
    ("one mutation path", "addItem · updateItem · adjustQuantity · deleteItem are the only writers; the persisted value is written by an effect, so state cannot drift from disk."),
    ("derived, never stored", "status (fresh / soon / expired) and the countdown are computed from expiryDate on every render, so bad data after midnight is impossible."),
], [0.2, 0.8], row_height=0.46, font_size=10)
footer(slide, 4)

# --------------------------------------------------------------------------- 05 storage code
slide = add_slide()
slide_title(slide, "04 · Technical understanding", "On-device storage: a persistence hook plus a single CRUD owner",
            "localStorage is wrapped once, then used through the same interface as useState.")

code_block(slide, M, 1.95, 6.05, 3.15, """// hooks/usePersistedState.js - read once, write on change
const [value, setValue] = useState(
  () => readValue(key, initialValue)      // lazy: disk hit only on mount
);

useEffect(() => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    setStorageError('');
  } catch (error) {
    setStorageError(
      error?.name === 'QuotaExceededError'
        ? 'Local storage is full. Remove a photo...'
        : 'Changes could not be saved.'
    );
  }
}, [key, value]);""", size=9)

code_block(slide, 6.95, 1.95, 5.76, 3.15, """// hooks/useItems.js - the four CRUD operations
const addItem = (draft) => {
  const item = { id: crypto.randomUUID(), ...draft,
                 createdAt: now, updatedAt: now };
  setItems((previous) => [item, ...previous]);
};

const updateItem = (id, changes) =>
  setItems((previous) => previous.map((item) =>
    item.id === id ? { ...item, ...changes } : item));

const adjustQuantity = (id, delta) =>
  setItems((previous) => previous.map((item) =>
    item.id === id
      ? { ...item, quantity: Math.max(1, item.quantity + delta) }
      : item));

const deleteItem = (id) =>
  setItems((previous) => previous.filter((item) => item.id !== id));""", size=9)

bullets(slide, M, 5.4, 6.05, 1.3, [
    ("Why localStorage, not IndexedDB: the dataset is tiny and synchronous reads avoid loading states. "
     "IndexedDB is the documented upgrade path for photos.", 0),
], size=10, gap=4)
bullets(slide, 6.95, 5.4, 5.76, 1.3, [
    ("Quota strategy: photos are re-encoded to 720 px JPEG (≈ 60 kB) before storage, and a failed write "
     "surfaces a banner instead of losing data silently.", 0),
], size=10, gap=4)
card(slide, M, 6.05, CW, 0.8,
     "Trade-off accepted",
     "localStorage writes are synchronous, so a very large payload could block the main thread for a frame. "
     "Keeping the collection small and the photos compressed (≈ 60 kB) holds each write well under 10 ms; "
     "IndexedDB is the documented escape hatch if the dataset grows.",
     body_size=9, title_size=9.5)
footer(slide, 5)

# --------------------------------------------------------------------------- 06 CRUD evidence
slide = add_slide()
slide_title(slide, "05 · Evidence", "CRUD in use: create, read, update and delete — and it survives a reload",
            "Captured from the production build at a 390 × 844 mobile viewport.")

add_image(slide, "03-mobile-form.png", 0.62, 1.72, 2.1, 4.3)
caption(slide, 0.55, 6.1, 2.25, "Figure 2 · Create: bottom-sheet form with validation")
add_image(slide, "01-mobile-home.png", 3.0, 1.72, 2.1, 4.3)
caption(slide, 2.93, 6.1, 2.25, "Figure 3 · Read: sorted list with derived status")
add_image(slide, "04-mobile-confirm.png", 5.38, 1.72, 2.1, 4.3)
caption(slide, 5.31, 6.1, 2.25, "Figure 4 · Delete: confirmation before the write")

bullets(slide, 8.0, 1.78, 4.7, 4.4, [
    ("Create", 0, True),
    ("Name, category, quantity + unit, expiry date, place and note are validated client-side; the item is "
     "prepended so the newest entry is visible immediately.", 1),
    ("Read", 0, True),
    ("One sorting rule (expiry date) plus status tabs, category filter and free-text search over name and note.", 1),
    ("Update", 0, True),
    ("Two paths: the pencil opens the same form pre-filled; the − / + stepper edits quantity without a modal, "
     "clamped at 1.", 1),
    ("Delete", 0, True),
    ("Confirmed in a modal, then removed by id; the rest of the collection is untouched.", 1),
    ("Persistence check", 0, True),
    ("Closing and reopening the tab, and a full reload, both restore the list from localStorage — "
     "verified in the manual checklist (slide 12).", 1),
], size=10, gap=6)
footer(slide, 6)

# --------------------------------------------------------------------------- 07 camera
slide = add_slide()
slide_title(slide, "06 · Device API 1", "Camera: turn a packet into a photo label",
            "MediaDevices.getUserMedia, a canvas snapshot, and a graceful fallback when permission is refused.")

code_block(slide, M, 1.95, 6.35, 4.55, """// hooks/useCamera.js
const startCamera = async () => {
  if (!navigator.mediaDevices?.getUserMedia) { ... }
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: { ideal: 'environment' },
             width: { ideal: 1280 } },
    audio: false
  });
  streamRef.current = stream;
  videoRef.current.srcObject = stream;
  await videoRef.current.play().catch(() => {});
};

const capturePhoto = () => {
  const video = videoRef.current;
  const scale = Math.min(1, 720 /
    Math.max(video.videoWidth, video.videoHeight));
  const canvas = document.createElement('canvas');
  canvas.width  = Math.round(video.videoWidth  * scale);
  canvas.height = Math.round(video.videoHeight * scale);
  canvas.getContext('2d').drawImage(video, 0, 0,
    canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.72);   // ~60 kB
};

useEffect(() => stopCamera, [stopCamera]);   // release on unmount""", size=8.7)

bullets(slide, 7.2, 1.9, 5.45, 4.6, [
    ("Permission and failure handling", 0, True),
    ("NotAllowedError, NotFoundError and NotReadableError are mapped to messages that tell the user what to do "
     "next, rather than a silent black rectangle.", 1),
    ("The stream is stopped on close and on unmount; otherwise the camera stays busy and the next attempt fails.", 1),
    ("Rear camera preferred through facingMode: 'environment'; 1280 px capture, downscaled to 720 px.", 1),
    ("Fallback path", 0, True),
    ("The same dialog offers “Upload instead” (an <input type=\"file\" accept=\"image/*\" capture=\"environment\">), "
     "so the feature survives a denied permission or a desktop with no camera.", 1),
    ("Why it matters", 0, True),
    ("Photographs are the difference between a database and a tool a tired person can use at 22:00 — "
     "the label answers “which one is this?” at a glance.", 1),
], size=10.5, gap=7)
footer(slide, 7)

# --------------------------------------------------------------------------- 08 notifications
slide = add_slide()
slide_title(slide, "07 · Device API 2", "Expiry reminders: the moment the app earns its place",
            "Notifications are requested from a gesture, summarised in one nudge, and never spammed.")

code_block(slide, M, 1.95, 6.35, 3.5, """// hooks/useNotifications.js
const requestPermission = async () => {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'denied') return 'denied';
  const result = await Notification.requestPermission();
  setPermission(result);
  return result;                     // 'granted' | 'denied'
};

const checkExpiring = () => {
  const expiring = items.filter((item) => daysLeft(item.expiryDate) <= 3);
  const body = expiring.slice(0, 5)
    .map((item) => `${item.name} – ${humanCountdown(item.expiryDate)}`)
    .join('\\n');

  new Notification('MyFridge: expiring soon', {
    body, icon: '/icons/pwa-192.png',
    tag: 'myfridge-expiry-check'      // replaces, never stacks
  });
  persistReminderState({ lastCheck: new Date().toISOString() });
};""", size=9)

bullets(slide, 7.2, 1.9, 5.45, 4.6, [
    ("Permission is a user decision", 0, True),
    ("Never requested on load: the header button is the gesture, and the three states "
     "(default / granted / denied) each produce their own message.", 1),
    ("One digest, not an alert per item", 0, True),
    ("A single notification lists up to five items with their human countdown; a fixed tag prevents "
     "duplicate notifications when the user presses the button twice.", 1),
    ("Honest about its limits", 0, True),
    ("A page can only notify while it is open. True background delivery needs Web Push, a service worker "
     "push handler and a server — listed as future work rather than pretended.", 1),
    ("The in-app path never breaks", 0, True),
    ("If permission is refused, the same check still writes a status banner and a “last check” timestamp "
     "into localStorage, so the feature degrades instead of disappearing.", 1),
], size=10.5, gap=7)
footer(slide, 8)

# --------------------------------------------------------------------------- 09 PWA
slide = add_slide()
slide_title(slide, "08 · Deployment", "PWA: one build that installs, launches full-screen and works offline",
            "The manifest and the Workbox service worker are generated at build time by vite-plugin-pwa.")

code_block(slide, M, 1.95, 6.0, 4.15, """// vite.config.js  (base = '/myfridge/' on Pages)
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'MyFridge - Fridge & Expiry Tracker',
    short_name: 'MyFridge',
    display: 'standalone',
    theme_color: '#0f766e',
    background_color: '#f6fbf8',
    start_url: base,
    scope: base,
    icons: [
      { src: 'icons/pwa-192.png', sizes: '192x192' },
      { src: 'icons/pwa-512.png', sizes: '512x512' },
      { src: 'icons/pwa-maskable-512.png',
        sizes: '512x512', purpose: 'maskable' }
    ]
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,svg,png,...}'],
    cleanupOutdatedCaches: true
  }
})""", size=9)

bullets(slide, 6.85, 1.9, 5.8, 4.6, [
    ("Build output (verified)", 0, True),
    ("npm run build → dist/manifest.webmanifest, dist/sw.js, dist/workbox-*.js, 16 precached entries "
     "(≈ 202 KiB) — the app shell loads with no network.", 1),
    ("Standalone display", 0, True),
    ("Once installed, the app opens without browser chrome; iOS uses Add to Home Screen, Android and "
     "desktop Chrome/Edge use the built-in install prompt.", 1),
    ("autoUpdate + cleanupOutdatedCaches", 0, True),
    ("A new deployment is picked up on the next visit and stale precache entries are deleted — no "
     "“why is my old build still showing?” during marking.", 1),
    ("Deployment target", 0, True),
    ("GitHub Pages (branch gh-pages, built with PAGES_BASE=/myfridge/). HTTPS is required for the camera, "
     "notifications and service worker; localhost is the only exception.", 1),
], size=10.5, gap=7)
footer(slide, 9)

# --------------------------------------------------------------------------- 10 UI/UX
slide = add_slide()
slide_title(slide, "09 · Design", "UI/UX decisions: mobile-first, responsive and readable at arm's length",
            "Colour carries meaning, spacing follows one rhythm, and the same components reflow from phone to desktop.")

rows = [
    ("Decision", "Implementation", "Effect on the user"),
    ("Status colour is redundant", "Green / amber / red stripe plus a text badge", "Readable in sunlight and by colour-blind users"),
    ("Mobile-first breakpoints", "Base styles for 390 px; 640 px and 1024 px widen the grid to 2 and 3 cards", "One component set, not a separate desktop page"),
    ("Thumb-zone primary action", "Floating “Add item” button bottom-centre on phones, bottom-right on desktop", "The most frequent action is reachable one-handed"),
    ("Sheets on phones, dialogs on desktop", "Modal aligns to the bottom edge below 640 px, centres above it", "Native-feeling on mobile, familiar on a laptop"),
    ("Accessibility basics", "aria-labels, focus-visible outlines, prefers-reduced-motion, 4.5:1 contrast", "Keyboard and assistive-technology usable"),
]
kv_table(slide, M, 1.68, 6.45, rows, [0.3, 0.42, 0.28], row_height=0.68, font_size=8.5)

add_image(slide, "01-mobile-home.png", 7.25, 1.7, 1.72, 3.6)
caption(slide, 7.1, 5.34, 2.02, "Figure 5 · 390 px")
add_image(slide, "07-desktop-view.png", 9.1, 1.72, 3.6, 2.55)
caption(slide, 9.0, 4.32, 3.8, "Figure 6 · 1280 px, three-column grid")
card(slide, 9.1, 4.95, 3.62, 1.35,
     "Same components, different density",
     "Only the grid, header and dialog placement change across breakpoints; the cards and badges are identical.",
     body_size=9, title_size=9.5)
footer(slide, 10)

# --------------------------------------------------------------------------- 11 setup
slide = add_slide()
slide_title(slide, "10 · Setup and user guide", "From a clean machine to a running app in four commands",
            "Also documented in README.md, which ships inside the repository.")

code_block(slide, M, 1.9, 6.35, 2.55, """# 1. clone
git clone https://github.com/Jiej-eng/myfridge.git
cd myfridge

# 2. install dependencies (Node 18+)
npm install

# 3. development server  ->  http://localhost:5173
npm run dev

# 4. production build + local preview  ->  http://localhost:4173
npm run build && npm run preview""", size=9.5)

kv_table(slide, M, 4.7, 6.35, [
    ("Requirement", "Detail"),
    ("Runtime", "Node.js 18+ (verified on Node 22) and npm 9+"),
    ("Repository", "github.com/Jiej-eng/myfridge — public, with README.md"),
    ("Live demo", "jiej-eng.github.io/myfridge — HTTPS, installable"),
    ("Demo data", "Open ?demo=1 to seed five sample items"),
], [0.3, 0.7], row_height=0.4, font_size=9.5)

bullets(slide, 7.15, 1.9, 5.5, 2.0, [
    ("README contents", 0, True),
    ("Prerequisites, install/dev/build/preview commands, GitHub Pages deployment, install-as-app steps for "
     "Android, iOS and desktop, data model, test checklist, troubleshooting table and references.", 1),
], size=10.5, gap=6)
bullets(slide, 7.15, 3.75, 5.5, 2.9, [
    ("User guide (extract)", 0, True),
    ("Add item → floating button, validated sheet; optional camera photo.", 1),
    ("Browse → sorted by expiry, filtered by status tab, category and search.", 1),
    ("Update → pencil for full edit, − / + for quantity (minimum 1).", 1),
    ("Delete → bin icon, confirmation, then removal by id.", 1),
    ("Remind → “Enable reminders”, then “Check expiring items now”.", 1),
], size=10.5, gap=5)
footer(slide, 11)

# --------------------------------------------------------------------------- 12 verification
slide = add_slide()
slide_title(slide, "11 · Verification", "What was tested, and the evidence that it works",
            "A build that compiles is not a feature that works: the checklist below was run against the production build.")

kv_table(slide, M, 1.72, 7.6, [
    ("#", "Check performed", "Result"),
    ("1", "Production build completes (vite build + PWA plugin)", "Pass · JS 179.6 kB (56.6 kB gzip), CSS 14.4 kB, 16 precache entries"),
    ("2", "Create an item, reload the page", "Pass · item restored from localStorage"),
    ("3", "Quantity − / + at the boundary", "Pass · clamps at 1, persisted after reload"),
    ("4", "Edit expiry date to yesterday", "Pass · badge flips to Expired, countdown “Expired 1 day ago”"),
    ("5", "Search + category + status filter combination", "Pass · count updates, empty state appears when nothing matches"),
    ("6", "Delete with confirmation", "Pass · removed by id, remains deleted after reload"),
    ("7", "Camera capture and upload fallback", "Pass · 720 px JPEG stored, thumbnail survives reload"),
    ("8", "Reminder permission → notification", "Pass · single notification, duplicate tag respected"),
    ("9", "Manifest and service worker in DevTools", "Pass · installable, standalone display, offline reload"),
    ("10", "CI workflow (npm ci → build) on every push", "Pass · green GitHub Actions run on main"),
], [0.06, 0.44, 0.5], row_height=0.44, font_size=8.8)

card(slide, 8.5, 1.72, 4.2, 1.3, "Build evidence",
     "vite v5.4.21 · 1595 modules transformed · dist/sw.js + workbox generated · "
     "no build warnings.", body_size=9.5, title_size=10.5)
card(slide, 8.5, 3.22, 4.2, 1.3, "Browser matrix",
     "Verified in Edge/Chromium at 390 px and 1280 px. iOS Safari needs Add to Home Screen and allows "
     "notifications only for installed web apps.", body_size=9.5, title_size=10.5)
card(slide, 8.5, 4.72, 4.2, 1.3, "Known gaps",
     "No automated unit tests yet; reminders do not fire when the app is closed (Web Push is future work).",
     body_size=9.5, title_size=10.5)
footer(slide, 12)

# --------------------------------------------------------------------------- 13 challenges
slide = add_slide()
slide_title(slide, "12 · Reflection", "Challenges met during development — and how each was resolved",
            "Every entry below changed the design, not just the code.")

rows = [
    ("Challenge", "Root cause", "Resolution and what it taught"),
    ("Photos exhausted the 5 MB localStorage quota",
     "A camera frame is several megapixels; base64 inflates it further",
     "Downscale to 720 px and re-encode at JPEG 0.72 (≈ 60 kB) before saving; catch QuotaExceededError and show a "
     "banner. Storage is a design constraint, not an afterthought."),
    ("Camera stayed busy after closing the dialog",
     "MediaStream tracks keep running unless explicitly stopped",
     "stopCamera() in the close handler and in a useEffect cleanup. Leaked tracks cause NotReadableError on the "
     "next attempt."),
    ("Countdown was one day out",
     "new Date('2026-11-21') is parsed as UTC midnight, which is the previous day in some time zones",
     "expiryDate is split into year/month/day and rebuilt as a local Date; both sides are compared from local "
     "midnight."),
    ("State and storage could disagree",
     "Writing storage inside every handler invites drift and duplicated try/catch",
     "One hook (usePersistedState) reads once and writes in an effect; useItems is the only writer of items."),
    ("Stale build during testing",
     "The service worker served the previous precache",
     "autoUpdate + cleanupOutdatedCaches in production; screenshots are captured with the service worker "
     "bypassed so the evidence matches the build."),
]
kv_table(slide, M, 1.72, CW, rows, [0.26, 0.27, 0.47], row_height=0.8, font_size=8.8)
footer(slide, 13)

# --------------------------------------------------------------------------- 14 conclusions
slide = add_slide()
slide_title(slide, "13 · Conclusion", "Outcome, lessons learned and recommendations",
            "A deliberately small app that does one job reliably, and a clear map of what to do next.")

card(slide, M, 1.72, 3.8, 1.95, "Outcome",
     "MyFridge meets every minimum requirement of the brief: an installable PWA with full CRUD and "
     "persistence, two device APIs (camera and notifications), a responsive UI and a documented, "
     "public repository with a documented build and green CI.", body_size=10)

card(slide, 4.7, 1.72, 3.8, 1.95, "Lessons learned",
     "Hooks are the natural seam between UI and data. Constraints (quota, permissions, offline) shape the "
     "design earlier than features do. A fallback path is part of the feature, not a bonus.", body_size=10)

card(slide, 8.6, 1.72, 4.11, 1.95, "What I would do differently",
     "Decide the storage layer before writing the first component, write the date utilities with tests on "
     "day one, and design the empty and error states alongside the happy path.", body_size=10)

bullets(slide, M, 3.95, 6.1, 2.9, [
    ("Recommendations (prioritised)", 0, True),
    ("IndexedDB via Dexie for photos and a larger catalogue, keeping localStorage for preferences.", 1),
    ("Web Push with a service-worker push handler so reminders arrive with the app closed.", 1),
    ("Barcode scanning (BarcodeDetector) to add items without typing.", 1),
    ("Vitest for date utilities and useItems; Playwright for the CRUD journey.", 1),
], size=10.5, gap=5)

bullets(slide, 6.95, 3.95, 5.75, 2.9, [
    ("Extensions that would change its value", 0, True),
    ("A shared household view (Laravel or MERN API) so two phones see one fridge.", 1),
    ("Waste analytics: what was thrown away this month and what it cost.", 1),
    ("Recipe suggestions from ingredients that expire first.", 1),
    ("Conclusion", 0, True),
    ("The project demonstrates LO1–LO3: framework and API understanding, their application in a real "
     "mobile-first product, and a critical evaluation of their trade-offs.", 1),
], size=10.5, gap=5)
footer(slide, 14)

# --------------------------------------------------------------------------- 15 references
slide = add_slide()
slide_title(slide, "References", "Cite Them Right (Harvard) — sources consulted")

refs = [
    "MDN Web Docs (2025) ‘MediaDevices: getUserMedia() method’. Available at: "
    "https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia (Accessed: 19 November 2026).",
    "MDN Web Docs (2025) ‘Notifications API’. Available at: "
    "https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API (Accessed: 19 November 2026).",
    "MDN Web Docs (2025) ‘Window: localStorage property’. Available at: "
    "https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage (Accessed: 19 November 2026).",
    "MDN Web Docs (2025) ‘MediaStreamTrack: stop() method’. Available at: "
    "https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/stop (Accessed: 19 November 2026).",
    "React (2025) Hooks reference. Available at: https://react.dev/reference/react/hooks "
    "(Accessed: 19 November 2026).",
    "Vite (2025) Getting started. Available at: https://vite.dev/guide/ (Accessed: 19 November 2026).",
    "Vite PWA (2025) Vite Plugin PWA documentation. Available at: https://vite-pwa-org.netlify.app/ "
    "(Accessed: 19 November 2026).",
    "web.dev (2024) Progressive Web Apps. Available at: https://web.dev/explore/progressive-web-apps "
    "(Accessed: 19 November 2026).",
    "University of the West of Scotland (2025) Referencing guide: Cite Them Right Harvard. Available at: "
    "https://uwsuk.libguides.com/referencing (Accessed: 19 November 2026).",
]
bullets(slide, M, 1.72, CW, 4.9, [(ref, 0) for ref in refs], size=9.5, gap=7, line_spacing=1.2)

card(slide, M, 5.95, CW, 0.95,
     "Statement of AI use",
     "AI was used only as a language aid: grammar, spelling and sentence-level phrasing in this report "
     "and in the README were revised with an AI writing assistant. No AI tool generated the application "
     "code, the architecture, the tests, the screenshots or the analysis presented here; every result "
     "was produced and verified by the author.",
     body_size=8.8, title_size=10)
footer(slide, 15)

prs.save(OUT)
print("saved", OUT, "slides:", len(prs.slides.__iter__.__self__._sldIdLst))
