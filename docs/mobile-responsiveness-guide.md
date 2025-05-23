# Mobile Responsiveness Guide

This guide provides best practices and guidelines for ensuring that the CareUnity application is fully responsive and provides an optimal user experience across all device sizes.

## Table of Contents

1. [Breakpoints](#breakpoints)
2. [Touch Targets](#touch-targets)
3. [Typography](#typography)
4. [Layout](#layout)
5. [Forms](#forms)
6. [Tables](#tables)
7. [Images](#images)
8. [Navigation](#navigation)
9. [Testing](#testing)
10. [Performance](#performance)

## Breakpoints

CareUnity uses the following breakpoints, which align with Tailwind CSS's default breakpoints:

| Breakpoint | Width (px) | Description |
|------------|------------|-------------|
| `sm`       | 640px      | Small devices (phones in landscape, small tablets) |
| `md`       | 768px      | Medium devices (tablets) |
| `lg`       | 1024px     | Large devices (desktops, laptops) |
| `xl`       | 1280px     | Extra large devices (large desktops) |
| `2xl`      | 1536px     | Extra extra large devices (very large desktops) |

### Usage in Code

Use Tailwind's responsive prefixes to apply styles at different breakpoints:

```jsx
<div className="flex flex-col md:flex-row">
  {/* Stacked on mobile, side-by-side on tablets and above */}
</div>
```

For JavaScript detection, use the `useDevice` hook:

```jsx
import { useDevice } from '@/hooks/use-mobile';

function MyComponent() {
  const { isMobile, isTablet, isDesktop } = useDevice();
  
  return (
    <div>
      {isMobile ? (
        <MobileView />
      ) : (
        <DesktopView />
      )}
    </div>
  );
}
```

## Touch Targets

Ensure that all interactive elements are large enough to be easily tapped on touch devices.

### Guidelines

- Minimum touch target size: 44×44 pixels (WCAG 2.5.5)
- Provide adequate spacing between touch targets (at least 8px)
- Use the `TouchTarget` component for interactive elements

### Example

```jsx
import { TouchTarget, TouchTargetButton } from '@/components/ui/touch-target';

// Wrap an interactive element
<TouchTarget>
  <InteractiveElement />
</TouchTarget>

// Use the button variant
<TouchTargetButton onClick={handleClick}>
  Click Me
</TouchTargetButton>
```

## Typography

Ensure text is readable across all device sizes.

### Guidelines

- Minimum font size for body text: 16px on mobile, 14px on desktop
- Line height: at least 1.5 for body text
- Use relative units (rem, em) instead of fixed units (px)
- Ensure sufficient contrast (WCAG AA: 4.5:1 for normal text, 3:1 for large text)

### Example

```jsx
// Good
<p className="text-base md:text-sm leading-relaxed">Content</p>

// Avoid
<p className="text-xs" style={{ lineHeight: '1.2' }}>Content</p>
```

## Layout

Adapt layouts to different screen sizes.

### Guidelines

- Use flexbox and grid for responsive layouts
- Implement a mobile-first approach
- Consider both portrait and landscape orientations
- Ensure content fits within the viewport without horizontal scrolling
- Use appropriate padding and margins for different screen sizes

### Example

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 md:p-6">
  {/* Content */}
</div>
```

## Forms

Optimize forms for mobile devices.

### Guidelines

- Use appropriate input types for mobile keyboards (email, tel, number, etc.)
- Implement larger form controls on touch devices
- Stack form fields vertically on mobile
- Use the `MobileOptimizedForm` component for forms

### Example

```jsx
import { MobileOptimizedForm } from '@/components/ui/mobile-optimized-form';

const formFields = [
  {
    name: 'email',
    label: 'Email Address',
    type: 'email',
    required: true,
  },
  // More fields...
];

<MobileOptimizedForm
  fields={formFields}
  onSubmit={handleSubmit}
  responsive={true}
/>
```

## Tables

Make tables responsive on small screens.

### Guidelines

- Use the `ResponsiveTable` component
- On mobile, transform tables into card-based layouts
- Allow horizontal scrolling for complex tables when necessary
- Consider which columns are essential for mobile view

### Example

```jsx
import { ResponsiveTable } from '@/components/ui/responsive-table';

const columns = [
  {
    id: 'name',
    header: 'Name',
    accessor: (row) => row.name,
  },
  {
    id: 'email',
    header: 'Email',
    accessor: (row) => row.email,
    hideOnMobile: true, // Hide on mobile
  },
  // More columns...
];

<ResponsiveTable
  columns={columns}
  data={data}
  getRowKey={(row) => row.id}
  mobileCards={true}
/>
```

## Images

Optimize images for different screen sizes.

### Guidelines

- Use the `ResponsiveImage` component
- Implement responsive image techniques (srcset, sizes)
- Serve appropriately sized images for different devices
- Use modern image formats (WebP, AVIF) with fallbacks
- Implement lazy loading for images

### Example

```jsx
import { ResponsiveImage } from '@/components/ui/responsive-image';

<ResponsiveImage
  src="/images/example.jpg"
  alt="Example"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  srcSet="/images/example-small.jpg 640w, /images/example-medium.jpg 1024w, /images/example-large.jpg 1920w"
  webpSrcSet="/images/example-small.webp 640w, /images/example-medium.webp 1024w, /images/example-large.webp 1920w"
  aspectRatio={16/9}
  lazyLoad={true}
/>
```

## Navigation

Adapt navigation for different screen sizes.

### Guidelines

- Implement a hamburger menu or bottom navigation on mobile
- Ensure navigation is accessible via keyboard and screen readers
- Provide clear visual feedback for active states
- Consider using the `ResponsiveLayout` component

### Example

```jsx
import { ResponsiveLayout } from '@/components/layout/responsive-layout';

<ResponsiveLayout>
  {/* Your content here */}
</ResponsiveLayout>
```

## Testing

Test responsiveness across different devices and browsers.

### Guidelines

- Use the `ResponsiveTester` component during development
- Test on real devices when possible
- Use browser developer tools for responsive testing
- Test both portrait and landscape orientations
- Verify touch interactions on touch devices

### Example

```jsx
import { ResponsiveTester } from '@/components/dev/responsive-tester';

// During development
<ResponsiveTester defaultDevice="iPhone 12/13" />
```

## Performance

Optimize performance for mobile devices.

### Guidelines

- Minimize JavaScript bundle size with code splitting
- Optimize and compress images
- Implement lazy loading for off-screen content
- Use appropriate caching strategies
- Test performance on low-end devices and slow connections

### Tools

- Lighthouse in Chrome DevTools
- WebPageTest
- Chrome DevTools Performance panel
- Network throttling for testing slow connections

## Additional Resources

- [WCAG 2.1 Mobile Accessibility](https://www.w3.org/WAI/standards-guidelines/mobile/)
- [Google's Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [MDN Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
