import os
import shutil
import math
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageDraw, ImageFont, ImageOps

PROJECT_ROOT = r"c:\Users\andre\OneDrive\Desktop\Antigravity\Proyectos de Programación\kimberly"
PHOTOS_OUT = os.path.join(PROJECT_ROOT, "public", "assets", "photos")
AUDIO_OUT = os.path.join(PROJECT_ROOT, "public", "assets", "audio")
PUBLIC_OUT = os.path.join(PROJECT_ROOT, "public")

os.makedirs(PHOTOS_OUT, exist_ok=True)
os.makedirs(AUDIO_OUT, exist_ok=True)

SOURCES = [
    (
        r"C:\Users\andre\.gemini\antigravity\brain\5beff21a-8c58-4d25-b411-0250ce6584f1\.user_uploaded\media_1793332358031_f03792bc.jpg",
        "memory-01",
        1600,
    ),
    (
        r"c:\Users\andre\OneDrive\Desktop\Antigravity\Proyectos de Programación\kimberly-birthday\public\assets\photos\foto01.jpg",
        "memory-02",
        1600,
    ),
    (
        r"c:\Users\andre\OneDrive\Desktop\Antigravity\Proyectos de Programación\kimberly-birthday\public\assets\photos\foto02.jpg",
        "memory-03",
        1600,
    ),
]


