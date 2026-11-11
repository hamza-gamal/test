import time
import math
import cv2
import numpy as np

# Character ramps
RAMP = " .':-+*#%@$"
GLYPH_DENSE = "@%#&8BWMQ0"
GLYPH_MID = "oahkbdpqZXCJליוUY"
GLYPH_LIGHT = "*+=~-:^'.`"
CODE_SYMBOLS = "{}[]()<>/\_~$#@"

def _c(r, g, b):
    return np.array([r, g, b], np.float32)

THEMES = [
    dict(
        name="Aurora",
        subtitle="cold aurora: cyan iris, violet heart nebula, ice stars",
        cloud_a=_c(0.05, 0.18, 0.45), cloud_b=_c(0.30, 0.10, 0.60),
        space=_c(0.004, 0.006, 0.016),
        iris_a=_c(0.10, 0.72, 0.88), iris_b=_c(0.07, 0.13, 0.45),
        iris_glow=_c(0.00, 0.26, 0.34),
        sclera=_c(0.78, 0.84, 0.92), sclera_flush=_c(0.74, 0.20, 0.25),
        skin=_c(0.50, 0.36, 0.36),
        heart_deep=_c(0.42, 0.14, 0.92), heart_light=_c(0.92, 0.55, 1.00),
        heart_halo=_c(0.30, 0.10, 0.80), heart_rim=_c(0.55, 0.20, 0.90),
        heart_core=_c(1.00, 0.90, 1.00),
        star_a=_c(0.65, 0.88, 1.00), star_b=_c(0.85, 0.70, 1.00),
    ),
    dict(
        name="Emerald & Gold",
        subtitle="emerald eye, molten-gold heart nebula, jade dust",
        cloud_a=_c(0.03, 0.30, 0.22), cloud_b=_c(0.45, 0.25, 0.06),
        space=_c(0.004, 0.009, 0.010),
        iris_a=_c(0.15, 0.78, 0.38), iris_b=_c(0.03, 0.22, 0.10),
        iris_glow=_c(0.10, 0.28, 0.04),
        sclera=_c(0.86, 0.86, 0.80), sclera_flush=_c(0.84, 0.50, 0.20),
        skin=_c(0.60, 0.42, 0.30),
        heart_deep=_c(0.95, 0.42, 0.05), heart_light=_c(1.00, 0.90, 0.40),
        heart_halo=_c(0.85, 0.30, 0.02), heart_rim=_c(1.00, 0.60, 0.10),
        heart_core=_c(1.00, 0.98, 0.85),
        star_a=_c(0.60, 1.00, 0.75), star_b=_c(1.00, 0.86, 0.47),
    ),
    dict(
        name="Dusk",
        subtitle="rose-coral heart nebula, dusk purple iris, twilight aura",
        cloud_a=_c(0.29, 0.06, 0.20), cloud_b=_c(0.14, 0.04, 0.25),
        space=_c(0.016, 0.004, 0.012),
        iris_a=_c(0.96, 0.25, 0.37), iris_b=_c(0.53, 0.07, 0.22),
        iris_glow=_c(0.35, 0.06, 0.16),
        sclera=_c(0.88, 0.80, 0.84), sclera_flush=_c(0.88, 0.30, 0.40),
        skin=_c(0.55, 0.33, 0.37),
        heart_deep=_c(0.88, 0.11, 0.28), heart_light=_c(1.00, 0.80, 0.83),
        heart_halo=_c(0.70, 0.08, 0.20), heart_rim=_c(0.95, 0.35, 0.50),
        heart_core=_c(1.00, 0.92, 0.95),
        star_a=_c(1.00, 0.70, 0.78), star_b=_c(0.86, 0.70, 1.00),
    ),
    dict(
        name="Classic",
        subtitle="phosphor green terminal, binary void, cyber matrix eye",
        cloud_a=_c(0.04, 0.24, 0.08), cloud_b=_c(0.02, 0.16, 0.06),
        space=_c(0.004, 0.012, 0.004),
        iris_a=_c(0.13, 0.77, 0.37), iris_b=_c(0.06, 0.37, 0.16),
        iris_glow=_c(0.04, 0.31, 0.10),
        sclera=_c(0.63, 0.90, 0.71), sclera_flush=_c(0.30, 0.70, 0.40),
        skin=_c(0.16, 0.31, 0.20),
        heart_deep=_c(0.13, 0.77, 0.37), heart_light=_c(0.73, 0.97, 0.82),
        heart_halo=_c(0.08, 0.55, 0.25), heart_rim=_c(0.20, 0.85, 0.45),
        heart_core=_c(0.90, 1.00, 0.92),
        star_a=_c(0.53, 0.94, 0.67), star_b=_c(0.29, 0.87, 0.50),
    )
]

