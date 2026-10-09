---
version: alpha
name: Gia-Dinh-University-design-system
description: A mobile-first university product design system aligned to the Gia Dinh University crest. The visual language uses institutional navy as the primary action and content color, warm academic gold as a controlled accent, and cool blue-white surfaces for clarity. Existing typography, spacing, radius, and component geometry are preserved; only color assignments and responsive behavior are redesigned.
colors:
  primary: "#173A67"
  primary-hover: "#102E52"
  primary-active: "#0B2340"
  primary-soft: "#EAF0F7"
  primary-muted: "#C9D6E5"
  accent: "#D8B24F"
  accent-hover: "#C59C35"
  accent-active: "#A98224"
  accent-soft: "#FBF5E5"
  accent-muted: "#E9D69B"
  ink: "#10233D"
  body: "#344A63"
  body-strong: "#173A67"
  muted: "#66788C"
  muted-soft: "#93A1B1"
  hairline: "#DCE4ED"
  hairline-soft: "#EAF0F5"
  hairline-strong: "#BBC9D8"
  canvas: "#F6F8FB"
  canvas-soft: "#FBFCFE"
  canvas-deep: "#0B2340"
  surface-card: "#FFFFFF"
  surface-strong: "#EAF0F7"
  surface-accent: "#FBF5E5"
  surface-dark: "#173A67"
  surface-dark-elevated: "#214A7A"
  on-primary: "#FFFFFF"
  on-accent: "#10233D"
  on-dark: "#FFFFFF"
  on-dark-soft: "#D6E0EB"
  data-blue: "#2F67A5"
  data-blue-soft: "#AFC7E2"
  data-gold: "#D8B24F"
  data-gold-soft: "#E9D69B"
  data-slate: "#71869D"
  semantic-info: "#2563A6"
  semantic-success: "#21835A"
  semantic-warning: "#A66A12"
  semantic-error: "#C23B3B"
typography:
  display-mega:
    fontFamily: "'Waldenburg', 'Times New Roman', serif"
    fontSize: 64px
    fontWeight: 300
    lineHeight: 1.05
    letterSpacing: -1.92px
  display-xl:
    fontFamily: "'Waldenburg', serif"
    fontSize: 48px
    fontWeight: 300
    lineHeight: 1.08
    letterSpacing: -0.96px
  display-lg:
    fontFamily: "'Waldenburg', serif"
    fontSize: 36px
    fontWeight: 300
    lineHeight: 1.17
    letterSpacing: -0.36px
  display-md:
    fontFamily: "'Waldenburg', serif"
    fontSize: 32px
    fontWeight: 300
    lineHeight: 1.13
    letterSpacing: -0.32px
  display-sm:
    fontFamily: "'Waldenburg', serif"
    fontSize: 24px
    fontWeight: 300
    lineHeight: 1.2
    letterSpacing: 0
  title-md:
    fontFamily: "'Inter', sans-serif"
    fontSize: 20px
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: 0
  title-sm:
    fontFamily: "'Inter', sans-serif"
    fontSize: 18px
    fontWeight: 500
    lineHeight: 1.44
    letterSpacing: 0.18px
  body-md:
    fontFamily: "'Inter', sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0.16px
  body-strong:
    fontFamily: "'Inter', sans-serif"
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: 0.16px
  body-sm:
    fontFamily: "'Inter', sans-serif"
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.47
    letterSpacing: 0.15px
  caption:
    fontFamily: "'Inter', sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  caption-uppercase:
    fontFamily: "'Inter', sans-serif"
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0.96px
    textTransform: uppercase
  button:
    fontFamily: "'Inter', sans-serif"
    fontSize: 15px
    fontWeight: 500
    lineHeight: 1.0
    letterSpacing: 0
  nav-link:
    fontFamily: "'Inter', sans-serif"
    fontSize: 15px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0

rounded:
  none: 0px
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  xxl: 24px
  pill: 9999px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  base: 16px
  md: 20px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 96px

