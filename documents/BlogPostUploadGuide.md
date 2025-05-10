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
image: "/blog-images/your-image-name.jpg"
---
```

### Important Frontmatter Fields:

- **title**: The display title of your blog post (can include spaces and proper capitalization)
- **slug**: Very important - must match the filename without the `.md` extension (kebab-case)
- **date**: Use ISO format: YYYY-MM-DD
- **author**: Usually "Texas AI Team" or specific author name
- **excerpt**: A brief summary that will appear in blog listings
- **tags**: An array of relevant tags in square brackets
- **image**: Optional path to the header image for the blog post (if omitted, no header image will be displayed). **IMPORTANT**:
  - Place all blog post images in the `/public/blog-images/` directory.
  - Always use forward slashes (/) not backslashes (\) for paths.
  - Reference the image directly, e.g., `"/blog-images/your-image.jpg"` or `"/blog-images/your-image.png"`.
  - The actual image file will be displayed as the header.

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

![Image alt text](/blog-images/your-actual-image.jpg)

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
image: "/blog-images/actual-image-example.jpg"
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

4. **Adding Header Images**:
   - Place your actual image files (e.g., `.jpg`, `.png`, `.webp`) in the `/public/blog-images/` directory.
   - In the frontmatter, set the `image` field to the path of your image, like: `image: "/blog-images/your-chosen-image.jpg"`.
   - This image will be used as the header for your blog post.
   - Ensure your image is optimized for the web to maintain good page load speeds.

## Testing Your Blog Post

After creating your blog post:

1. Save the file in the correct location with proper naming
2. Run the development server: `npm run dev` (or restart if already running)
3. Visit `http://localhost:3000/blog` to see if your post appears in the listing
4. Click on your post to ensure it displays correctly
5. Check that formatting, images, and links work as expected

By following these guidelines, you'll ensure your blog posts are properly integrated into the Texas AI website.