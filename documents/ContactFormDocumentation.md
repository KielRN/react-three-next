# Contact Form Component Documentation

## Overview

The `ContactForm` is a reusable, configurable component for Next.js websites. It provides a complete solution for creating interactive contact forms with webhook integration for form submissions.

## Component API

The component accepts the following props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isVisible` | boolean | required | Controls visibility of the form |
| `onClose` | function | required | Function to call when form is closed |
| `hookUrl` | string | required | URL for the webhook to submit form data |
| `title` | string | "CONTACT US" | Form title |
| `position` | string | "right" | Position of the form. Options: 'right', 'left', 'center' |
| `theme` | object | See below | Theme colors for the form |
| `submitButtonText` | string | "SEND MESSAGE" | Text for the submit button |
| `initialValues` | object | {} | Pre-fill form values |
| `additionalFields` | array | [] | Custom fields to add to the form |
| `successMessage` | string | "Your message has been sent!" | Message to show on successful submission |

### Default Theme

```js
{
  primary: "#ebcb4c",
  background: "bg-gray-900/90",
  border: "border-[#ebcb4c]/30",
  shadow: "shadow-[0_0_15px_rgba(235,203,76,0.3)]"
}
```

### Additional Fields Format

Each field in the `additionalFields` array should be an object with the following properties:

```js
{
  id: "fieldId",        // Unique identifier for the field
  label: "Field Label", // Display label
  type: "text",         // HTML input type (text, email, tel, etc.) or "textarea"
  required: true,       // Whether the field is required
  placeholder: "Placeholder text"  // Optional placeholder text
}
```

## Usage Examples

### Basic Usage

```jsx
import { useState } from 'react'
import { ContactForm } from '@/templates/ContactForm'

export default function Page() {
  const [showContactForm, setShowContactForm] = useState(false)
  
  return (
    <div>
      {/* Trigger button */}
      <button onClick={() => setShowContactForm(true)}>
        Contact Us
      </button>
      
      {/* Contact form component */}
      <ContactForm 
        isVisible={showContactForm}
        onClose={() => setShowContactForm(false)}
        hookUrl="https://your-webhook-url.com/endpoint"
      />
    </div>
  )
}
```

### Custom Theme

```jsx
<ContactForm 
  isVisible={showContactForm}
  onClose={() => setShowContactForm(false)}
  hookUrl="https://your-webhook-url.com/endpoint"
  theme={{
    primary: "#3b82f6",
    background: "bg-slate-900/90",
    border: "border-blue-500/30",
    shadow: "shadow-[0_0_15px_rgba(59,130,246,0.3)]"
  }}
/>
```

### With Additional Fields

```jsx
<ContactForm 
  isVisible={showContactForm}
  onClose={() => setShowContactForm(false)}
  hookUrl="https://your-webhook-url.com/endpoint"
  additionalFields={[
    {
      id: "phone",
      label: "Phone Number",
      type: "tel",
      required: true,
      placeholder: "Your phone number"
    },
    {
      id: "company",
      label: "Company",
      type: "text",
      required: false,
      placeholder: "Your company name"
    }
  ]}
/>
```

### With Initial Values

```jsx
<ContactForm 
  isVisible={showContactForm}
  onClose={() => setShowContactForm(false)}
  hookUrl="https://your-webhook-url.com/endpoint"
  initialValues={{
    name: "John Doe",
    email: "john@example.com",
    message: "I'm interested in your services."
  }}
/>
```

### Different Position

```jsx
<ContactForm 
  isVisible={showContactForm}
  onClose={() => setShowContactForm(false)}
  hookUrl="https://your-webhook-url.com/endpoint"
  position="center" // Options: "right", "left", "center"
/>
```

## Webhook Integration

The form submits data to the specified webhook URL using a POST request with a JSON payload containing all form field values. The webhook URL should be set via the `hookUrl` prop.

Example webhook payload:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "This is my message.",
  "phone": "555-123-4567",
  "company": "Acme Inc."
}
```

## Accessibility Features

The ContactForm component includes the following accessibility features:

- Proper ARIA roles and attributes
- Keyboard navigation support
- Focus management
- Screen reader compatible error messages
- WCAG-compliant color contrast
- Form validation with clear error messages

## Animation and Styling

The component includes:

- Sliding animations for entry/exit based on position
- Hover effects on form fields
- Focus states with visual indicators
- Loading animation during form submission
- Success animation and message