components:
  top-nav:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.primary}"
    typography: "{typography.nav-link}"
    height: 64px
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: 10px 20px
    height: 40px
  button-primary-active:
    backgroundColor: "{colors.primary-active}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.pill}"
  button-accent:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: 10px 20px
    height: 40px
  button-accent-active:
    backgroundColor: "{colors.accent-active}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.pill}"
  button-outline:
    backgroundColor: transparent
    textColor: "{colors.primary}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: 9px 19px
    height: 40px
  button-tertiary-text:
    backgroundColor: transparent
    textColor: "{colors.primary}"
    typography: "{typography.button}"
  hero-band:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.display-mega}"
    padding: 96px
  gradient-orb-card:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary}"
    rounded: "{rounded.xxl}"
    padding: 32px
  feature-card:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.title-md}"
    rounded: "{rounded.xl}"
    padding: 24px
  product-card-stack:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xl}"
    padding: 0
  voice-row:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    padding: 12px 0
  voice-icon-circular:
    backgroundColor: "{colors.surface-strong}"
    rounded: "{rounded.full}"
    size: 32px
  pricing-tier-card:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xl}"
    padding: 32px
  pricing-tier-featured:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xl}"
    padding: 32px
  text-input:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 12px 16px
    height: 44px
  badge-pill:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.primary}"
    typography: "{typography.caption-uppercase}"
    rounded: "{rounded.pill}"
    padding: 4px 10px
  cta-band:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.display-lg}"
    padding: 96px
  testimonial-card:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.body}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xl}"
    padding: 32px
  audio-waveform-card:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: 24px
  footer:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.body}"
    typography: "{typography.body-sm}"
    padding: 64px 48px
  footer-link:
    backgroundColor: transparent
    textColor: "{colors.body}"
    typography: "{typography.body-sm}"
---

## Overview
The redesigned system keeps the original typography, spacing, border-radius scale, and component geometry. The visual identity now follows the Gia Dinh University crest: deep institutional navy carries trust, structure, navigation, and primary actions; academic gold provides selective emphasis; cool blue-white surfaces maintain readability for dense event, attendance, timetable, and training-point workflows.

**Color strategy:**
- Navy is the dominant brand and action color.
- Gold is an accent, not the default text color and not the default CTA color.
- White and cool blue-white surfaces keep student and administration screens readable.
- Semantic colors remain distinct from the brand palette so success, warning, and error states are never confused with branding.
- No geometry changes are introduced. Existing radius values, pills, card shapes, spacing, and typography remain intact.

## Color Foundations

### Brand Navy
- **Primary** (`{colors.primary}` — `#173A67`): main CTA, selected navigation, important headings, active icons.
- **Primary Hover** (`{colors.primary-hover}` — `#102E52`): hover state on pointer devices.
- **Primary Active** (`{colors.primary-active}` — `#0B2340`): pressed state and deepest brand surface.
- **Primary Soft** (`{colors.primary-soft}` — `#EAF0F7`): selected rows, filter chips, information panels, subtle institutional backgrounds.
- **Primary Muted** (`{colors.primary-muted}` — `#C9D6E5`): disabled blue controls and passive decorative elements.

### Academic Gold
- **Accent** (`{colors.accent}` — `#D8B24F`): badges, score highlights, active indicators, small decorative rules and selected emphasis.
- **Accent Hover** (`{colors.accent-hover}` — `#C59C35`): hover for the optional gold action variant.
- **Accent Active** (`{colors.accent-active}` — `#A98224`): pressed gold action.
- **Accent Soft** (`{colors.accent-soft}` — `#FBF5E5`): training-point summaries, pending-review panels, highlighted metadata.
- **Accent Muted** (`{colors.accent-muted}` — `#E9D69B`): charts and subdued decorations.

Gold must not be used for long body text on white. Use `{colors.on-accent}` for text placed on a gold fill.