def main():
    width, height = 760, 520
    cols, rows = 95, 45
    cw, ch = width / cols, height / rows

    theme_idx = 0
    paused = False
    start_time = time.time()
    t = 0

    print("Running Eye -> Space interactive viewer. Press 'C' to change theme, Space to pause, Esc to quit.")

    while True:
        if not paused:
            t = time.time() - start_time

        th = THEMES[theme_idx]
        title = f"Eye -> Space [{th['name']}]  C: theme  R: restart  Space: pause  Esc: quit"

        # Frame canvas
        canvas = np.zeros((height, width, 3), dtype=np.uint8)
        bg = (th['space'] * 255).astype(np.uint8)
        canvas[:] = [int(bg[2]), int(bg[1]), int(bg[0])]

        # Zoom cycle
        cycle = (math.sin(t * 0.4) * 0.5 + 0.5)
        zoom = 0.95 + (cycle ** 1.8) * 2.8

        # Render ASCII grid
        for r in range(rows):
            ny = (r / rows) * 2.0 - 1.0
            y_pos = int((r + 0.8) * ch)

            for c in range(cols):
                nx = ((c / cols) * 2.0 - 1.0) * (width / height)
                x_pos = int(c * cw)

                zx = nx / zoom
                zy = ny / zoom

                # Eye almond geometry
                eye_w = 0.85
                eye_h = 0.42
                in_eye = abs(zx) < eye_w
                eyelid = -1.0
                if in_eye:
                    arch = math.sqrt(max(0.0, 1.0 - (zx / eye_w) ** 2))
                    top = -eye_h * arch
                    bot = +eye_h * arch * 0.85
                    if top <= zy <= bot:
                        eyelid = min(zy - top, bot - zy) / eye_h

                dist = math.hypot(zx, zy)
                space_blend = min(1.0, max(0.0, (zoom - 1.2) / 2.2))

                # Regions
                if eyelid < 0 and space_blend < 0.95:
                    lum = max(0.04, (1.0 - math.hypot(zx, zy * 1.4) * 0.6) * 0.22)
                    col = th['skin'] * lum
                    ch_idx = int(lum * (len(RAMP) - 1))
                    glyph = RAMP[min(len(RAMP) - 1, max(0, ch_idx))]
                elif dist > 0.32 and space_blend < 0.95:
                    lum = 0.4 + 0.6 * math.sqrt(max(0.0, 1.0 - dist * 1.5))
                    col = th['sclera'] * lum
                    glyph = GLYPH_MID[int(lum * (len(GLYPH_MID) - 1)) % len(GLYPH_MID)]
                elif dist > 0.12 and space_blend < 0.95:
                    norm = (dist - 0.12) / (0.32 - 0.12)
                    ang = math.atan2(zy, zx)
                    pat = (math.sin(ang * 28.0) * 0.5 + 0.5) * math.sin(norm * math.pi)
                    col = (th['iris_b'] * (1 - norm) + th['iris_a'] * norm) * (0.3 + 0.7 * pat)
                    glyph = GLYPH_DENSE[int(pat * (len(GLYPH_DENSE) - 1)) % len(GLYPH_DENSE)]
                else:
                    # Nebula & Deep space heart
                    s_dist = math.hypot(nx, ny)
                    heart = math.exp(-s_dist * 3.5)
                    col = th['space'] + th['cloud_a'] * (1 - heart) * 0.8 + th['heart_deep'] * heart * 1.5
                    glyph = "@" if heart > 0.4 else ("~" if heart > 0.15 else ".")

                col = np.clip(col * 255, 0, 255).astype(np.uint8)
                bgr = (int(col[2]), int(col[1]), int(col[0]))
                cv2.putText(canvas, glyph, (x_pos, y_pos), cv2.FONT_HERSHEY_PLAIN, 0.75, bgr, 1, cv2.LINE_AA)

        # Bottom subtitle (like the video)
        cv2.putText(canvas, th['subtitle'], (20, height - 15), cv2.FONT_HERSHEY_PLAIN, 0.85, (120, 150, 180), 1, cv2.LINE_AA)

        cv2.imshow(title, canvas)
        key = cv2.waitKey(20) & 0xFF
        if key == 27:  # Esc
            break
        elif key == ord('c') or key == ord('C'):
            cv2.destroyAllWindows()
            theme_idx = (theme_idx + 1) % len(THEMES)
        elif key == ord('r') or key == ord('R'):
            start_time = time.time()
        elif key == 32:  # Space
            paused = not paused

    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
