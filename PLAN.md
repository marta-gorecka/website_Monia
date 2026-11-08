# Image Optimisation Plan

Goal: make the portfolio load faster by shrinking the images it serves. Nothing below has been done yet.

## Current state (measured 2026-11-08)

- **Grid thumbnails + profile picture: ~62 MB** for the first page view. The lazy-loader in `script.js` only delays them until they're scrolled into view; it doesn't make them smaller.
- **Full-size "merged" images opened in the modal: ~147 MB** in total, each one loaded on click.
- The images are print-resolution exports (mostly 3508 px wide = A4 at 300 dpi). The grid shows them at roughly 300–500 px wide.
- The git pack is ~460 MB. GitHub Pages recommends repos stay under 1 GB.

### Worst offenders

| File | Used as | Size | Pixels | Problem |
|---|---|---|---|---|
| `projects/merged/50-__merged.jpg` | modal | 66.2 MB | 3000×12000 | It's a **PNG** with a `.jpg` name |
| `projects/thumbnails/my_place_thumbnail.jpg` | grid | 31.7 MB | 7016×4961 | It's a **PNG** with a `.jpg` name; 7000 px wide for a thumbnail |
| `projects/compressed/bosozoku/Bosozoku.jpg` | grid | 11.8 MB | 17716×11811 | 209-megapixel image used as a thumbnail |
| `projects/merged/clothes_merged.jpg` | modal | 12.1 MB | 3508×29340 | Very tall: ~400 MB of memory once decoded |
| `projects/merged/gems_merged.jpg` | modal | 11.7 MB | 3508×29766 | Same as above |
| `projects/merged/colours_merged.jpg` | modal | 11.0 MB | 3508×39688 | Same; mobile Safari may refuse to render it or downscale it |
| `projects/merged/my_place_merged.jpg` | modal | 9.8 MB | 2480×24552 | Same |
| `projects/merged/food_merged.jpg` | modal | 9.5 MB | 3508×24805 | Same |
| `projects/thumbnails/Belarus_Congo_Poland 2.jpg` | grid | 2.8 MB | 2710×2636 | Too large for a thumbnail |
| All other thumbnails | grid | 0.4–1.7 MB each | 1750–4970 px wide | Too large for a thumbnail |

## Improvements

### 1. Resize and recompress thumbnails (biggest win for first load)
- Resize every grid image to **800 px wide**, plus a **1600 px** version for retina screens.
- Export as JPEG at quality ~80, or as WebP. Target **≤150 KB each**.
- Make a real thumbnail for Bosozoku in `projects/thumbnails/` and point `index.html:142` at it. It currently points to the 17716 px original in `compressed/`.
- Expected result: grid drops from **~62 MB to ~2–3 MB**.

### 2. Convert the PNGs that are named `.jpg`
- `50-__merged.jpg` and `my_place_thumbnail.jpg` are PNG files. Re-encode them as real JPEG or WebP.
- Expected result: 66 MB to ~2–4 MB, and 32 MB to ~150 KB (after the resize in step 1).

### 3. Shrink the full-size modal images
- Cap the width at **~1600–2000 px**. That's plenty for a screen, even a retina laptop.
- Use JPEG quality ~80 or WebP quality ~75. Target **≤1–2 MB per image**.
- The very tall images (>15000 px tall) need extra thought: clothes, gems, colours, food, my_place, Bosozoku, animation.
  - Option A: split them back into separate images and show them in a scrollable modal or gallery.
  - Option B: keep one image, but at ≤2000 px wide it's still ~16–23k px tall. Mobile browsers handle that badly, so splitting (A) is better.
- Expected result: modal images drop from **~147 MB to ~15–25 MB**, and no single click downloads more than ~2 MB.

### 4. Serve responsive images in `index.html`
- Add `srcset`/`sizes` (or `<picture>` with WebP and a JPEG fallback) so phones download the 800 px version and retina desktops the 1600 px one.
- Add `width`/`height` attributes to the `<img>` tags. This stops the layout jumping while images load.
- You could swap the custom `IntersectionObserver` lazy-loader for native `loading="lazy"` with `decoding="async"`. It's simpler, and it still works when JS is off.

### 5. Profile picture
- `projects/profile_picture.jpg` is 1200×1600 and 168 KB. Resize it to ~600 px wide (~50 KB). A small win.

### 6. Fix the broken background image
- `styles.css:24` references `projects/animation_page-0002.jpg`, which doesn't exist (404). Either add an optimised version (≤1920 px wide, ≤300 KB) or remove the rule.

### 7. Clean up the repo
- `projects/compressed/` (158 MB) and `projects/merged/` contain many large originals that the site never references. Move unused originals out of the repo, or into the git-ignored `projects/ignore/` folder, so deploys stay small.
- There are duplicate files, e.g. `Balarus_Congo_Poland.jpg` is in both `compressed/50-__/` and `thumbnails/`, and `3.jpg`, `4.jpg`, `7.jpg` are identical in `merged/` and `thumbnails/`.
- Optional: rename files that have spaces in their names (`one day korea/`, `Belarus_Congo_Poland 2.jpg`, `my place/`) to avoid URL-encoding problems.
- Note: removing files won't shrink the existing git history (460 MB). Rewriting history (e.g. `git filter-repo`) is a separate, destructive step that would need its own decision.

### 8. Keep originals safe
- Keep the full-resolution print originals outside the website folder (or in the git-ignored `projects/ignore/`). The site should only contain web-sized copies.

## Tools
- Built in on macOS: `sips`. It can resize and convert to JPEG, e.g. `sips -Z 1600 -s format jpeg -s formatOptions 80 in.jpg --out out.jpg`.
- For WebP: `brew install webp` (`cwebp`) or `brew install imagemagick`.
- GUI option: [Squoosh](https://squoosh.app) or ImageOptim.

## Expected outcome
| | Now | After |
|---|---|---|
| Grid images (initial view) | ~62 MB | ~2–3 MB |
| All modal images | ~147 MB | ~15–25 MB |
| Largest single file | 66 MB | ~2 MB |

## Status (2026-11-08)
- [x] 1. Thumbnails resized to 1000 px wide, JPEG q80. Bosozoku and 50-__ now have real thumbnails in `projects/thumbnails/`.
- [x] 2. The two fake-`.jpg` PNGs re-encoded as real JPEGs (they had no real transparency).
- [x] 3. Modal images capped at 1600 px wide (the modal shows them at ≤ ~600 px). Tall images were **not** split, to keep the modal looking the same.
- [~] 4. Skipped `srcset`/`<picture>`/width-height attributes: a single 1000 px thumbnail already covers retina screens, and the existing lazy-loader was kept as-is.
- [x] 5. Profile picture resized to 450×600 (shown at 150 px).
- [ ] 6. Not done: the missing background image in `styles.css:24` was left alone, so the styling doesn't change.
- [x] 7. Unused and duplicate images deleted; `projects/compressed/` removed; files with spaces renamed. Git history was **not** rewritten.
- [x] 8. All originals backed up in `projects/ignore/originals/` (git-ignored, local only).

Result: grid ~62 MB → ~2.4 MB; all modal images ~147 MB → ~17 MB; largest file 66 MB → 2.3 MB.
