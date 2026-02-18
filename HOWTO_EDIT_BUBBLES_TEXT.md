# How to edit the big text blocks in `bubbles`

This guide explains **exactly where** to change text size, font, spacing, and margins for the large text blocks in the bubbles page.

> Main file to edit: `bubbles.html` (look inside the `<style>` block near the top).
>
> If you are using the alternate version, do the same edits in `bubbles2.html`.

---

## 1) Where the typography lives

Open:
- `bubbles.html`

Most text styling is in CSS selectors inside the `<style>` tag.

### The key selectors

- `.page-title h1` → the **main top title** (“Opera & Bubbles: Audition edition”)
- `.page-title p` → the subtitle below it
- `.hero__title` → the big section headings (the “big texts” in each content block)
- `.intro-section__subheading` → medium-large subsection headings (“The Experience”, “About the Music”)
- `.hero__body` → paragraph/list body text inside each block
- `.hero__body p`, `.hero__body li`, `.hero__body ol` → paragraph and list spacing
- `.hero` and `.hero__content` → container spacing around text blocks

---

## 2) What to change for size, font, and margins

Below are the properties you will edit most often.

## A) Font family (typeface)

Change these to pick your fonts:

- `body { font-family: ... }` → default font for paragraph text
- `.hero__title { font-family: ... }` → section heading font
- `.page-title h1 { font-family: ... }` → top heading font
- `.intro-section__subheading { font-family: ... }` → subsection heading font

If you add a new webfont, add/update the `<link>` lines in `<head>` first.

## B) Text size

Use these properties:

- `.hero__title { font-size: ... }`
- `.page-title h1 { font-size: ... }`
- `.page-title p { font-size: ... }`
- `.intro-section__subheading { font-size: ... }`
- `.hero__body { font-size: ... }`

### Why `clamp(...)` is used

Many sizes use `clamp(min, preferred, max)` so text scales fluidly by screen width.

Example:

```css
.hero__title {
  font-size: clamp(2.4rem, 6vw, 4.5rem);
}
```

- `2.4rem` = minimum size on small screens
- `6vw` = responsive scaling
- `4.5rem` = maximum size on large screens

If text is too big/small everywhere, adjust min and max.
If it is only weird on very large/small screens, adjust the middle `vw` value.

## C) Font weight (thickness)

Adjust:

- `.hero__title { font-weight: ... }`
- `.page-title h1 { font-weight: ... }`
- `.hero__body { ... }` (or rely on `body` weight)

Common values: `400` regular, `600` semibold, `700` bold.

## D) Line height (vertical breathing room)

Adjust:

- `.hero__title { line-height: ... }`
- `.hero__body { line-height: ... }`
- `.page-title h1 { line-height: ... }`

Typical ranges:
- headings: `1.05`–`1.2`
- paragraph text: `1.5`–`1.9`

## E) Margins and spacing between text elements

Most useful rules:

- `.hero__title { margin: 0 0 1.5rem; }`
- `.hero__body p { margin: 0 0 1rem; }`
- `.hero__body li { margin-bottom: 0.9rem; }`
- `.intro-section__subheading { margin: 1.4rem 0 0.75rem; }`
- `.page-title { padding: ... }`

Increase bottom margins for more vertical space.
Reduce margins to make blocks tighter.

## F) Left/right padding around each full text block

The block wrapper is `.hero`:

```css
.hero {
  padding: clamp(2rem, 6vw, 5rem) clamp(1.2rem, 4vw, 4rem);
}
```

- first clamp = top/bottom padding
- second clamp = left/right padding

If you want more space from screen edges, increase the second clamp values.

## G) Width of the text column

Text width is controlled here:

```css
.hero__content {
  width: min(560px, 100%);
}
```

Increase `560px` if text column feels too narrow.
Decrease it if lines feel too long.

---

## 3) Quick “recipes”

## Make all big section headings bigger

Edit `.hero__title`:

```css
.hero__title {
  font-size: clamp(2.8rem, 7vw, 5rem);
}
```

## Make body text easier to read

Edit `.hero__body`:

```css
.hero__body {
  font-size: calc(clamp(1.05rem, 2.3vw, 1.2rem) + 2px);
  line-height: 1.85;
}
```

## Add more spacing between paragraphs

Edit `.hero__body p`:

```css
.hero__body p {
  margin: 0 0 1.3rem;
}
```

## Make top title stand out more

Edit `.page-title h1`:

```css
.page-title h1 {
  font-size: clamp(2.6rem, 7vw, 5rem);
  letter-spacing: 0.02em;
}
```

---

## 4) Mobile-specific adjustments

There is already a mobile media query:

```css
@media (max-width: 900px) {
  ...
}
```

If text is great on desktop but too large on phones, add overrides there.

Example:

```css
@media (max-width: 900px) {
  .hero__title {
    font-size: clamp(2rem, 8vw, 3rem);
  }

  .hero__body {
    font-size: 1.05rem;
    line-height: 1.7;
  }
}
```

---

## 5) Difference between `bubbles.html` and `bubbles2.html`

Both files use almost the same structure/selectors.
Main differences are the font imports and font-family choices.

So if you tweak size/margins in one file and want consistent behavior, copy the same selector edits into the other file.

---

## 6) Safe editing workflow (recommended)

1. Open `bubbles.html`.
2. Find the selector you want (for example `.hero__title`).
3. Change **one property at a time** (size, then margin, then line-height).
4. Refresh browser and compare desktop + mobile width.
5. Repeat with `bubbles2.html` if you use that page too.

Tip: keep a small changelog comment while tuning values.

```css
/* 2026-02-18: increased heading max size from 4.5rem to 5rem */
```

---

## 7) If you want full theme-level control later

For easier global tuning, you can move text sizes into CSS variables in `:root`, for example:

```css
:root {
  --heading-size: clamp(2.4rem, 6vw, 4.5rem);
  --body-size: calc(clamp(1rem, 2.1vw, 1.12rem) + 2px);
}

.hero__title { font-size: var(--heading-size); }
.hero__body  { font-size: var(--body-size); }
```

Then future typography changes require editing only the variables.

---

If you want, next step I can also prepare a **preset pack** (Elegant / Bold / Minimal) with ready-to-paste CSS values so you can switch visual style quickly.
