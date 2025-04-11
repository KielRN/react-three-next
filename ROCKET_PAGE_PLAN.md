# Plan: Create Interactive Rocket Page

## Goal
Create a dedicated page at `/rocket` displaying the `rocket.glb` model. The model should fill the screen, be interactive (orbit controls), and act as a link to the homepage (`/`) with hover effects.

## Steps

1.  **Create New Route:**
    *   Create a new folder: `app/rocket`
    *   Create a new file: `app/rocket/page.jsx`

2.  **Design Rocket Page (`app/rocket/page.jsx`):**
    *   Import necessary components: `dynamic` from `next/dynamic`, `Suspense` from `react`, `View`, `Common` from `@/components/canvas/View`, `Rocket` from `@/components/canvas/Examples`, `OrbitControls` from `@react-three/drei`.
    *   Use `dynamic` to load `View`, `Common`, and `Rocket` client-side only (`ssr: false`).
    *   Create the page component structure.
    *   Use the `View` component, configured to occupy the full screen (`className='w-screen h-screen'`).
    *   Add `<OrbitControls />` inside the `View` for user interaction.
    *   Render the `Rocket` component within the `View` and `Suspense`. Adjust `scale` and `position` (e.g., `scale={1.5} position={[0, -1, 0]}`).
    *   Use the `Common` component for basic lighting and camera setup (e.g., `<Common color={'#222'} />`).

3.  **Add Interactivity to Rocket Component (`src/components/canvas/Examples.jsx`):**
    *   Modify the existing `Rocket` function component.
    *   Import `useState`, `useRef` from `react`.
    *   Import `useCursor` from `@react-three/drei`.
    *   Import `useRouter` from `next/navigation`.
    *   Inside the component:
        *   Get the router: `const router = useRouter()`.
        *   Add hover state: `const [hovered, setHover] = useState(false)`.
        *   Apply cursor change: `useCursor(hovered)`.
        *   Add event handlers to the `<primitive>` tag:
            *   `onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}`
            *   `onPointerOut={(e) => setHover(false)}`
            *   `onClick={(e) => { e.stopPropagation(); router.push('/'); }}`
        *   (Optional) Add a subtle visual feedback on hover, e.g., slightly changing material properties if desired, though changing the cursor might be sufficient.

4.  **Styling:**
    *   Ensure the `View` component's container `div` in `app/rocket/page.jsx` uses classes like `w-screen h-screen` to take up the full viewport.
    *   Verify that `app/layout.jsx` and `app/global.css` do not prevent full-screen display (e.g., remove default padding/margins if necessary for this specific route, though targeting the `div` directly is usually better).

## Mermaid Diagram

```mermaid
sequenceDiagram
    participant User
    participant Roo (Architect)
    participant Code Mode
    participant Filesystem

    User->>Roo (Architect): Request new page for rocket model
    Roo (Architect)->>User: Propose plan 1
    User->>Roo (Architect): Ask to add interactive links
    Roo (Architect)->>User: Propose updated plan 2 (Plan 1 + Modify Rocket component)
    User->>Roo (Architect): Approve plan 2, specify link target ('/')
    Roo (Architect)->>User: Ask to save plan to Markdown?
    User->>Roo (Architect): Confirm saving plan
    Roo (Architect)->>Filesystem: write_to_file ROCKET_PAGE_PLAN.md
    Roo (Architect)->>User: Request switch to Code Mode
    User->>Roo (Architect): Approve mode switch
    Roo (Architect)-->>Code Mode: Handoff task: Implement updated plan 2
    Code Mode->>Filesystem: Create app/rocket/page.jsx
    Code Mode->>Filesystem: Write content to app/rocket/page.jsx
    Code Mode->>Filesystem: Modify src/components/canvas/Examples.jsx (Update Rocket component)
    Code Mode->>Filesystem: (If needed) Modify app/global.css or app/layout.jsx
    Code Mode->>User: Show result