# Blog Image Fix Plan

**Goal:** Implement image display for blog cards and blog post headers using the `image` property from the markdown frontmatter.

**Affected Files:**

1.  `react-three-next/src/components/blog/BlogCard.jsx`
2.  `react-three-next/src/components/blog/BlogLayout.jsx`

**Plan Details:**

**Step 1: Modify `BlogCard.jsx` to Display Post Image**

*   **Objective:** Replace the placeholder `div` with the `next/image` component to show the featured image for each blog post in the card view.
*   **Actions:**
    1.  In `react-three-next/src/components/blog/BlogCard.jsx`, locate the following code block (around `lines 17-19`):
        ```jsx
        <div className="relative h-48 w-full">
          <div className="w-full h-full bg-gradient-to-r from-[#0e2042] to-gray-900" />
        </div>
        ```
    2.  Replace this `div` with the `next/image` component.
        *   The `src` attribute should be set to `post.image`.
        *   The `alt` attribute should be set to `post.title` for accessibility.
        *   The `layout="fill"` and `objectFit="cover"` props (or equivalent styling if using `fill` with Next.js 13+ `sizes` prop) are commonly used for responsive images that fill their container.
        *   Ensure the parent `div` (`className="relative h-48 w-full"`) is kept to constrain the image dimensions.
    3.  **Example modification:**
        ```jsx
        <div className="relative h-48 w-full">
          {post.image && ( // Conditionally render if image exists
            <Image
              src={post.image}
              alt={post.title}
              layout="fill" // or fill={true} for Next.js 13+
              objectFit="cover" // or style={{ objectFit: 'cover' }}
              className="transition-transform duration-300 group-hover:scale-105" // Optional: add some hover effect
            />
          )}
          {!post.image && ( // Fallback if no image
            <div className="w-full h-full bg-gradient-to-r from-[#0e2042] to-gray-900" />
          )}
        </div>
        ```

**Step 2: Modify `BlogLayout.jsx` to Display Post Header Image**

*   **Objective:** Replace the placeholder `div` with the `next/image` component to show the featured image at the top of individual blog posts.
*   **Actions:**
    1.  In `react-three-next/src/components/blog/BlogLayout.jsx`, locate the following code block (around `lines 49-55`):
        ```jsx
        <div className="relative w-full h-64 md:h-96 mb-6 rounded-lg overflow-hidden border-l-2 border-t-2 border-[#2c75ff]"
          style={{
            boxShadow: '0 0 15px rgba(44, 117, 255, 0.5)',
            animation: 'border-pulse 3s infinite'
          }}>
          <div className="w-full h-full bg-gradient-to-r from-[#0e2042] to-gray-900"></div>
        </div>
        ```
    2.  Modify this section to include the `next/image` component.
        *   The `src` attribute should be set to `post.image`.
        *   The `alt` attribute should be set to `post.title`.
        *   Use appropriate props like `layout="fill"` and `objectFit="cover"` (or `fill={true}` and styling for Next.js 13+) for responsiveness.
        *   The existing parent `div` with its classes and styles should be maintained to act as the container for the image.
    3.  **Example modification:**
        ```jsx
        <div className="relative w-full h-64 md:h-96 mb-6 rounded-lg overflow-hidden border-l-2 border-t-2 border-[#2c75ff]"
          style={{
            boxShadow: '0 0 15px rgba(44, 117, 255, 0.5)',
            animation: 'border-pulse 3s infinite'
          }}>
          {post.image && ( // Conditionally render if image exists
            <Image
              src={post.image}
              alt={post.title}
              layout="fill" // or fill={true}
              objectFit="cover" // or style={{ objectFit: 'cover' }}
            />
          )}
          {!post.image && ( // Fallback if no image
             <div className="w-full h-full bg-gradient-to-r from-[#0e2042] to-gray-900"></div>
          )}
        </div>
        ```

**Step 3: Verify Changes**

*   **Objective:** Ensure images are displayed correctly on both the blog listing page and individual blog post pages.
*   **Actions:**
    1.  Navigate to the blog listing page (likely `/blog`) and confirm that blog cards now display their respective featured images.
    2.  Click on a blog post to view its individual page and confirm that the header image is displayed correctly.
    3.  Check posts with and without images in their frontmatter to ensure graceful fallbacks (if implemented as suggested).

---

**Mermaid Diagram of the Plan:**

```mermaid
graph TD
    A[Start: Images Not Displaying] --> B{Identify Root Cause};
    B -- Frontmatter 'image' property not used --> C[Plan Modifications];
    C --> D[Modify BlogCard.jsx];
    D --> D1[Locate placeholder div];
    D1 --> D2[Replace with next/image component];
    D2 --> D3[Set src=post.image, alt=post.title];
    D3 --> D4[Ensure styling/layout];
    C --> E[Modify BlogLayout.jsx];
    E --> E1[Locate placeholder div for header];
    E1 --> E2[Replace with next/image component];
    E2 --> E3[Set src=post.image, alt=post.title];
    E3 --> E4[Ensure styling/layout];
    D4 --> F[Verify Blog List Page];
    E4 --> G[Verify Individual Blog Post Page];
    F --> H{Issue Resolved?};
    G --> H;
    H -- Yes --> I[End: Images Displaying];
    H -- No --> J[Revisit & Debug];