# Purelane &mdash; Shopify Dawn Production Sections

This codebase converts the standalone prototype (`purelane-homepage.html`) into modular, merchant-editable Shopify Online Store 2.0 sections, snippets, and assets engineered for Shopify's official **Dawn** theme.

---

## 📁 Repository Architecture

```
d:/Example/
├── assets/
│   ├── purelane-theme.css             # Scoped design tokens, glassmorphism, responsive typography & layout
│   └── purelane-sections.js           # Theme Editor lifecycle aware JS (Hero stage, rotator, reveals, AJAX cart)
├── sections/
│   ├── purelane-hero.liquid           # [01] Hero Section (1->2->3 Stage, live price flag, value badges)
│   ├── purelane-shop.liquid           # [02] Shop / Product Grid (Native collection, responsive 2/4 col shelf)
│   ├── purelane-combos.liquid         # [03] Best-Selling Combos (Swipeable tray, multi-product stack, savings)
│   ├── purelane-bundles.liquid        # [04] Bundles Builder (3-Tier pricing cards, calculated per-item cost)
│   ├── purelane-reviews.liquid        # [05] Reviews Rail (Infinite horizontal marquee, aggregate star badge)
│   ├── purelane-announcement.liquid   # [BONUS] Infinite scrolling announcement ticker
│   ├── purelane-ingredients.liquid    # [BONUS] Sourced from Nature 5-col botanical grid with vector art
│   ├── purelane-pillars.liquid        # [BONUS] 3 Glass value pillars ("Less scrubbing", "Clean ingredients")
│   ├── purelane-proof.liquid          # [BONUS] Why it works with live product rotator + 4 stat rings
│   ├── purelane-range.liquid          # [BONUS] Full shelf product ribbon
│   ├── purelane-bundle-benefits.liquid# [BONUS] Why bundles beat single items (4 benefit tiles)
│   ├── purelane-bundle-categories.liquid# [BONUS] 4 Bundle category cards
│   ├── purelane-trust-bar.liquid      # [BONUS] 4 Trust badges (Plant derived, Recyclable, Safe, Made in India)
│   ├── purelane-newsletter.liquid     # [BONUS] Join Purelane Club email capture
│   └── purelane-sticky-cta.liquid     # [BONUS] Mobile bottom floating CTA
├── snippets/
│   ├── purelane-card-product.liquid   # Reusable product card (handles sold-out, no-image, long titles, AJAX cart)
│   ├── purelane-icons.liquid          # Optimized SVG sprite snippet (brand mark, badges, checkmarks, bottle art)
│   ├── purelane-price.liquid          # Native Shopify currency formatter with compare-at badge and discounts
│   └── purelane-background.liquid     # Layered water caustics, SVG turbulence filters, animated bubbles & vignette
├── templates/
│   └── index.json                     # OS 2.0 homepage template wiring all sections with default presets
├── locales/
│   └── en.default.json                # Internationalization strings for UI text and labels
├── seed/
│   ├── products_seed.csv              # Shopify standard product import CSV ready for 1-click import
│   └── products_seed.json             # Seed products metadata catalog
└── README.md                          # Full developer & merchant documentation
```

---

## 🎯 The Five Core Template Sections

### 1. Hero (`sections/purelane-hero.liquid`)
- **Visual Accuracy**: Matches prototype layout, typography (`Outfit` + `Inter`), price tag flags, and badge rail on desktop / badge strip on mobile.
- **Dynamic 1 → 2 → 3 Product Stage**:
  - Automatically transitions between 1 bottle, 2 bottles, and 3-bottle combo bundles with smooth translateY/scale transitions.
  - Interactive dot controls allow jumping between tiers.
  - Pauses rotation on mouse hover and resumes when mouse leaves.
- **Merchant Controls**:
  - Full schema to edit headline line 1, line 2, accent word, lede paragraph, primary/secondary buttons.
  - Slide blocks with customizable tier labels, prices, original prices, savings pills, and image pickers.
  - Customizable rotation interval (2000ms to 8000ms).

### 2. Shop / Product Grid (`sections/purelane-shop.liquid`)
- **Native Shopify Data**: Connects directly to any Shopify collection selected by the merchant via the Theme Editor.
- **Responsive Shelf Grid**: 2 columns on mobile (375px+), scaling smoothly to 4 columns on desktop (860px+).
- **Reusable Card Snippet** (`snippets/purelane-card-product.liquid`):
  - **Edge Case 1 &mdash; Sold Out**: Disables the Add to Cart button and adds a distinct "Sold Out" badge.
  - **Edge Case 2 &mdash; Missing Image**: Automatically renders an elegant branded SVG bottle graphic (`purelane-icons.liquid`).
  - **Edge Case 3 &mdash; Extra Long Title**: Uses CSS multi-line clamping (`-webkit-line-clamp: 2`) with fixed minimum container heights to prevent vertical card misalignment across rows.
  - **Native AJAX Cart**: Form submits asynchronously with live button state feedback (`Adding...` → `Added ✓`) and triggers Dawn's cart counter / cart drawer.

