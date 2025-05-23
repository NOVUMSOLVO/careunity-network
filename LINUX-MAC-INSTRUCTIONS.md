# Linux/Mac Build Instructions

When using the `build-optimized.sh` script on Linux or Mac systems, make sure to set the proper executable permissions:

```bash
# Clone the repository
git clone https://github.com/careunity/network.git
cd network

# Add executable permissions to the build script
chmod +x build-optimized.sh

# Run the build script
./build-optimized.sh
```

## Troubleshooting

If you encounter line ending issues (which can happen when scripts are created on Windows systems), you may need to fix them:

```bash
# Fix line endings
sed -i 's/\r$//' build-optimized.sh
chmod +x build-optimized.sh
```

## Alternative Build Method

If you prefer not to use the shell script, you can run the build commands directly:

```bash
# Install dependencies
npm install

# Run the optimization build
npx vite build --config vite.mobile.config.js

# Start the server to test
npx http-server dist
```

Then open a browser and navigate to `http://localhost:8080/careunity-mobile-module.html`
