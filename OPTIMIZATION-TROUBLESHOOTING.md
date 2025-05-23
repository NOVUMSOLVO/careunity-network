# CareUnity Mobile Optimization Troubleshooting Guide

This guide provides solutions for common issues that might occur when working with the optimized mobile version of CareUnity Network.

## Common Issues and Solutions

### 1. Build Process Fails

**Symptoms:**
- Error messages during the build process
- Missing files in the `dist` directory

**Solutions:**
- Ensure all dependencies are installed:
  ```powershell
  npm install
  npm install vite-plugin-imagemin --save-dev
  npm install sharp --save-dev
  ```

- Try running the build steps separately:
  ```powershell
  # Step 1: Build JavaScript bundles
  scripts\build-optimized.bat
  
  # Step 2: Convert images
  scripts\convert-test-images.bat
  ```

- Check for file path issues:
  ```powershell
  # Make sure input files exist
  dir careunity-mobile.html
  dir mobile-service-worker-optimized.js
  ```

### 2. JavaScript Bundles Not Loading

**Symptoms:**
- Page loads, but functionality is missing
- Console errors about missing files

**Solutions:**
- Check if bundles were generated:
  ```powershell
  dir dist\assets\*.js
  ```

- Ensure the paths in HTML match the generated files:
  Edit `dist\careunity-mobile.html` to match the actual filenames in the assets folder

### 3. Modern Image Formats Not Working

**Symptoms:**
- Images are still loading as PNG/JPEG instead of WebP/AVIF
- No performance improvement in image loading

**Solutions:**

- Verify browser support for WebP/AVIF:
  - Chrome 32+ and Firefox 65+ support WebP
  - Chrome 85+, Firefox 93+, and Safari 16+ support AVIF

- Check if image conversion worked:

  ```powershell
  # List all image formats in dist folder
  dir dist\*.webp
  dir dist\*.avif
  ```

- Ensure your server is sending the correct MIME types:

  ```javascript
  // Add in your server configuration
  const mimeTypes = {
    '.webp': 'image/webp',
    '.avif': 'image/avif'
  };
  ```

- Test with the `<picture>` element as a fallback mechanism:

  ```html
  <picture>
    <source srcset="image.avif" type="image/avif">
    <source srcset="image.webp" type="image/webp">
    <img src="image.png" alt="Description">
  </picture>
  ```

### 4. Service Worker Issues

**Symptoms:**
- Service worker not registering
- Image format detection not working
- Caching not functioning properly

**Solutions:**

- Check service worker registration:

  ```javascript
  navigator.serviceWorker.register('/mobile-service-worker.js')
    .then(reg => console.log('SW registered:', reg.scope))
    .catch(err => console.error('SW registration failed:', err));
  ```

- Verify service worker is active in DevTools:
  - Open Chrome DevTools
  - Go to Application tab > Service Workers
  - Check if your service worker is listed as active

- Force update the service worker:

  ```javascript
  // Force update
  navigator.serviceWorker.getRegistration().then(reg => {
    if (reg) reg.update();
  });
  ```

- Clear service worker cache:

  ```javascript
  caches.keys().then(cacheNames => {
    return Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
  });
  ```

### 5. Code Splitting Not Working Correctly

**Symptoms:**
- All code loading at once despite dynamic imports
- Features not loading when needed

**Solutions:**

- Check for syntax errors in dynamic imports:

  ```javascript
  // Correct syntax
  async function loadFeature() {
    const module = await import('./feature.js');
    module.initialize();
  }
  ```

- Verify that the bundler is respecting code splitting:
  Configure Vite to preserve dynamic imports:

  ```javascript
  // In vite.mobile.config.js
  export default {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'], // Vendor libraries
            // Feature chunks will be created automatically from dynamic imports
          }
        }
      }
    }
  };
  ```

- Test with browser developer tools:
  - Open Network tab
  - Trigger the feature that uses dynamic import
  - Verify that a new chunk is loaded when needed

### 6. Performance Testing Issues

**Symptoms:**
- Difficult to measure actual performance improvements
- Inconsistent results between tests

