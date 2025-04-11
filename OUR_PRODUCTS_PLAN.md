# Plan: Add "Our Products" Link and Card to Rocket Page

## Goals
1. Add an "Our Products" link to the rocket page in the same style as the "NEXT" and "CONTACT" links
2. Position it appropriately in the 3D space
3. Make it open a card when clicked
4. Style the card in the same way as the Contact form
5. Display content from AgentsCard.md in the card (note: file is currently empty)

## Implementation Details

### 1. Modify the Rocket Component in Examples.jsx
- Add a new Billboard component for the "Our Products" link
- Position it at an appropriate location in the 3D space
- Style it similarly to the other links
- Add state management to track when the "Our Products" link is clicked
- Pass this state to the parent component via a callback prop

```jsx
// New code to add in the Rocket component
const [productsHovered, setProductsHovered] = useState(false)

// Add a new Billboard for "Our Products"
<Billboard
  position={[0, 15, 2]} // Positioned above the rocket
  follow={true}
  lockX={false}
  lockY={false}
  lockZ={false}
>
  <mesh
    onClick={(e) => { 
      e.stopPropagation(); 
      onToggleProductsCard && onToggleProductsCard(); 
    }}
    onPointerOver={(e) => { e.stopPropagation(); setProductsHovered(true); }}
    onPointerOut={() => setProductsHovered(false)}
  >
    <planeGeometry args={[4, 1]} />
    <meshBasicMaterial color="#FFFF00" transparent opacity={0} />
    <Text
      position={[0, 0, 1]}
      fontSize={1.2}
      color={productsHovered ? "#FFFFFF" : "#ebcb4c"}
      anchorX="center"
      anchorY="middle"
      fontWeight={800}
      fontStyle="italic"
      letterSpacing={0.05}
      font="/Fonts/HesDeadJim-apj9.ttf"
    >
      OUR PRODUCTS
    </Text>
  </mesh>
</Billboard>
```

### 2. Modify the RocketPage Component
- Add state to manage the visibility of the products card
- Pass a callback to the Rocket component to toggle the card visibility
- Add the products card component to the page
- Style the card to match the Contact form

```jsx
// In app/rocket/page.jsx
const [showProductsCard, setShowProductsCard] = useState(false)

// Modify the Rocket component call to include the callback
<Rocket 
  scale={0.6} 
  position={[0, -10, 0]} 
  onToggleContactForm={() => setShowContactForm(prev => !prev)}
  onToggleProductsCard={() => setShowProductsCard(prev => !prev)}
/>

// Add the products card with styling similar to the contact form
<div className={`absolute left-10 top-20 bg-gray-900/90 backdrop-blur-md p-8 rounded-lg z-20 w-96 border border-[#ebcb4c]/30 shadow-[0_0_15px_rgba(235,203,76,0.3)]
  transform transition-all duration-500 ease-in-out ${showProductsCard
    ? 'opacity-100 translate-x-0 scale-100'
    : 'opacity-0 -translate-x-20 scale-95 pointer-events-none'}`}
>
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-2xl font-bold text-[#ebcb4c] italic tracking-wider" style={{ fontFamily: "'Arial Black', 'Arial Bold', sans-serif" }}>
      <span className="inline-block animate-pulse-slow">O</span>
      <span className="inline-block">U</span>
      <span className="inline-block">R</span>
      <span className="inline-block"> </span>
      <span className="inline-block">P</span>
      <span className="inline-block">R</span>
      <span className="inline-block">O</span>
      <span className="inline-block">D</span>
      <span className="inline-block">U</span>
      <span className="inline-block">C</span>
      <span className="inline-block">T</span>
      <span className="inline-block">S</span>
    </h2>
    <button
      className="text-[#ebcb4c] hover:text-white transition-colors transform hover:rotate-90 duration-300"
      onClick={() => setShowProductsCard(false)}
      aria-label="Close products card"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
  
  {/* This is where the content from AgentsCard.md will go */}
  <div className="text-white overflow-y-auto max-h-[60vh]">
    {/* Content from AgentsCard.md will be rendered here */}
    <p>Content from AgentsCard.md will be displayed here.</p>
  </div>
</div>
```

### 3. Create Content for AgentsCard.md
Since the file is currently empty, we need to add some content to it. Here's a suggestion:

```markdown
# Our AI Products

## Custom AI Assistants
Build tailored AI assistants that understand your business domain, help your employees work more efficiently, and provide consistent customer service.

## Data Analytics & Insights
Transform your raw data into actionable insights with our AI-powered analytics solutions. Uncover patterns, predict trends, and make data-driven decisions.

## Integration Services
Seamlessly integrate AI capabilities into your existing systems and workflows. Our experts ensure minimal disruption while maximizing the benefits of AI.

## Training & Support
Comprehensive training and ongoing support to help your team make the most of our AI solutions. We're with you every step of the way.

Contact us today to learn how our AI products can transform your business!
```

### 4. Load and Display the Content from AgentsCard.md
We have two implementation options:
1. **Static Import**: Import the markdown content during build time
2. **Dynamic Loading**: Fetch the markdown content when the component mounts

For a simple implementation, we can use a static import with next-mdx-remote or similar library.

## Technical Considerations
1. **State Management**: Use React's useState to track card visibility
2. **Event Propagation**: Use `e.stopPropagation()` to prevent unwanted interactions with the 3D scene
3. **Styling**: Match the card styling with the existing Contact form
4. **Markdown Rendering**: We'll need to parse and render the markdown content from the file
5. **Responsive Design**: Ensure the card is properly displayed on different screen sizes
6. **Performance**: The card should only render when visible to improve performance

## Implementation Steps
1. Update the Rocket component in `src/components/canvas/Examples.jsx` to add the "Our Products" link
2. Update the rocket page in `app/rocket/page.jsx` to:
   - Add state management for card visibility
   - Pass the toggle callback to the Rocket component
   - Add the products card component with conditional rendering
3. Add content to `documents/AgentsCard.md`
4. Implement functionality to load and render the markdown content