### Surfaces
- **Canvas** (`{colors.canvas}` — `#F6F8FB`): default app background.
- **Canvas Soft** (`{colors.canvas-soft}` — `#FBFCFE`): alternating sections and quiet empty states.
- **Surface Card** (`{colors.surface-card}` — `#FFFFFF`): cards, tables, dialogs and forms.
- **Surface Strong** (`{colors.surface-strong}` — `#EAF0F7`): selected controls and supporting panels.
- **Surface Accent** (`{colors.surface-accent}` — `#FBF5E5`): training-point and review emphasis.
- **Surface Dark** (`{colors.surface-dark}` — `#173A67`): rare hero, footer, projector header or institutional band.
- **Surface Dark Elevated** (`{colors.surface-dark-elevated}` — `#214A7A`): cards placed on a navy surface.

### Text and Borders
- **Ink** (`{colors.ink}` — `#10233D`): main headings and high-emphasis content.
- **Body** (`{colors.body}` — `#344A63`): normal running text.
- **Body Strong** (`{colors.body-strong}` — `#173A67`): labels and emphasized body content.
- **Muted** (`{colors.muted}` — `#66788C`): secondary metadata.
- **Muted Soft** (`{colors.muted-soft}` — `#93A1B1`): placeholders and disabled text.
- **Hairline** (`{colors.hairline}` — `#DCE4ED`): default border and divider.
- **Hairline Strong** (`{colors.hairline-strong}` — `#BBC9D8`): form border and stronger separation.

### Semantic Colors
- **Info** (`{colors.semantic-info}` — `#2563A6`): neutral system guidance.
- **Success** (`{colors.semantic-success}` — `#21835A`): approval, successful registration, valid attendance.
- **Warning** (`{colors.semantic-warning}` — `#A66A12`): waitlist, pending review, deadline warnings.
- **Error** (`{colors.semantic-error}` — `#C23B3B`): validation, cancellation, failed attendance.

Semantic meaning takes precedence over brand color. A successful attendance message uses success green, not navy or gold.

## Component Color Mapping

### Navigation
- Top navigation uses `{colors.surface-card}` with `{colors.primary}` links.
- Active navigation uses `{colors.primary-soft}` as the background and `{colors.primary}` as the label/icon color.
- Mobile navigation drawer uses `{colors.surface-card}`; the selected destination uses the same active treatment.
- Institutional footer or compact mobile bottom navigation may use `{colors.primary}` with `{colors.on-primary}`.

### Buttons
- `button-primary`: navy background, white label.
- `button-primary-active`: deep navy background, white label.
- `button-outline`: transparent background, navy label, strong blue-gray border.
- `button-tertiary-text`: transparent background, navy label.
- `button-accent`: gold background with dark navy text. Use only for one high-emphasis educational or score-related action when a navy primary action is not already present.
- Destructive actions remain semantic error red and must not use gold.

### Cards and Panels
- Default cards remain white with blue-gray hairlines.
- Selected cards use a `primary-soft` background and navy border/icon.
- Training-point summary cards may use `accent-soft` with navy text and gold details.
- Pending review may use `accent-soft` plus semantic warning text.
- Approved state uses semantic success, not gold.
- Dark or featured cards use navy, white text, and restrained gold details.

### Forms
- Inputs use white fill, ink text, and `hairline-strong` border.
- Focus uses a navy border and a subtle primary-soft focus ring.
- Selected checkbox/radio/switch uses navy.
- Validation uses semantic success/error colors.
- Placeholder uses `muted-soft`.

### Tables and Data
- Table headers use `primary-soft` with navy labels for normal product screens.
- A compact institutional report may use navy headers with white labels.
- Selected rows use `primary-soft`.
- Hover rows use `canvas-soft` and only apply on hover-capable devices.
- Charts prioritize navy, data blue, gold, gold-soft, and slate in that order.
- Gold should highlight one series or benchmark, not every series.

### Role and Status Mapping
- **Admin:** navy-dark emphasis.
- **Mode:** standard primary navy emphasis.
- **Sinh viên:** primary-soft surfaces with navy labels.
- **Pending approval / waitlist:** accent-soft surface with warning text.
- **Public / checked in / approved:** semantic success.
- **Cancelled / rejected / invalid:** semantic error.

