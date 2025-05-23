# Cross-Platform Build Issues

**Symptoms:**
- Build works on one OS but fails on another
- Path-related errors on different operating systems

**Solutions:**

- Use path separators consistently:

  ```javascript
  // Good - uses the correct separator for current OS
  import { resolve } from 'path';
  const filePath = resolve(__dirname, 'folder', 'file.js');
  ```

- Ensure your npm scripts work cross-platform:

  ```json
  // In package.json
  "scripts": {
    "build:mobile": "vite build --config vite.mobile.config.js",
    "preview:mobile": "vite preview --config vite.mobile.config.js"
  }
  ```

- Use the `cross-env` package for environment variables:

  ```powershell
  npm install cross-env --save-dev
  ```

  ```json
  // In package.json
  "scripts": {
    "build:mobile:prod": "cross-env NODE_ENV=production vite build --config vite.mobile.config.js"
  }
  ```

# Optimizing Third-Party Dependencies

**Symptoms:**
- Large bundle sizes despite optimizations
- Slow loading times due to heavy dependencies

**Solutions:**

- Analyze dependencies with `npm ls`:

  ```powershell
  npm ls --depth=0
  ```

- Replace heavy libraries with lighter alternatives:

  | Heavy Library | Lighter Alternative |
  |---------------|---------------------|
  | Moment.js     | date-fns            |
  | Lodash        | lodash-es (tree-shakable) |
  | jQuery        | DOM APIs            |

- Use dynamic imports for heavy dependencies:

  ```javascript
  // Only load chart.js when needed
  async function showChart() {
    const { Chart } = await import('chart.js');
    // Create chart
  }
  ```

- Configure tree-shaking for better dead code elimination:

  ```javascript
  // In vite.mobile.config.js
  export default {
    build: {
      target: 'es2015',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          passes: 2,
        }
      }
    }
  };
  ```

# Network Optimization Tips

## Reducing API Payload Sizes

**Symptoms:**
- Slow data loading despite optimized frontend
- Large network payloads for API calls

**Solutions:**

- Implement server-side pagination:

  ```javascript
  // Client request
  fetch('/api/data?page=1&limit=20')
    .then(response => response.json())
    .then(data => renderItems(data.items));
  ```

- Use field filtering to request only needed data:

  ```javascript
  // Client request
  fetch('/api/users?fields=id,name,email')
    .then(response => response.json())
    .then(users => renderUsers(users));
  ```

- Enable compression on API responses:

  ```javascript
  // Server-side Express configuration
  const compression = require('compression');
  app.use(compression());
  ```

## Prefetching and Preloading

**Symptoms:**
- Navigation feels slow despite optimized bundles
- Resources load only when explicitly requested

**Solutions:**

- Use `<link rel="prefetch">` for likely navigation:

  ```html
  <!-- Prefetch likely next page -->
  <link rel="prefetch" href="/assets/care-plan-features.js">
  ```

- Implement intelligent prefetching based on user behavior:

  ```javascript
  // When user hovers over a navigation link
  function prefetchOnHover(event) {
    const url = event.target.href;
    if (!url) return;
    
    // Create prefetch link
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  }
  
  // Add to all navigation links
  document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('mouseenter', prefetchOnHover);
  });
  ```

- Use the Network Information API to avoid prefetching on slow connections:

  ```javascript
  function shouldPrefetch() {
    if (!navigator.connection) return true;
    
    // Avoid prefetching on slow or expensive connections
    return !(
      navigator.connection.saveData ||
      navigator.connection.effectiveType === 'slow-2g' ||
      navigator.connection.effectiveType === '2g'
    );
  }
  ```

# Testing and Verification

## Automated Performance Testing

**Symptoms:**
- Manual testing is inconsistent
- Difficult to track performance changes over time

**Solutions:**

- Implement Lighthouse CI for automated testing:

  ```powershell
  # Install Lighthouse CI
  npm install -g @lhci/cli
  
  # Run Lighthouse CI
  lhci autorun
  ```

