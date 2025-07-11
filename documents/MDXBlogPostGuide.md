# MDX Blog Post Guide for Texas AI Website

This guide provides instructions on how to create and publish blog posts using MDX on the Texas AI website. MDX combines the simplicity of Markdown with the power of React components, allowing you to create dynamic, interactive blog content.

## What is MDX?

MDX is a file format that combines Markdown with JSX (JavaScript XML). It allows you to:

- Write content using familiar Markdown syntax
- Import and use React components directly in your content
- Use JSX syntax for interactive or custom elements
- Maintain the simplicity of Markdown for most of your content

## Creating an MDX Blog Post

### File Location and Naming

1. Place all MDX blog posts in the `react-three-next/content/blog/` directory
2. Use `.mdx` as the file extension (not `.md`)
3. Use kebab-case for filenames (e.g., `your-blog-post-title.mdx`)

### Frontmatter Structure

Each MDX blog post must begin with frontmatter (metadata) enclosed between triple dashes `---`. The structure is the same as regular Markdown posts:

```mdx
---
title: "Your Blog Post Title Here"
slug: "your-blog-post-title-here"
date: "YYYY-MM-DD"
author: "Texas AI Team"
excerpt: "A brief description of your blog post (1-2 sentences)"
tags: ["tag1", "tag2", "tag3"]
image: "/blog-images/your-image-name.jpg"
---
```

#### Important Frontmatter Fields:

- **title**: The display title of your blog post (can include spaces and proper capitalization)
- **slug**: Must match the filename without the `.mdx` extension (kebab-case)
- **date**: Use ISO format: YYYY-MM-DD
- **author**: Usually "Texas AI Team" or specific author name
- **excerpt**: A brief summary that will appear in blog listings
- **tags**: An array of relevant tags in square brackets
- **image**: Path to the header image for the blog post (place all blog images in `/public/blog-images/`)

## Using Standard Markdown in MDX

MDX supports all standard Markdown syntax:

```mdx
# Heading 1
## Heading 2
### Heading 3

**Bold text** and *italic text*

[Link text](https://example.com)

![Image alt text](/blog-images/your-image.jpg)

> This is a blockquote

- Unordered list item
- Another item
  - Nested item

1. Ordered list item
2. Another ordered item

```jsx
// Code block with syntax highlighting
function Example() {
  return <div>Hello World</div>;
}
```
```

## Using JSX in MDX

The power of MDX comes from being able to use JSX directly in your content:

```mdx
# My Blog Post Title

Regular markdown paragraph here.

<div className="custom-container">
  <h3 className="custom-heading">Custom JSX Heading</h3>
  <p>This is a custom paragraph with JSX styling</p>
</div>

Back to regular markdown.
```

You can use any HTML elements with React-style className props for styling.

## Importing and Using React Components

You can import and use React components directly in your MDX files, but with some important considerations for deployment:

```mdx
---
title: "Using Components in MDX"
slug: "using-components-in-mdx"
date: "2025-07-15"
---

import { CounterDemo } from '../../src/components/mdx/interactive/CounterDemo';

# Using Interactive Components

Here's a regular markdown paragraph.

<CounterDemo />

Back to regular markdown again.
```

### Important Deployment Notes

To ensure proper rendering in both development and production:

1. **Keep components simple**: Complex components with many dependencies may cause issues
2. **Prefer static content**: When possible, use static content over interactive components
3. **Client-side rendering**: All interactive components must include the 'use client' directive
4. **Avoid ESM-only modules**: Some modules don't work with server-side rendering

### Creating Components for MDX

Components used in MDX should be:

1. Placed in the `src/components/mdx/` directory
2. Organized by category in subdirectories:
   - `interactive/` - For interactive components like buttons, counters, etc.
   - `visualization/` - For charts, graphs, diagrams
   - `data/` - For data display components like tables
   - `utils/` - For utility components like callouts, warnings, etc.

3. Exported as named exports
4. Client components with the 'use client' directive if they use React hooks

Example:

