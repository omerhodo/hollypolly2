"""
HollyPolly – App Icon Generator with padding
Uses assets/icon-only.png as source and adds white padding so the
penguin doesn't touch the edges.

Usage:  python3 assets/gen_icons.py
        yarn gen:icons
"""

import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
icon = Image.open(os.path.join(ROOT, "assets/icon-only.png")).convert("RGBA")

BG = (255, 255, 255, 255)  # white


def make_icon(size, icon_ratio=0.75):
    """Create a square icon with white bg and the logo centered at icon_ratio of the size."""
    bg = Image.new("RGBA", (size, size), BG)
    icon_size = int(size * icon_ratio)
    icon_resized = icon.resize((icon_size, icon_size), Image.LANCZOS)
    offset = (size - icon_size) // 2
    bg.paste(icon_resized, (offset, offset), icon_resized)
    return bg.convert("RGB")


# ── iOS ──────────────────────────────────────────────────────────────
ios_base = os.path.join(ROOT, "ios/App/App/Assets.xcassets/AppIcon.appiconset")
ios_targets = [
    ("AppIcon-20@1x.png",    20),
    ("AppIcon-20@2x.png",    40),
    ("AppIcon-20@3x.png",    60),
    ("AppIcon-29@1x.png",    29),
    ("AppIcon-29@2x.png",    58),
    ("AppIcon-29@3x.png",    87),
    ("AppIcon-40@1x.png",    40),
    ("AppIcon-40@2x.png",    80),
    ("AppIcon-40@3x.png",   120),
    ("AppIcon-60@2x.png",   120),
    ("AppIcon-60@3x.png",   180),
    ("AppIcon-76@1x.png",    76),
    ("AppIcon-76@2x.png",   152),
    ("AppIcon-83.5@2x.png", 167),
    ("AppIcon-512@2x.png", 1024),
]

for fname, size in ios_targets:
    path = os.path.join(ios_base, fname)
    make_icon(size).save(path, "PNG")
    print(f"OK iOS  {size:>4}px  {fname}")

# ── Android ──────────────────────────────────────────────────────────
res = os.path.join(ROOT, "android/app/src/main/res")
android_targets = [
    ("mipmap-mdpi",    48),
    ("mipmap-hdpi",    72),
    ("mipmap-xhdpi",   96),
    ("mipmap-xxhdpi", 144),
    ("mipmap-xxxhdpi", 192),
]

for folder, size in android_targets:
    for variant in ["ic_launcher.png", "ic_launcher_round.png", "ic_launcher_foreground.png"]:
        path = os.path.join(res, folder, variant)
        make_icon(size).save(path, "PNG")
    print(f"OK Android  {size:>3}px  {folder}")

print("\nDone! Icons generated with padding.")