**Solutions:**

- Use Chrome Lighthouse for consistent metrics:
  - Open Chrome DevTools
  - Go to Lighthouse tab
  - Run an audit with Performance checked
  - Compare before and after optimization

- Test with throttled connections for realistic mobile testing:
  - In Chrome DevTools Network tab
  - Set throttling to "Slow 3G" or "Fast 3G"
  - Reload the page and measure load times

- Use the Performance tab to analyze JavaScript execution:
  - Record page load and interactions
  - Look for long tasks and optimization opportunities

- Create a performance budget to track improvements:

  ```javascript
  // In vite.mobile.config.js
  export default {
    build: {
      reportCompressedSize: true,
      chunkSizeWarningLimit: 100, // KB
    }
  };
  ```

## Advanced Troubleshooting

### Analyzing Bundle Sizes

To understand what's in your JavaScript bundles:

```powershell
# Install bundle analyzer
npm install rollup-plugin-visualizer --save-dev
```

Then modify your Vite config:

```javascript
// In vite.mobile.config.js
import { visualizer } from 'rollup-plugin-visualizer';

export default {
  plugins: [
    visualizer({
      open: true,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    })
  ]
};
```

### Debugging Service Worker Issues

For more detailed service worker debugging:

```javascript
// Add to your service worker file
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  console.log('[ServiceWorker] Fetch:', event.request.url);
  // Rest of your fetch handler
});
```

## Getting Support

If you're still experiencing issues after trying these solutions:

1. Check the console for specific error messages
2. Review the build logs for errors
3. Create a detailed bug report including:
   - Steps to reproduce
   - Expected vs. actual behavior
   - Browser and OS information
   - Console output and error messages

For more assistance, contact the development team through the #mobile-optimization Slack channel.

### 3. Modern Image Formats Not Working

**Symptoms:**
- Images are still loading as PNG/JPEG instead of WebP/AVIF
- No performance improvement in image loading

**Solutions:**
- Verify browser support for WebP/AVIF:
  - Chrome 32+ and Firefox 65+ support WebP
  - Chrome 85+, Firefox 93+, and Safari 16+ support AVIF

- Check if image conversion worked:
  ```powershell
  # List all image formats in dist folder
  dir dist\*.webp
  dir dist\*.avif
  ```

- Ensure your server is sending the correct MIME types:
  ```javascript
  // Add in your server configuration
  const mimeTypes = {
    '.webp': 'image/webp',
    '.avif': 'image/avif'
  };
  ```

- Test with the `<picture>` element as a fallback mechanism:
  ```html
  <picture>
    <source srcset="image.avif" type="image/avif">
    <source srcset="image.webp" type="image/webp">
    <img src="image.png" alt="Description">
  </picture>
  ```

### 4. Service Worker Issues

**Symptoms:**
- Service worker not registering
- Image format detection not working
- Caching not functioning properly

**Solutions:**
- Check service worker registration:
  ```javascript
  navigator.serviceWorker.register('/mobile-service-worker.js')
    .then(reg => console.log('SW registered:', reg.scope))
    .catch(err => console.error('SW registration failed:', err));
  ```

- Verify service worker is active in DevTools:
  - Open Chrome DevTools
  - Go to Application tab > Service Workers
  - Check if your service worker is listed as active

- Force update the service worker:
  ```javascript
  // Force update
  navigator.serviceWorker.getRegistration().then(reg => {
    if (reg) reg.update();
  });
  ```

- Clear service worker cache:
  ```javascript
  caches.keys().then(cacheNames => {
    return Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
  });
  ```

### 5. Code Splitting Not Working Correctly

**Symptoms:**
- All code loading at once despite dynamic imports
- Features not loading when needed

**Solutions:**
- Check for syntax errors in dynamic imports:
  ```javascript
  // Correct syntax
  async function loadFeature() {
    const module = await import('./feature.js');
    module.initialize();
  }
  ```

- Verify that the bundler is respecting code splitting:
  Configure Vite to preserve dynamic imports:
  ```javascript
  // In vite.mobile.config.js
  export default {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'], // Vendor libraries
            // Feature chunks will be created automatically from dynamic imports
          }
        }
      }
    }
  };
  ```

