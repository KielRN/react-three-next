# Plan: Add "CONTACT" Link and Form to Rocket Page

## Goals
1. Add a "CONTACT" link to the rocket page in the same style as the "NEXT" link
2. Position it lower and to the right of the "NEXT" link
3. Make it open a form when clicked
4. Create a form with fields for "NAME", "EMAIL", and "MESSAGE"
5. Include a placeholder hook for form submission

## Implementation Details

### 1. Modify the Rocket Component in Examples.jsx
- Add a new Billboard component for the "CONTACT" link
- Position it lower and to the right of the "NEXT" link (e.g., [8, 5, 2])
- Style it similarly to the "NEXT" link but with a different color
- Add state management in the Rocket component to track when the contact link is clicked
- Pass this state to the parent component via a callback prop

```jsx
// New code to add in the Rocket component
const [showContactForm, setShowContactForm] = useState(false)

// Add after the existing "NEXT" Billboard
<Billboard
  position={[8, 5, 2]}
  follow={true}
  lockX={false}
  lockY={false}
  lockZ={false}
>
  <mesh
    onClick={(e) => { 
      e.stopPropagation(); 
      props.onToggleContactForm && props.onToggleContactForm();
    }}
    onPointerOver={(e) => { e.stopPropagation(); setLabelHover(true); }}
    onPointerOut={() => setLabelHover(false)}
  >
    <planeGeometry args={[3, 1]} />
    <meshBasicMaterial color="#FFFF00" transparent opacity={0} />
    <Text
      position={[0, 0, 1]}
      fontSize={1.2}
      color="#4ceb9f" // Different color from "NEXT"
      anchorX="center"
      anchorY="middle"
      fontWeight={800}
      fontStyle="italic"
      letterSpacing={0.05}
      font="/Fonts/HesDeadJim-apj9.ttf"
    >
      CONTACT
    </Text>
  </mesh>
</Billboard>
```

### 2. Modify the RocketPage Component
- Add state to manage the visibility of the contact form
- Pass a callback to the Rocket component to toggle the form visibility
- Add the contact form component to the page
- Style the form to match the overall design

```jsx
// In app/rocket/page.jsx
const [showContactForm, setShowContactForm] = useState(false)

// Modify the Rocket component call to include the callback
<Rocket 
  scale={0.6} 
  position={[0, -10, 0]} 
  onToggleContactForm={() => setShowContactForm(prev => !prev)} 
/>

// Add the contact form
{showContactForm && (
  <div className="absolute right-10 bottom-20 bg-gray-900 p-6 rounded-lg shadow-xl z-20 w-80">
    <h2 className="text-xl font-bold mb-4 text-white">Contact Us</h2>
    <form onSubmit={(e) => {
      e.preventDefault();
      // Placeholder for future hook
      console.log('Form submitted');
    }}>
      <div className="mb-4">
        <label className="block text-white text-sm font-bold mb-2" htmlFor="name">
          NAME
        </label>
        <input 
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
          id="name" 
          type="text" 
          required 
        />
      </div>
      <div className="mb-4">
        <label className="block text-white text-sm font-bold mb-2" htmlFor="email">
          EMAIL
        </label>
        <input 
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
          id="email" 
          type="email" 
          required 
        />
      </div>
      <div className="mb-6">
        <label className="block text-white text-sm font-bold mb-2" htmlFor="message">
          MESSAGE
        </label>
        <textarea 
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
          id="message" 
          rows="4" 
          required 
        ></textarea>
      </div>
      <div className="flex items-center justify-between">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
          Send
        </button>
        <button 
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" 
          type="button"
          onClick={() => setShowContactForm(false)}
        >
          Close
        </button>
      </div>
    </form>
  </div>
)}
```

## Technical Considerations
1. **State Management**: Use React's useState to track form visibility
2. **Event Propagation**: Make sure to use `e.stopPropagation()` to prevent unwanted interactions with the 3D scene
3. **Styling**: Match the form styling with the existing page design (dark theme with contrasting text)
4. **Form Submission**: Include a placeholder for the form submission hook, which can be filled in later
5. **Accessibility**: Ensure the form is accessible with proper labels and focus management

## Implementation Steps
1. Update the Rocket component in `src/components/canvas/Examples.jsx` to add the CONTACT link
2. Update the rocket page in `app/rocket/page.jsx` to:
   - Import useState from React
   - Add state management for form visibility
   - Pass the toggle callback to the Rocket component
   - Add the contact form component with conditional rendering