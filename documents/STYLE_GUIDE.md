# Texas AI Consulting - Style Guide

This document outlines the design system, color palette, typography, and component styles used in the Texas AI Consulting "Interactive 3D" web application.

## 1. Color Palette

The application uses a high-contrast dark theme with premium accents (Gold and Blue) to convey a modern, tech-forward aesthetic.

### Primary Colors
| Color Name | Hex Code | Usage |
|:--- |:--- |:--- |
| **Texas Gold** | `#ebcb4c` | Primary accent, Headers, Borders, Shadows, Glow effects, "TEXAS AI" logo text |
| **Deep Navy Blue** | `#043b68` | "CONSULTING" logo text |
| **Tech Blue** | `#2c75ff` | Hover states, Secondary accents, Links |
| **Cyan Slate** | `#6c97a5` | Labels, Secondary text info |

### Backgrounds & Surfaces
| Color Name | Hex Code / Class | Usage |
|:--- |:--- |:--- |
| **Deep Space** | Gradient: `black` to `gray-800` | Main page background |
| **Glass Navy** | `#0e2042` (70% opacity) | Navigation buttons (Blog link) |
| **Glass Dark** | `gray-900` (90-95% opacity) | Modals, Cards, Forms |
| **Input Dark** | `gray-800` | Form input fields |

### Text Colors
| Color Name | Hex Code | Usage |
|:--- |:--- |:--- |
| **Pure White** | `#ffffff` | Body text, Input text |
| **Muted Gray** | `gray-300` | Footer links, secondary info |
| **Gold** | `#ebcb4c` | Highlighted headers, Active states |

---

## 2. Typography

The application uses a mix of Monospace for technical details and Arial Black/Bold for impactful headers.

### Font Families
- **Primary Headers**: `Arial Black`, `Arial Bold`, `sans-serif`
  - *Usage*: "OUR PRODUCTS", "CONTACT US", Form Labels ("NAME", "EMAIL")
  - *Characteristics*: Often Uppercase, Italic, Bold, Tracking-wider.
- **Body / Technical**: `Space Mono` (Google Font)
  - *Usage*: Detail text, descriptions, "Interactive 3D" subtitle.
  - *Variable*: `var(--font-space-mono)`

### Custom Text Styles
- **.font-hesdeadjim**:
  - CSS Class defined in `global.css`
  - Properties: `Arial, sans-serif`, `bold`, `italic`, `uppercase`, `letter-spacing: 1px`.

### Logo Typography
The Texas AI Consulting logo uses two distinct font and color pairings:

| Text | Font | Color | Hex Code |
|:--- |:--- |:--- |:--- |
| **TEXAS AI** | `He'sdeadjim` | Texas Gold | `#ebcb4c` |
| **CONSULTING** | `Atures 700 PERSONAL USE ONLY` | Deep Navy Blue | `#043b68` |

- **"TEXAS AI"**: Rendered in the **He'sdeadjim** display font using the brand's signature **Texas Gold** (`#ebcb4c`) yellow.
- **"CONSULTING"**: Rendered in the **Atures 700 PERSONAL USE ONLY** font using **Deep Navy Blue** (`#043b68`).

---

## 3. UI Components & Elements

### Buttons

#### 1. Blog Navigation Button
A prominent, stylized button used to navigate to the blog options.
**Visual Description**:
- **Shape**: Rectangular with a specialized clip-path (angled bottom-right corner) giving it a futuristic "data-pad" look.
- **Colors**:
  - **Text**: Bright Yellow/Gold (`#ffcc00`) which turns to Tech Blue (`#2c75ff`) on hover.
  - **Background**: Translucent Deep Navy (`#0e2042` at 70% opacity), allowing the background to show through slightly.
  - **Border**: 2px solid Gold border that changes to Blue on hover.
- **Effects**:
  - **Glow**: A subtle gold box-shadow (`0 0 15px`) and text-shadow (`0 0 5px`) to make it appear illuminated.
  - **Animation**: `border-pulse` creates a rhythmic pulsing effect on the border.

**CSS Classes**:
```css
/* Base Classes */
relative font-medium transition-all duration-300 font-hesdeadjim text-lg uppercase tracking-wider px-6 py-3
text-[#ffcc00] hover:text-[#2c75ff]
bg-[#0e2042]/70
border-2 border-[#ffcc00] hover:border-[#2c75ff]

/* Inline Styles */
clip-path: polygon(0 0, 100% 0, 95% 100%, 5% 100%);
text-shadow: 0 0 5px rgba(255, 204, 0, 0.7);
box-shadow: 0 0 15px rgba(255, 204, 0, 0.4);
animation: border-pulse 3s infinite;
```

#### 2. Submit Button (Form)
The primary action button for forms.
**Visual Description**:
- **Shape**: Standard rectangular button with slightly rounded corners (`rounded-md`).
- **Colors**:
  - **Background**: Solid Gold (`#ebcb4c`), creating a strong call-to-action against the dark form background.
  - **Text**: Dark Gray/Black (`text-gray-900`) for high contrast and readability.
- **Interaction**:
  - **Hover**: Background opacity drops slightly (`hover:bg-opacity-80`) and the button scales up (`scale-105`) to invite clicking.
  - **Click**: Scales down (`scale-95`) to provide tactile feedback.
  - **Loading**: Displays a spinning circle icon and "SENDING..." text when processing.

**CSS Classes**:
```css
/* Base Classes */
hover:bg-opacity-80
text-gray-900 font-bold
py-3 px-6 rounded-md
focus:outline-none focus:shadow-outline
w-full
transition-all duration-300
transform hover:scale-105 active:scale-95
shadow-[0_0_10px_rgba(235,203,76,0.3)]
```

#### 3. Close Button (Icon)
Used for dismissing modals and cards.
**Visual Description**:
- **Icon**: A simple "X" mark (SVG).
- **Colors**: Gold (`#ebcb4c`) by default, turning White on hover.
- **Interaction**: Rotates 90 degrees (`hover:rotate-90`) when hovered, adding a playful, mechanical feel.

**CSS Classes**:
```css
text-[#ebcb4c] hover:text-white
transition-colors
transform
hover:rotate-90
duration-300
```

### Forms (Input Fields)
- **Background**: `bg-gray-800`
- **Border**: `border-gray-700` (2px)
- **Focus State**: `focus:border-[#ebcb4c]`, `focus:shadow-[0_0_8px_rgba(235,203,76,0.5)]`
- **Transitions**: All properties transition over 300ms.

### Cards & Modals (Glassmorphism)
- **Background**: `bg-gray-900` with high opacity (90-95%).
- **Effect**: `backdrop-blur-md` (frosted glass effect).
- **Borders**: Thin gold border (`border-[#ebcb4c]/30`).
- **Shadows**: Gold glow (`shadow-[0_0_15px_rgba(235,203,76,0.3)]`).

---

## 4. Effects & Animations

The app utilizes dynamic animations to feel "alive".

- **Pulse**: Used on glowing elements (configured in tailwind `animate-pulse-slow`).
- **Blink**: Cursor effect for typing animations (`animate-blink-slow`).
- **Typewriter**: Text reveals character by character.
- **Hover Transformations**:
  - Scale (buttons)
  - Rotate (close icons)
  - Translate (form labels slide slightly).
