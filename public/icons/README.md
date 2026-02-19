# PWA Icons

This directory should contain the following icon files for the Progressive Web App:

- `icon-192x192.png` - 192x192 pixels
- `icon-512x512.png` - 512x512 pixels

## How to Generate Icons

### Option 1: Use an Online Tool
- Visit https://realfavicongenerator.net/
- Upload your logo/icon
- Generate and download all sizes

### Option 2: Use ImageMagick
```bash
# Install ImageMagick
brew install imagemagick  # macOS
sudo apt-get install imagemagick  # Linux

# Generate from a source image
convert source.png -resize 192x192 icon-192x192.png
convert source.png -resize 512x512 icon-512x512.png
```

### Option 3: Create Simple Placeholder
For testing purposes, you can create simple colored squares:

```bash
# Create 192x192 placeholder (requires ImageMagick)
convert -size 192x192 xc:#4F46E5 -pointsize 72 -fill white -gravity center -annotate +0+0 "OA" icon-192x192.png

# Create 512x512 placeholder
convert -size 512x512 xc:#4F46E5 -pointsize 192 -fill white -gravity center -annotate +0+0 "OA" icon-512x512.png
```

## Requirements
- PNG format
- Square dimensions
- Transparent or solid background
- Clear, recognizable icon
- Optimized file size (< 50KB each)