Role colors are navigational aids only. Status colors must always use semantic meanings.

## Typography, Radius and Spacing
Typography, radius, and spacing remain unchanged from the source design system. Do not modify type families, font weights, size scale, pill geometry, card radius, input radius, or the 4px spacing base as part of this redesign.

## Mobile-First Responsive System

### Principle
The base styles target a narrow mobile viewport first. Media queries only add layout capacity. Do not define a desktop layout and then override it downward.

### Breakpoints
- **Base / mobile:** `0px` and above.
- **Small:** `480px` and above.
- **Tablet:** `640px` and above.
- **Desktop:** `1024px` and above.
- **Wide:** `1280px` and above. Content remains capped at approximately `1200px`.

### Base Mobile Rules
- Page horizontal padding: `16px`.
- Section vertical padding: `48px`.
- Header height: `56px`.
- All primary form controls and important tap targets: minimum `44px` height.
- Content uses one column by default.
- Cards, filters, forms, statistics and action groups stack vertically.
- Primary actions become full width when space is constrained.
- Secondary actions either become full width under the primary action or remain icon actions when meaning stays clear.
- Tables do not shrink text below the current type tokens. Use horizontal scrolling, responsive cards, or hide nonessential columns.
- Dialogs use the viewport width minus `32px`; bottom sheets are preferred for short mobile actions.
- Navigation uses a hamburger drawer or an app-specific bottom navigation. Desktop horizontal navigation is not rendered by default.

### Small, 480px and Above
- Page horizontal padding increases to `20px`.
- Two compact statistics may share a row when each remains readable.
- Paired buttons may return to intrinsic width if enough room exists.
- Event metadata may use two columns for short fields.

### Tablet, 640px and Above
- Page horizontal padding: `24px`.
- Section vertical padding: `64px`.
- Feature and event cards may use a two-column grid.
- Forms may use two columns for related short fields, while descriptions and rich text remain full width.
- Side panels remain overlays unless persistent space is clearly available.
- Hero display can scale from mobile `32px` to `48px` without changing font family or weight.

### Desktop, 1024px and Above
- Page horizontal padding: `32px`.
- Section vertical padding returns to the original `96px` rhythm.
- Main navigation becomes horizontal.
- Feature grids can use three columns.
- Dashboards may use a persistent sidebar and multi-column content.
- Forms can use two or three columns according to field length.
- Hero display returns to the original `64px` token.
- Hover states become available only inside `@media (hover: hover)`.

### Wide, 1280px and Above
- The main content container is capped at approximately `1200px` and centered.
- Additional viewport width becomes outer whitespace, not wider text lines.
- Dashboard data density may increase, but body copy width stays readable.

## Responsive Component Behavior

### Top Navigation
- Base: 56px header, logo mark or compact horizontal logo, hamburger trigger, optional single primary action.
- Tablet: retain compact navigation unless all items fit without wrapping.
- Desktop: 64px header with full horizontal navigation and right-aligned actions.

### Event Card Grid
- Base: one card per row.
- Tablet: two cards per row.
- Desktop: three cards per row.
- Card internal spacing and radius do not change.

### Filters
- Base: most important filter visible; remaining filters open in a bottom sheet or stacked panel.
- Tablet: filters may wrap into two rows.
- Desktop: filters appear inline when space permits.
- Active filters use primary-soft backgrounds and navy labels.

### Timetable
- Base: default to agenda/list view. A horizontal day strip may remain visible.
- Tablet: allow a reduced weekly grid.
- Desktop: show the full timetable grid.
- Never compress time labels or session content until unreadable.

### Data Tables
- Base: use a scroll container with sticky first column/header, or render each row as a labeled card.
- Tablet: restore priority columns.
- Desktop: show the complete table.
- Export controls remain accessible outside the horizontal scroll region.

### Forms
- Base: one field per row, full-width inputs and actions.
- Tablet: related short fields may form two columns.
- Desktop: use the existing form width and column structure.
- Validation messages remain directly under the related field at every breakpoint.