- Test with browser developer tools:
  - Open Network tab
  - Trigger the feature that uses dynamic import
  - Verify that a new chunk is loaded when needed

### 6. Performance Testing Issues

**Symptoms:**
- Difficult to measure actual performance improvements
- Inconsistent results between tests

**Solutions:**
- Use Chrome Lighthouse for consistent metrics:
  - Open Chrome DevTools
  - Go to Lighthouse tab
  - Run an audit with Performance checked
  - Compare before and after optimization

- Test with throttled connections for realistic mobile testing:
  - In Chrome DevTools Network tab
  - Set throttling to "Slow 3G" or "Fast 3G"
  - Reload the page and measure load times

- Use the Performance tab to analyze JavaScript execution:
  - Record page load and interactions
  - Look for long tasks and optimization opportunities

- Create a performance budget to track improvements:
  ```javascript
  // In vite.mobile.config.js
  export default {
    build: {
      reportCompressedSize: true,
      chunkSizeWarningLimit: 100, // KB
    }
  };
  ```

## Advanced Troubleshooting

### Analyzing Bundle Sizes

To understand what's in your JavaScript bundles:

```powershell
# Install bundle analyzer
npm install rollup-plugin-visualizer --save-dev
```

Then modify your Vite config:

```javascript
// In vite.mobile.config.js
import { visualizer } from 'rollup-plugin-visualizer';

export default {
  plugins: [
    visualizer({
      open: true,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    })
  ]
};
```

### Debugging Service Worker Issues

For more detailed service worker debugging:

```javascript
// Add to your service worker file
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  console.log('[ServiceWorker] Fetch:', event.request.url);
  // Rest of your fetch handler
});
```

## Getting Support

If you're still experiencing issues after trying these solutions:

1. Check the console for specific error messages
2. Review the build logs for errors
3. Create a detailed bug report including:
   - Steps to reproduce
   - Expected vs. actual behavior
   - Browser and OS information
   - Console output and error messages

For more assistance, contact the development team through the #mobile-optimization Slack channel.

- Try the test page to verify bundle loading:
  ```powershell
  npm run test:optimizations
  ```

### 3. Modern Image Formats Not Working

**Symptoms:**
- Only seeing PNG images
- No file size improvement for images

**Solutions:**
- Verify WebP/AVIF files were generated:
  ```powershell
  dir dist\*.webp
  dir dist\*.avif
  ```

- Check browser support:
  Open `dist\image-test.html` to see which formats your browser supports

- Service worker may not be registered:
  Check the "Application" tab in browser dev tools to ensure the service worker is active

### 4. Performance Not Improved

**Symptoms:**
- Page still loads slowly
- Many HTTP requests still visible in Network tab

**Solutions:**
- Verify you're using the optimized version:
  Make sure you're accessing `careunity-mobile.html` from the `dist` directory

- Check network conditions:
  Use browser throttling to test under different network conditions

- Use Performance tab in browser dev tools:
  Look for bottlenecks in loading, scripting, or rendering

## Manual Testing Procedure

1. **Build the optimized version:**
   ```powershell
   npm run build:mobile:full
   ```

2. **Start a local server:**
   ```powershell
   npx http-server dist
   ```

3. **Open the test pages in your browser:**
   - `http://localhost:8080/bundle-test.html` - For testing bundle loading
   - `http://localhost:8080/careunity-mobile.html` - For testing the full application

4. **Use browser developer tools:**
   - Network tab: Check number of requests and file sizes
   - Performance tab: Check loading and rendering metrics
   - Application tab: Verify service worker registration

## Additional Resources

- [Vite Documentation](https://vitejs.dev/guide/)
- [Service Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [WebP Browser Support](https://caniuse.com/webp)
- [AVIF Browser Support](https://caniuse.com/avif)

If you encounter issues not covered in this guide, please refer to the complete documentation in `PERFORMANCE-OPTIMIZATIONS.md` or contact the development team.