### 3. Best-Selling Combos (`sections/purelane-combos.liquid`)
- **Swipeable Combo Rail**: Smooth horizontal scrolling with CSS `scroll-snap-type: x mandatory` and hidden scrollbars.
- **Multi-Product Visual Stacks**: Renders stacked product images with benefit captions separated by styled `+` signs.
- **Top Tray Savings**: Customizable savings pill (`You save ₹398`), featured value flag (`Most popular`, `Best value`), dual pricing, and CTA.
- **Merchant Customization**: Blocks allow adding, reordering, or modifying combos, pricing, product notes, and links.

### 4. Bundles Builder (`sections/purelane-bundles.liquid`)
- **3-Tier Pricing Architecture**:
  - *Starter*: 2 Products @ ₹349 (Flat ₹174/item)
  - *Most Popular*: 3 Products @ ₹499 (Flat ₹166/item) &mdash; highlighted with golden amber border and inset glass glow
  - *Whole Home*: 5 Products @ ₹799 (Flat ₹160/item) &mdash; 5-item thumbnail row
- **Feature Checklist**: Clean SVG checkmarks highlighting key bundle benefits.
- **Merchant Customization**: Change tier name, quantity number, pricing, unit price notes, feature bullet points (one per line), and CTA destination.

### 5. Reviews Rail (`sections/purelane-reviews.liquid`)
- **Infinite Smooth Marquee**: Seamless horizontal infinite loop with CSS hardware-accelerated transforms (`translate3d`).
- **Gradient Fade Masks**: Edge gradient fade on desktop for polished visual depth.
- **Aggregate Rating Header**: Configurable average star rating (e.g. `★ 4.8 from 8,000+ reviews`) and social proof badge (`Loved by 12 lakh+ homes`).
- **Accessibility**: Automatically pauses animation on hover or when an element receives keyboard focus (`:focus-within`).

---

## ⚡ Technical Highlights

### 1. Theme Editor Lifecycle Awareness
In standard JavaScript, reordering or editing sections in the Shopify Theme Editor can break `setInterval` timers or event listeners. `assets/purelane-sections.js` listens to:
- `shopify:section:load` &mdash; Reinitializes reveals, AJAX forms, hero stage, and rotator.
- `shopify:section:unload` &mdash; Cleans up active intervals and memory references.
- `shopify:block:select` &mdash; Automatically jumps the hero stage or rotator to the specific block selected in the merchant admin.

### 2. Core Web Vitals & Performance
- **Zero Heavy Frameworks**: 100% Vanilla JS and Vanilla CSS.
- **Image Optimization**: Uses Shopify's `image_url` with responsive `srcset` and `sizes` attributes.
- **Layout Shift Prevention**: All cards and product shots have explicit aspect ratios and clamp constraints.
- **IntersectionObserver**: Lazy execution of timers and scroll reveals; only runs animations when elements enter the viewport.

### 3. Accessibility & Motion Preference
- High contrast compliant typography with dark purple `#17102b` headings on pale mint grounds.
- Full support for `prefers-reduced-motion: reduce`: instantly displays all content in place without transitions and disables infinite marquee and caustic wave animations.
- Complete ARIA labels on all icon buttons, ratings, and form elements.

---

## 📦 Store Seeding Instructions (8+ Products)

To seed your Dawn development store:
1. In your Shopify Admin, navigate to **Products**.
2. Click **Import** in the top right.
3. Select [products_seed.csv](file:///d:/Example/seed/products_seed.csv).
4. Click **Upload and preview**, then click **Import products**.

### Seed Products Overview
| Product Handle | Title | Price | Compare At | Special Condition / Edge Case Tested |
| :--- | :--- | :--- | :--- | :--- |
| `purelane-tap-cleaner` | Purelane Tap Cleaner & Limescale Remover | ₹200 | ₹299 | In stock, bestseller |
| `purelane-foaming-kitchen-cleaner` | Purelane Foaming Kitchen Cleaner | ₹200 | ₹299 | In stock, bestseller |
| `purelane-copper-brass-cleaner` | Purelane Copper, Bronze & Brass Cleaner | ₹200 | ₹299 | In stock |
| `purelane-washing-machine-cleaner` | Purelane Washing Machine Cleaner Tablets | ₹200 | ₹299 | In stock |
| `purelane-floor-cleaner-long-title` | Purelane Natural Herbal Floor Cleaner with Concentrated Neem... | ₹200 | ₹299 | **Edge Case: Extra Long Title** (2-line clamp test) |
| `purelane-liquid-handwash-soldout` | Purelane Organic Gentle Hydrating Liquid Handwash | ₹180 | ₹250 | **Edge Case: Sold Out** (0 inventory, disabled button) |
| `purelane-laundry-detergent-no-image` | Purelane Zero-Residue Concentrated Laundry Detergent | ₹220 | ₹320 | **Edge Case: Missing Image** (Vector SVG fallback) |
| `purelane-magic-eraser` | Purelane Magic Stain Eraser High-Density Pads | ₹150 | ₹220 | In stock accessory |
