import os

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
icon = Image.open(os.path.join(ROOT, "assets/icon-only.png")).convert("RGBA")
res = os.path.join(ROOT, "android/app/src/main/res")

BG = (255, 255, 255, 255)  # white
TEXT_COLOR = (31, 41, 55)   # gray-800


def get_font(size):
    """Try to load a bold system font, fall back to default."""
    font_paths = [
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/SFNSDisplay.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    ]
    for fp in font_paths:
        if os.path.exists(fp):
            try:
                return ImageFont.truetype(fp, size)
            except Exception:
                continue
    return ImageFont.load_default()


def make_splash(w, h, icon_ratio=0.35):
    bg = Image.new("RGBA", (w, h), BG)
    draw = ImageDraw.Draw(bg)
    icon_size = int(min(w, h) * icon_ratio)
    icon_resized = icon.resize((icon_size, icon_size), Image.LANCZOS)

    # Margin between icon bottom and text
    margin = int(min(w, h) * 0.04)
    font_size = int(min(w, h) * 0.06)
    font = get_font(font_size)

    # Measure text
    text = "HollyPolly"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]

    # Total block height: icon + margin + text
    total_h = icon_size + margin + text_h
    top_y = (h - total_h) // 2

    # Paste icon centered
    icon_x = (w - icon_size) // 2
    bg.paste(icon_resized, (icon_x, top_y), icon_resized)

    # Draw text centered below icon
    text_x = (w - text_w) // 2
    text_y = top_y + icon_size + margin
    draw.text((text_x, text_y), text, fill=TEXT_COLOR, font=font)

    return bg.convert("RGB")


android_targets = [
    (f"{res}/drawable/splash.png",              1280, 1920),
    (f"{res}/drawable-port-mdpi/splash.png",     320,  480),
    (f"{res}/drawable-port-hdpi/splash.png",     480,  800),
    (f"{res}/drawable-port-xhdpi/splash.png",    720, 1280),
    (f"{res}/drawable-port-xxhdpi/splash.png",   960, 1600),
    (f"{res}/drawable-port-xxxhdpi/splash.png", 1280, 1920),
    (f"{res}/drawable-land-mdpi/splash.png",     480,  320),
    (f"{res}/drawable-land-hdpi/splash.png",     800,  480),
    (f"{res}/drawable-land-xhdpi/splash.png",   1280,  720),
    (f"{res}/drawable-land-xxhdpi/splash.png",  1600,  960),
    (f"{res}/drawable-land-xxxhdpi/splash.png", 1920, 1280),
]

for path, w, h in android_targets:
    make_splash(w, h).save(path, "PNG")
    print(f"OK {w}x{h} -> {path.split('res/')[-1]}")

# iOS — all three scale slots use the same 2732x2732 image
ios_base = os.path.join(ROOT, "ios/App/App/Assets.xcassets/Splash.imageset")
splash_ios = make_splash(2732, 2732, icon_ratio=0.30)
for fname in ["splash-2732x2732.png", "splash-2732x2732-1.png", "splash-2732x2732-2.png"]:
    splash_ios.save(f"{ios_base}/{fname}", "PNG")
    print(f"OK iOS {fname}")

print("Done!")