### Dialogs and Confirmations
- Base: width `calc(100vw - 32px)` and action buttons stacked when necessary.
- Tablet and desktop: use the existing modal width and inline actions.
- Important details such as event name, time, seat number, waitlist position and cancellation deadline remain visible without horizontal scrolling.

### Dashboard and Role Shells
- Base: no persistent sidebar; use drawer navigation or bottom navigation.
- Tablet: optional collapsible rail.
- Desktop: persistent sidebar is permitted.
- Admin, Mode and Sinh viên preserve the same color foundation. Role differences come from navigation and available actions, not entirely different themes.

## CSS Mobile-First Reference

```css
:root {
  --color-primary: #173a67;
  --color-primary-hover: #102e52;
  --color-primary-active: #0b2340;
  --color-primary-soft: #eaf0f7;
  --color-accent: #d8b24f;
  --color-accent-soft: #fbf5e5;
  --color-canvas: #f6f8fb;
  --color-surface: #ffffff;
  --color-ink: #10233d;
  --color-body: #344a63;
  --color-muted: #66788c;
  --color-border: #dce4ed;
  --page-padding: 16px;
  --section-padding-block: 48px;
}

.container {
  width: min(100%, 1200px);
  margin-inline: auto;
  padding-inline: var(--page-padding);
}

.responsive-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
}

.action-group {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
}

@media (min-width: 480px) {
  :root { --page-padding: 20px; }
  .action-group { grid-template-columns: repeat(2, minmax(0, max-content)); }
}

@media (min-width: 640px) {
  :root {
    --page-padding: 24px;
    --section-padding-block: 64px;
  }
  .responsive-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (min-width: 1024px) {
  :root {
    --page-padding: 32px;
    --section-padding-block: 96px;
  }
  .responsive-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

@media (hover: hover) {
  .button-primary:hover { background: var(--color-primary-hover); }
}
```

## Accessibility and Color Usage
- Never communicate state through color alone. Pair color with text, an icon, or a status label.
- Use white text on navy primary buttons.
- Use dark navy text on gold buttons, chips, and highlighted surfaces.
- Do not use gold for normal body text on white.
- Preserve visible keyboard focus using a navy focus indicator plus sufficient offset.
- Disabled states use muted text and primary-muted or neutral borders, not reduced opacity alone.
- User-generated event banners must not be the only source of text contrast; place text on a defined surface or overlay.

## Do's and Don'ts

### Do
- Use navy for primary actions, selected navigation and important headings.
- Use gold selectively for academic emphasis, points, badges and restrained decorative details.
- Keep cards predominantly white and app backgrounds cool blue-white.
- Start every layout at mobile width and add columns upward.
- Keep touch targets at least 44px high on mobile.
- Use semantic colors for real state messages.

### Don't
- Do not fill every card, heading, button and icon with gold.
- Do not use gold text on white for important information.
- Do not create separate unrelated color themes for Admin, Mode and Sinh viên.
- Do not hide essential actions inside horizontal tables on mobile.
- Do not reduce typography or touch targets merely to preserve a desktop layout.
- Do not change radius, typography or spacing tokens as part of this color and responsive redesign.

## Migration Checklist
1. Replace old neutral primary references with `{colors.primary}`.
2. Replace pastel atmospheric gradients with navy/gold data or decorative tokens.
3. Map selected, active and focus surfaces to `{colors.primary-soft}`.
4. Map training-point emphasis to `{colors.accent-soft}` and `{colors.accent}`.
5. Keep semantic success, warning and error independent from the brand palette.
6. Make base component layouts single-column and width-safe.
7. Add layout enhancements at `480px`, `640px`, `1024px` and `1280px`.
8. Test navigation, timetable, tables, forms, dialogs and event cards at `320px`, `360px`, `390px`, `768px`, `1024px` and `1440px`.
9. Test keyboard focus and color contrast after token migration.
10. Confirm no radius, typography or spacing changes were introduced.
