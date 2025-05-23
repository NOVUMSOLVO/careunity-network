# Tailwind CSS 3.x Usage Guide

This guide explains how to use Tailwind CSS 3.x effectively in our project.

## Key Features in Tailwind CSS 3.x

### Just-in-Time (JIT) Mode

Tailwind CSS 3.x uses JIT compilation by default, which offers several advantages:

- Faster build times
- Smaller CSS bundle size
- On-demand compilation
- Support for arbitrary values
- Variant stacking

### How to Use Arbitrary Values

```html
<!-- Examples of arbitrary values -->
<div class="top-[117px]">
<div class="bg-[#bada55]">
<div class="grid-cols-[1fr_500px_2fr]">
```

### New Color Utility Features

Tailwind CSS 3.x includes an extended color palette and support for opacity modifiers:

```html
<!-- New color features -->
<div class="bg-sky-500">
<div class="text-blue-500/75">
<div class="border-indigo-500/25">
```

### Responsive Design with Tailwind CSS 3.x

```html
<!-- Responsive design examples -->
<div class="text-sm md:text-base lg:text-lg">
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

## Best Practices

1. **Use utility classes directly**: Avoid custom CSS when possible
   ```html
   <!-- Good -->
   <button class="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700">
     Submit
   </button>
   
   <!-- Avoid when possible -->
   <button class="custom-button">Submit</button>
   ```

2. **Extract components for repeated patterns**:
   ```jsx
   // Extract repeated patterns into components
   const Button = ({ children, ...props }) => (
     <button 
       className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700" 
       {...props}
     >
       {children}
     </button>
   );
   ```

3. **Use @apply sparingly**: Only for complex, frequently used patterns
   ```css
   /* Use @apply sparingly */
   .btn-primary {
     @apply py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700;
   }
   ```

4. **Leverage new Tailwind 3.x features**:
   - Use the new color palette
   - Utilize arbitrary values for one-off styles
   - Take advantage of variant grouping

## Performance Optimization

Our build process is configured to:
1. Use JIT mode for optimal output size
2. Purge unused styles automatically
3. Minify the CSS output for production
