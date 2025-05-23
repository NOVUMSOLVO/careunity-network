// Vite configuration for mobile-specific builds
import { defineConfig } from 'vite';
import { resolve } from 'path';
import imagemin from 'vite-plugin-imagemin';

export default defineConfig({
  // Base public path
  base: './',

  // Define entry points for bundle optimization
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'esbuild',
    sourcemap: false,    rollupOptions: {
      input: {
        'main': resolve(__dirname, 'careunity-mobile-module.html'),
        'offline': resolve(__dirname, 'offline.html'),
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // Create bundles based on functionality
        manualChunks: (id) => {
          if (id.includes('careunity-voice')) {
            return 'voice-features';
          } else if (id.includes('careunity-care-plan')) {
            return 'care-plan-features';
          } else if (id.includes('careunity-biometric')) {
            return 'biometric-features';
          } else if (id.includes('careunity-sync') || id.includes('careunity-conflict')) {
            return 'sync-features';
          } else if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    },
    // Configure Terser minification options
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },

  // Add image optimization plugin
  plugins: [
    imagemin({
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false,
      },
      optipng: {
        optimizationLevel: 7,
      },
      mozjpeg: {
        quality: 80,
      },
      pngquant: {
        quality: [0.8, 0.9],
        speed: 4,
      },
      svgo: {
        plugins: [
          {
            name: 'removeViewBox',
            active: false,
          },
          {
            name: 'removeEmptyAttrs',
            active: false,
          },
        ],
      },
      webp: {
        quality: 80,
      },
    }),
  ],

  // Enable code splitting through dynamic imports
  optimizeDeps: {
    include: []
  }
});