- Create a `.lighthouserc.js` configuration:

  ```javascript
  // .lighthouserc.js
  module.exports = {
    ci: {
      collect: {
        url: ['http://localhost:3000/'],
        numberOfRuns: 3,
      },
      assert: {
        assertions: {
          'first-contentful-paint': ['warn', {maxNumericValue: 2000}],
          'interactive': ['error', {maxNumericValue: 3500}],
          'max-potential-fid': ['warn', {maxNumericValue: 100}],
          'cumulative-layout-shift': ['warn', {maxNumericValue: 0.1}],
          'largest-contentful-paint': ['warn', {maxNumericValue: 2500}],
        },
      },
      upload: {
        target: 'temporary-public-storage',
      },
    },
  };
  ```

- Add performance testing to your CI/CD pipeline:

  ```yaml
  # In .github/workflows/performance.yml
  name: Performance Testing
  on: [push]
  jobs:
    lighthouse:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - name: Use Node.js
          uses: actions/setup-node@v3
          with:
            node-version: '16'
        - run: npm ci
        - run: npm run build
        - run: npm run start & npx wait-on http://localhost:3000
        - name: Run Lighthouse CI
          run: npx @lhci/cli autorun
  ```

## Real Device Testing

**Symptoms:**
- Performance in simulators doesn't match real devices
- Optimizations work on high-end but not low-end devices

**Solutions:**

- Test on actual representative devices:
  - Low-end Android (e.g., Android Go device)
  - Mid-range Android (e.g., Samsung A-series)
  - iOS device (both newer and older models)

- Use BrowserStack or similar services for testing:

  ```powershell
  # Install BrowserStack CLI
  npm install -g browserstack-cypress-cli
  
  # Configure and run tests
  browserstack-cypress run
  ```

- Create device-specific optimizations:

  ```javascript
  // Detect device capabilities
  function getDeviceTier() {
    // Low-end device detection
    const isLowEnd = 
      navigator.deviceMemory < 2 || // Less than 2GB RAM
      navigator.hardwareConcurrency < 4; // Less than 4 cores
    
    return isLowEnd ? 'low' : 'high';
  }
  
  // Load appropriate resources
  if (getDeviceTier() === 'low') {
    // Load lightweight charts
    import('./lightweight-charts.js');
  } else {
    // Load full-featured charts
    import('./advanced-charts.js');
  }
  ```

# Crisis Management for Production Issues

## Quick Recovery Steps

If optimizations cause production issues:

1. **Revert to Last Known Good Configuration:**

   ```powershell
   # Revert to previous build
   cd dist-backup
   xcopy /E /Y . ..\dist\
   ```

2. **Implement Feature Flags for Gradual Rollout:**

   ```javascript
   // Feature flag system
   const FEATURES = {
     USE_OPTIMIZED_IMAGES: false,
     USE_CODE_SPLITTING: true,
     USE_SERVICE_WORKER: false
   };
   
   // Usage
   if (FEATURES.USE_OPTIMIZED_IMAGES) {
     // Load optimized images logic
   } else {
     // Fall back to original images
   }
   ```

3. **Set Up A/B Testing for Optimizations:**

   ```javascript
   // Randomly assign users to test or control group
   const userGroup = Math.random() < 0.5 ? 'test' : 'control';
   localStorage.setItem('optimization_group', userGroup);
   
   // Apply optimizations based on group
   if (localStorage.getItem('optimization_group') === 'test') {
     // Apply new optimizations
   } else {
     // Use original code path
   }
   ```

4. **Create Performance Monitoring Dashboard:**

   Use tools like:
   - Google Analytics performance events
   - New Relic or Datadog for real-time monitoring
   - Custom performance logging with `window.performance` API

   ```javascript
   // Send performance metrics to analytics
   function reportPerformance() {
     const metrics = {
       FCP: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
       LCP: performance.getEntriesByName('largest-contentful-paint')[0]?.startTime,
       TTI: performance.getEntriesByName('first-input-delay')[0]?.processingStart
     };
     
     // Send to analytics
     navigator.sendBeacon('/analytics', JSON.stringify(metrics));
   }
   ```