```jsx
'use client'

import { useState } from 'react';

export function CounterDemo() {
  const [count, setCount] = useState(0);
  
  return (
    <div className="p-4 my-6 bg-[#0e2042] rounded-lg border border-[#2c75ff]">
      <h3 className="text-xl text-[#ffcc00] mb-4 font-hesdeadjim">
        Interactive Counter
      </h3>
      <p className="text-white mb-4">
        Count: <span className="text-[#2c75ff] font-bold">{count}</span>
      </p>
      <button 
        onClick={() => setCount(count + 1)}
        className="px-4 py-2 bg-[#2c75ff] text-white rounded"
      >
        Increment
      </button>
    </div>
  );
}
```

## Best Practices for MDX Blog Posts

1. **Start with Frontmatter**: Always begin your MDX file with complete frontmatter
2. **Maintain Consistent Structure**: Use proper heading hierarchy (h1, h2, h3)
3. **Use Markdown for Most Content**: Use standard Markdown for most text, reserving JSX for interactive or custom elements
4. **Optimize Images**: Compress images before adding to `/public/blog-images/`
5. **Import at the Top**: Place all component imports at the top of the file after the frontmatter
6. **Test Locally**: Always preview your MDX post by running `npm run dev` before publishing
7. **Consistent Component Style**: Make sure your custom components match the site's design language
8. **Keep Components Simple**: Design components specifically for MDX with simple props
9. **Deploy Considerations**: Be cautious about using complex visualization libraries in MDX

## Examples

### Basic MDX Blog Post

```mdx
---
title: "Getting Started with MDX"
slug: "getting-started-with-mdx"
date: "2025-07-15"
author: "Texas AI Team"
excerpt: "Learn how to create your first MDX blog post with basic formatting and components."
tags: ["mdx", "tutorial", "react"]
image: "/blog-images/mdx-header.jpg"
---

# Getting Started with MDX

MDX allows you to use **Markdown** and *JSX* together in the same file.

## Basic Formatting

This is a paragraph with [a link](https://texasai.consulting).

- List item one
- List item two
- List item three

## Custom Styling with JSX

<div className="p-4 my-6 bg-[#0e2042] rounded-lg border border-[#2c75ff]">
  <h3 className="text-xl text-[#ffcc00] mb-4 font-hesdeadjim">
    Custom Callout Box
  </h3>
  <p className="text-white">
    This is a custom styled box created with JSX inside MDX.
  </p>
</div>
```

### Advanced MDX Blog Post with Components

```mdx
---
title: "Advanced MDX Features"
slug: "advanced-mdx-features"
date: "2025-07-16"
author: "Texas AI Team"
excerpt: "Explore advanced features of MDX including interactive components and data visualization."
tags: ["mdx", "advanced", "react", "components"]
image: "/blog-images/advanced-mdx.jpg"
---

import { CounterDemo } from '../../src/components/mdx/interactive/CounterDemo';
import { DataTable } from '../../src/components/mdx/data/DataTable';

# Advanced MDX Features

This post demonstrates more advanced features of MDX.

## Interactive Components

Below is an interactive counter component:

<CounterDemo />

## Data Visualization

You can also include data components:

<DataTable 
  data={[
    { name: "Alice", role: "Developer", experience: 5 },
    { name: "Bob", role: "Designer", experience: 3 },
    { name: "Charlie", role: "Manager", experience: 7 }
  ]} 
/>

## Mixing Markdown and Components

You can mix regular markdown:

1. First item
2. Second item

With components:

<CounterDemo />

And then go back to markdown again!
```

## Troubleshooting

### Common Issues and Solutions

1. **Components Not Rendering**: Make sure you've added the 'use client' directive to interactive components
2. **Import Errors**: Check that your import paths are correct (relative to the MDX file)
3. **Styling Issues**: Ensure your components use the site's styling conventions
4. **MDX Syntax Errors**: Validate your MDX syntax if the page fails to build
5. **Deployment Failures**: If you encounter deployment errors:
   - Simplify complex components
   - Ensure all dependencies are in package.json
   - Use dynamic imports with `ssr: false` for problematic components
   - Consider converting MDX to regular markdown for simpler content

## Conclusion

MDX offers a powerful way to create interactive, dynamic blog content while maintaining the simplicity of Markdown for most text content. By following this guide, you can create engaging blog posts that leverage React components for interactive elements while ensuring successful deployment.