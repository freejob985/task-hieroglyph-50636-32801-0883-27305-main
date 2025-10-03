const fs = require('fs');
const path = require('path');

// SVG template for different sizes
const createIconSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background Circle -->
  <circle cx="256" cy="256" r="240" fill="url(#gradient)" stroke="url(#gradient2)" stroke-width="8"/>
  
  <!-- Checkmark Circle -->
  <circle cx="256" cy="180" r="60" fill="white" opacity="0.9"/>
  <path d="M236 180L248 192L276 164" stroke="#8b5cf6" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  
  <!-- Task List Lines -->
  <rect x="120" y="280" width="200" height="8" rx="4" fill="white" opacity="0.8"/>
  <rect x="120" y="300" width="160" height="8" rx="4" fill="white" opacity="0.6"/>
  <rect x="120" y="320" width="180" height="8" rx="4" fill="white" opacity="0.7"/>
  <rect x="120" y="340" width="140" height="8" rx="4" fill="white" opacity="0.5"/>
  
  <!-- Plus Icon for Add Task -->
  <circle cx="380" cy="320" r="25" fill="white" opacity="0.9"/>
  <path d="M370 320H390M380 310V330" stroke="#8b5cf6" stroke-width="4" stroke-linecap="round"/>
  
  <!-- Sparkle Effects -->
  <circle cx="150" cy="150" r="3" fill="white" opacity="0.8"/>
  <circle cx="350" cy="120" r="2" fill="white" opacity="0.6"/>
  <circle cx="400" cy="200" r="2.5" fill="white" opacity="0.7"/>
  <circle cx="100" cy="250" r="2" fill="white" opacity="0.5"/>
  <circle cx="420" cy="280" r="3" fill="white" opacity="0.8"/>
  
  <!-- Gradients -->
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#a855f7;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#c084fc;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7c3aed;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#a855f7;stop-opacity:1" />
    </linearGradient>
  </defs>
</svg>`;

// Icon sizes for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG files for each size
iconSizes.forEach(size => {
  const svgContent = createIconSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, svgContent);
  console.log(`✅ Created ${filename}`);
});

// Create shortcut icons
const createShortcutIcon = (type, size) => {
  const iconMap = {
    'add': {
      circle: { cx: 256, cy: 256, r: 240 },
      main: `<circle cx="256" cy="200" r="50" fill="white" opacity="0.9"/>
             <path d="M236 200H276M256 180V220" stroke="#8b5cf6" stroke-width="8" stroke-linecap="round"/>`
    },
    'stats': {
      circle: { cx: 256, cy: 256, r: 240 },
      main: `<rect x="180" y="180" width="20" height="120" rx="10" fill="white" opacity="0.9"/>
             <rect x="220" y="200" width="20" height="100" rx="10" fill="white" opacity="0.8"/>
             <rect x="260" y="160" width="20" height="140" rx="10" fill="white" opacity="0.9"/>
             <rect x="300" y="220" width="20" height="80" rx="10" fill="white" opacity="0.7"/>`
    }
  };
  
  const config = iconMap[type];
  return `
<svg width="${size}" height="${size}" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="${config.circle.cx}" cy="${config.circle.cy}" r="${config.circle.r}" fill="url(#gradient)"/>
  ${config.main}
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#a855f7;stop-opacity:1" />
    </linearGradient>
  </defs>
</svg>`;
};

// Generate shortcut icons
['add', 'stats'].forEach(type => {
  const svgContent = createShortcutIcon(type, 96);
  const filename = `shortcut-${type}.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, svgContent);
  console.log(`✅ Created ${filename}`);
});

console.log('\n🎉 All icons generated successfully!');
console.log('📝 Note: SVG files created. For production, convert to PNG using a tool like Inkscape or online converters.');