def enhance_photograph(src_path: str, slug: str, target_max: int = 1600):
    """
    Studio-grade image enhancement (image-enhancer skill):
    - EXIF transpose safety
    - Lanczos high-precision resampling to retina clarity
    - Subtle highlight/shadow S-curve tonal lift without blowing skin tones
    - Gentle edge-aware unsharp masking (radius=1.15, percent=118, threshold=3)
    - Smooth depth/parallax map generation for WebGL 3D shader displacement
    """
    img = Image.open(src_path)
    img = ImageOps.exif_transpose(img).convert("RGB")
    w, h = img.size

    scale = target_max / max(w, h)
    if scale > 1.0:
        new_w, new_h = int(round(w * scale)), int(round(h * scale))
        img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    elif scale < 0.85:
        new_w, new_h = int(round(w * scale)), int(round(h * scale))
        img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)

    # Mild denoise pass for JPEG macroblocks using median/gaussian blend on chroma
    arr = np.asarray(img, dtype=np.float32) / 255.0
    # Soft filmic S-curve lift in midtones + subtle warm golden-rose richness
    lifted = np.clip(arr, 0.0, 1.0)
    # Gentle shadow open & smooth highlight roll-off
    lifted = lifted * (0.96 + 0.06 * (1.0 - lifted))
    # Very subtle cinema warmth (+1.5% R, +0.5% G)
    lifted[..., 0] = np.clip(lifted[..., 0] * 1.015, 0.0, 1.0)
    lifted[..., 1] = np.clip(lifted[..., 1] * 1.005, 0.0, 1.0)

    enhanced = Image.fromarray((lifted * 255.0).astype(np.uint8), mode="RGB")
    enhanced = ImageEnhance.Contrast(enhanced).enhance(1.05)
    enhanced = ImageEnhance.Color(enhanced).enhance(1.04)
    enhanced = enhanced.filter(ImageFilter.UnsharpMask(radius=1.15, percent=115, threshold=3))

    jpg_path = os.path.join(PHOTOS_OUT, f"{slug}.jpg")
    webp_path = os.path.join(PHOTOS_OUT, f"{slug}.webp")
    enhanced.save(jpg_path, "JPEG", quality=92, optimize=True, progressive=True)
    enhanced.save(webp_path, "WEBP", quality=90, method=6)

    # Generate smooth pseudo-depth map for subtle 3D WebGL optical parallax
    # Combines center-weighted subject prior + warm skin/foreground saliency + smooth low-frequency luminance
    dw, dh = enhanced.size
    small = enhanced.resize((dw // 2, dh // 2), Image.Resampling.BILINEAR)
    s_arr = np.asarray(small, dtype=np.float32) / 255.0
    lum = 0.299 * s_arr[..., 0] + 0.587 * s_arr[..., 1] + 0.114 * s_arr[..., 2]
    warmth = np.clip((s_arr[..., 0] - s_arr[..., 2]) * 0.8 + 0.5, 0.0, 1.0)

    yy, xx = np.mgrid[0 : dh // 2, 0 : dw // 2]
    nx = (xx / max(1, (dw // 2 - 1))) * 2.0 - 1.0
    ny = (yy / max(1, (dh // 2 - 1))) * 2.0 - 1.0
    radial_prior = np.exp(-(nx * nx * 0.65 + (ny - 0.08) ** 2 * 0.55))

    depth_raw = 0.48 * radial_prior + 0.30 * lum + 0.22 * warmth
    depth_raw = (depth_raw - depth_raw.min()) / max(1e-5, (depth_raw.max() - depth_raw.min()))
    depth_img = Image.fromarray((depth_raw * 255.0).astype(np.uint8), mode="L")
    depth_img = depth_img.filter(ImageFilter.GaussianBlur(radius=max(12, dw // 45)))
    depth_img = depth_img.resize((dw, dh), Image.Resampling.BICUBIC)
    depth_path = os.path.join(PHOTOS_OUT, f"{slug}-depth.jpg")
    depth_img.save(depth_path, "JPEG", quality=85, optimize=True)

    print(f"[OK] Enhanced {slug}: {enhanced.size} -> JPG/WEBP + DepthMap")


def load_font(candidates, size):
    for c in candidates:
        if os.path.exists(c):
            return ImageFont.truetype(c, size)
    return ImageFont.load_default()


def generate_canvas_art():
    """
    Generates two museum-grade visual artifacts (canvas-design skill):
    1. public/og-card.png (1200x630) for WhatsApp / Instagram link preview
    2. public/constelacion-kimberly.png (1800x2400) downloadable keepsake art poster
    """
    serif_fonts = [
        r"C:\Windows\Fonts\georgiai.ttf",
        r"C:\Windows\Fonts\georgia.ttf",
        r"C:\Windows\Fonts\timesi.ttf",
    ]
    serif_reg_fonts = [
        r"C:\Windows\Fonts\georgia.ttf",
        r"C:\Windows\Fonts\times.ttf",
    ]
    mono_fonts = [
        r"C:\Windows\Fonts\consola.ttf",
        r"C:\Windows\Fonts\cour.ttf",
    ]

    # --- 1. OG CARD (1200 x 630) ---
    W, H = 1200, 630
    yy, xx = np.mgrid[0:H, 0:W]
    nx = (xx - W * 0.5) / (W * 0.5)
    ny = (yy - H * 0.5) / (H * 0.5)
    r2 = nx * nx * 0.75 + ny * ny * 1.15

    # Deep nocturne base -> twilight amethyst -> subtle champagne-rose core glow
    bg = np.zeros((H, W, 3), dtype=np.float32)
    bg[..., 0] = 6 + 34 * np.exp(-r2 * 1.7) + 48 * np.exp(-((nx - 0.18) ** 2 + (ny + 0.08) ** 2) * 3.8)
    bg[..., 1] = 7 + 20 * np.exp(-r2 * 1.8) + 28 * np.exp(-((nx - 0.18) ** 2 + (ny + 0.08) ** 2) * 3.8)
    bg[..., 2] = 15 + 46 * np.exp(-r2 * 1.5) + 32 * np.exp(-((nx + 0.2) ** 2 + (ny - 0.1) ** 2) * 3.0)

    # Subtle tactile film grain
    rng = np.random.default_rng(171029)
    bg += rng.normal(0, 1.35, size=bg.shape)
    bg = np.clip(bg, 0, 255).astype(np.uint8)

    og = Image.fromarray(bg, mode="RGB").convert("RGBA")
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # Golden-ratio harmonic orbital ellipses
    cx, cy = int(W * 0.72), int(H * 0.50)
    for idx, rad in enumerate([74, 118, 176, 248, 336]):
        alpha = max(14, 66 - idx * 11)
        color = (232, 195, 145, alpha) if idx % 2 == 0 else (201, 91, 114, alpha)
        draw.ellipse([cx - rad, cy - rad, cx + rad, cy + rad], outline=color, width=1)

    # Lissajous harmonic resonance curve
    pts = []
    for i in range(720):
        t = (i / 720.0) * 2.0 * math.pi
        px = cx + 165 * math.sin(3 * t + 0.35) * math.cos(t * 0.5)
        py = cy + 165 * math.sin(2 * t)
        pts.append((px, py))
    draw.line(pts, fill=(232, 195, 145, 44), width=1)

    # Star field points
    for _ in range(140):
        sx = int(rng.integers(30, W - 30))
        sy = int(rng.integers(30, H - 30))
        sa = int(rng.integers(35, 165))
        sr = 1 if rng.random() < 0.82 else 2
        draw.ellipse([sx - sr, sy - sr, sx + sr, sy + sr], fill=(244, 239, 234, sa))

    # Central binary stars
    draw.ellipse([cx - 16, cy - 16, cx + 16, cy + 16], fill=(232, 195, 145, 38))
    draw.ellipse([cx - 6, cy - 6, cx + 6, cy + 6], fill=(245, 218, 178, 235))
    draw.ellipse([cx + 46 - 4, cy - 28 - 4, cx + 46 + 4, cy - 28 + 4], fill=(201, 91, 114, 225))

    # Border hairline frame
    draw.rectangle([32, 32, W - 32, H - 32], outline=(232, 195, 145, 42), width=1)

    f_mono = load_font(mono_fonts, 14)
    f_title = load_font(serif_reg_fonts, 62)
    f_italic = load_font(serif_fonts, 27)
    f_sub = load_font(mono_fonts, 13)

    draw.text((76, 86), "PARA KIMBERLY", fill=(232, 195, 145, 195), font=f_mono)
    draw.text((74, 215), "Lo curioso de ti.", fill=(244, 239, 234, 245), font=f_title)
    draw.text(
        (76, 304),
        "“...y luego estás tú, que de alguna manera\nhaces que hasta el silencio tenga sentido.”",
        fill=(218, 210, 224, 215),
        font=f_italic,
    )
    draw.text((76, 516), "01°14'56\" S · 78°37'00\" W   //   FRECUENCIA: 0.000 RAD/S", fill=(154, 150, 173, 165), font=f_sub)

    og_final = Image.alpha_composite(og, overlay).convert("RGB")
    og_final.save(os.path.join(PUBLIC_OUT, "og-card.png"), "PNG", optimize=True)
    print("[OK] Generated og-card.png (1200x630)")

    # --- 2. KEEPSAKE ASTRONOMICAL ART POSTER (1600 x 2200) ---
    PW, PH = 1600, 2200
    pyy, pxx = np.mgrid[0:PH, 0:PW]
    pnx = (pxx - PW * 0.5) / (PW * 0.5)
    pny = (pyy - PH * 0.44) / (PH * 0.5)
    pr2 = pnx * pnx + pny * pny

    pbg = np.zeros((PH, PW, 3), dtype=np.float32)
    pbg[..., 0] = 6 + 36 * np.exp(-pr2 * 1.9) + 35 * np.exp(-((pny - 0.85) ** 2) * 3.5)
    pbg[..., 1] = 7 + 21 * np.exp(-pr2 * 2.0) + 22 * np.exp(-((pny - 0.85) ** 2) * 3.5)
    pbg[..., 2] = 14 + 48 * np.exp(-pr2 * 1.6) + 26 * np.exp(-((pny - 0.85) ** 2) * 3.5)
    pbg += rng.normal(0, 1.4, size=pbg.shape)
    pbg = np.clip(pbg, 0, 255).astype(np.uint8)

    poster = Image.fromarray(pbg, mode="RGB").convert("RGBA")
    pov = Image.new("RGBA", (PW, PH), (0, 0, 0, 0))
    pdraw = ImageDraw.Draw(pov)

    pdraw.rectangle([64, 64, PW - 64, PH - 64], outline=(232, 195, 145, 55), width=1)
    pdraw.rectangle([80, 80, PW - 80, PH - 80], outline=(232, 195, 145, 22), width=1)

    ocx, ocy = PW // 2, int(PH * 0.42)
    for idx, rad in enumerate([90, 150, 225, 320, 430, 540]):
        col = (232, 195, 145, max(16, 78 - idx * 10)) if idx % 2 == 0 else (201, 91, 114, max(16, 68 - idx * 9))
        pdraw.ellipse([ocx - rad, ocy - rad, ocx + rad, ocy + rad], outline=col, width=1)

    # Crosshair astronomical ticks
    pdraw.line([(ocx - 580, ocy), (ocx + 580, ocy)], fill=(232, 195, 145, 28), width=1)
    pdraw.line([(ocx, ocy - 580), (ocx, ocy + 580)], fill=(232, 195, 145, 28), width=1)

    # Parametric rose-harmonic curve (the mathematical signature of resonance)
    h_pts = []
    for i in range(1800):
        t = (i / 1800.0) * 6.0 * math.pi
        r = 390 * math.cos((5.0 / 3.0) * t) * 0.85 + 55 * math.sin(t * 2.0)
        px = ocx + r * math.cos(t)
        py = ocy + r * math.sin(t)
        h_pts.append((px, py))
    pdraw.line(h_pts, fill=(232, 195, 145, 82), width=2)

    for _ in range(320):
        sx = int(rng.integers(90, PW - 90))
        sy = int(rng.integers(90, PH - 90))
        sa = int(rng.integers(30, 190))
        sr = 1 if rng.random() < 0.8 else 2
        pdraw.ellipse([sx - sr, sy - sr, sx + sr, sy + sr], fill=(244, 239, 234, sa))

    pdraw.ellipse([ocx - 26, ocy - 26, ocx + 26, ocy + 26], fill=(232, 195, 145, 45))
    pdraw.ellipse([ocx - 9, ocy - 9, ocx + 9, ocy + 9], fill=(248, 226, 192, 245))

    pf_mono = load_font(mono_fonts, 18)
    pf_head = load_font(serif_reg_fonts, 78)
    pf_quote = load_font(serif_fonts, 34)

    pdraw.text((130, 128), "OBSERVATORIO DE QUIETUD ARMÓNICA  //  ARCHIVO N.° 01", fill=(232, 195, 145, 185), font=pf_mono)
    pdraw.text((130, 1610), "KIMBERLY", fill=(244, 239, 234, 245), font=pf_head)
    pdraw.text(
        (130, 1725),
        "“Entre tantas cosas que cambian, tantos planes que salen mal\ny tantas personas que van y vienen, hay algo de ti que siempre\nocupa un lugar al que nadie más ha llegado.”",
        fill=(222, 214, 228, 220),
        font=pf_quote,
    )
    pdraw.text(
        (130, 2020),
        "LAT 01°14'56\" S  ·  LON 78°37'00\" W  ·  SINGULARIDAD INVARIANTE  ·  R. A. P. S.",
        fill=(154, 150, 173, 175),
        font=pf_mono,
    )

    poster_final = Image.alpha_composite(poster, pov).convert("RGB")
    poster_final.save(os.path.join(PUBLIC_OUT, "constelacion-kimberly.png"), "PNG", optimize=True)
    print("[OK] Generated constelacion-kimberly.png (1600x2200)")


if __name__ == "__main__":
    for src, slug, tmax in SOURCES:
        enhance_photograph(src, slug, tmax)

    src_mp3 = r"c:\Users\andre\OneDrive\Desktop\Antigravity\Proyectos de Programación\kimberly-birthday\public\assets\audio\musica.mp3"
    if os.path.exists(src_mp3):
        shutil.copy2(src_mp3, os.path.join(AUDIO_OUT, "nuestra-cancion.mp3"))
        print("[OK] Copied nuestra-cancion.mp3")

    generate_canvas_art()
