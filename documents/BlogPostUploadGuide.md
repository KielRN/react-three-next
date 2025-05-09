# Blog Post Upload Guide for Texas AI Website

This guide provides step-by-step instructions on how to properly create and upload new blog posts to the Texas AI website.

## File Naming and Location

1. **File Location**: Place all blog post files in the `react-three-next/content/blog/` directory.

2. **File Naming**: 
   - Use kebab-case (all lowercase with hyphens instead of spaces) for filenames
   - Avoid special characters (including em dashes, quotes, etc.)
   - File must end with `.md` extension
   - Example: `your-blog-post-title.md` (not `Your Blog Post Title.md`)

## Frontmatter Structure

Each blog post must begin with frontmatter (metadata) enclosed between triple dashes `---`. Here's the required structure:

```md
---
title: "Your Blog Post Title Here"
slug: "your-blog-post-title-here"
date: "YYYY-MM-DD"
author: "Texas AI Team"
excerpt: "A brief description of your blog post (1-2 sentences)"
tags: ["tag1", "tag2", "tag3"]
image: "/blog-images/your-image-name.jpg.html"
---
```

### Important Frontmatter Fields:

- **title**: The display title of your blog post (can include spaces and proper capitalization)
- **slug**: Very important - must match the filename without the `.md` extension (kebab-case)
- **date**: Use ISO format: YYYY-MM-DD
- **author**: Usually "Texas AI Team" or specific author name
- **excerpt**: A brief summary that will appear in blog listings
- **tags**: An array of relevant tags in square brackets
- **image**: Optional path to header placeholder (if omitted, no header will be displayed). **IMPORTANT**:
  - Always use forward slashes (/) not backslashes (\) for paths
  - Image paths must end with `.html` suffix (e.g., `"/blog-images/your-image.jpg.html"`)
  - These are not actual images but HTML placeholder files with styled content
  - The blog post doesn't display the actual image but uses the path as a reference

## Content Formatting

After the frontmatter, add your blog content using Markdown formatting:

```md
# Main Heading

Your introduction paragraph here.

## Section Heading

More content here.

### Subsection

- Bullet point 1
- Bullet point 2

**Bold text** and *italic text*

[Link text](https://example.com)

![Image alt text](/path/to/image.jpg)

```

## Example Blog Post

Here's a complete example of a properly formatted blog post:

```md
---
title: "Getting Started with React Three Fiber"
slug: "getting-started-with-react-three-fiber"
date: "2025-04-14"
author: "Texas AI Team"
excerpt: "Learn how to create amazing 3D web experiences with React Three Fiber in your Next.js projects."
tags: ["react", "threejs", "3d", "nextjs", "webgl"]
image: "/blog-images/r3f-header.jpg.html"
---

# Getting Started with React Three Fiber

React Three Fiber (R3F) is a React renderer for Three.js, the popular 3D library for the web. It allows you to create 3D graphics in a declarative, component-based way.

## Why Use React Three Fiber?

Traditional Three.js code can be verbose and imperative. With React Three Fiber, you can leverage React's component model to create reusable, maintainable 3D elements.

...
```

## Best Practices and Troubleshooting

1. **Always Match Slug and Filename**: The `slug` in your frontmatter MUST match your filename (minus the .md extension).

2. **Preview Before Publishing**: Always test your blog post locally by running `npm run dev` and navigating to `http://localhost:3000/blog/your-slug-here`.

3. **Common Issues**:
   - 404 errors: Usually caused by slug/filename mismatch or improper formatting
   - Missing images: Check image paths are correct and use forward slashes (/)
   - YAML parsing errors: Often caused by using backslashes in paths, which are treated as escape characters in YAML
   - Formatting issues: Verify your Markdown syntax is correct

4. **Adding Header References**:
   - Create placeholder HTML files in `/public/blog-images/` directory
   - These files should follow the format of existing placeholder HTML files
   - They don't actually display images but serve as styled placeholders
   - Example structure:
     ```html
     <!DOCTYPE html>
     <html>
     <head>
       <title>Your Header Title</title>
       <style>
         body, html {
           margin: 0;
           padding: 0;
           width: 100%;
           height: 100%;
           display: flex;
           justify-content: center;
           align-items: center;
           background: linear-gradient(135deg, #4f46e5, #2563eb);
           color: white;
           font-family: system-ui, sans-serif;
           text-align: center;
         }
         .placeholder {
           padding: 2rem;
           border-radius: 8px;
           background-color: rgba(0, 0, 0, 0.2);
         }
       </style>
     </head>
     <body>
       <div class="placeholder">
         <h1>Your Header Title</h1>
         <p>Description of your blog post</p>
       </div>
     </body>
     </html>
     ```
   - Reference these placeholder files in your frontmatter as `/blog-images/your-file.html`

## Testing Your Blog Post

After creating your blog post:

1. Save the file in the correct location with proper naming
2. Run the development server: `npm run dev` (or restart if already running)
3. Visit `http://localhost:3000/blog` to see if your post appears in the listing
4. Click on your post to ensure it displays correctly
5. Check that formatting, images, and links work as expected

By following these guidelines, you'll ensure your blog posts are properly integrated into the Texas AI website.