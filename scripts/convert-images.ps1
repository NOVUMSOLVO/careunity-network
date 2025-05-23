# PowerShell script for converting images to modern formats
Write-Host "==================================="
Write-Host "Converting Images to Modern Formats"
Write-Host "==================================="

# Create dist directory if it doesn't exist
if (-not (Test-Path -Path "dist")) {
    New-Item -Path "dist" -ItemType Directory
}

# Check if sharp module is installed
try {
    $sharpCheck = npm list sharp --depth=0
    if (-not $sharpCheck -like "*sharp@*") {
        Write-Host "Installing sharp module..."
        npm install sharp --save-dev
    }
} catch {
    Write-Host "Installing sharp module..."
    npm install sharp --save-dev
}

# Use Node to run the image conversion script
Write-Host "Running image conversion script..."
node scripts/image-converter.js

# Check if conversion was successful
if (Test-Path -Path "dist/icon-test.webp" -and Test-Path -Path "dist/icon-test.avif") {
    Write-Host "Conversion successful!"
    Write-Host "Original image size:"
    Get-Item -Path "dist/icon-test.png" | Select-Object Name, Length
    Write-Host "WebP image size:"
    Get-Item -Path "dist/icon-test.webp" | Select-Object Name, Length
    Write-Host "AVIF image size:"
    Get-Item -Path "dist/icon-test.avif" | Select-Object Name, Length
} else {
    Write-Host "Some conversions failed. Check the logs above for details."
}

Write-Host "==================================="
Write-Host "Image conversion process complete"
Write-Host "==================================="""
