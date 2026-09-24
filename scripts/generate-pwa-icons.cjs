const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 1. Standard Brand SVG (for display, home screen, and favicon)
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B0F19"/>
      <stop offset="50%" stop-color="#080C14"/>
      <stop offset="100%" stop-color="#04060A"/>
    </linearGradient>
    <linearGradient id="neonCyan" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#22D3EE"/>
      <stop offset="100%" stop-color="#06B6D4"/>
    </linearGradient>
    <linearGradient id="neonViolet" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#A78BFA"/>
      <stop offset="100%" stop-color="#8B5CF6"/>
    </linearGradient>
    <linearGradient id="bladeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E0E7FF"/>
      <stop offset="50%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#818CF8"/>
    </linearGradient>
    <radialGradient id="glowGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#06B6D4" stop-opacity="0.35"/>
      <stop offset="50%" stop-color="#8B5CF6" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#06B6D4" stop-opacity="0"/>
    </radialGradient>
    <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="10" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background with subtle border -->
  <rect width="512" height="512" rx="110" fill="url(#bgGrad)" />
  <rect x="6" y="6" width="500" height="500" rx="104" fill="none" stroke="url(#neonCyan)" stroke-width="4" stroke-opacity="0.35" />

  <!-- Ambient glow backdrop -->
  <circle cx="256" cy="240" r="180" fill="url(#glowGlow)" />

  <!-- Hexagonal Tech Shield Outer -->
  <polygon points="256,64 420,154 420,334 256,424 92,334 92,154" 
           fill="#0F172A" fill-opacity="0.75" 
           stroke="url(#neonCyan)" stroke-width="8" stroke-linejoin="round"
           filter="url(#glowFilter)" />
  
  <polygon points="256,84 398,164 398,324 256,404 114,324 114,164" 
           fill="none" 
           stroke="url(#neonViolet)" stroke-width="3" stroke-dasharray="8 6" stroke-opacity="0.6" />

  <!-- Crossed Battle Swords & Energy Core -->
  <g transform="translate(256, 240)">
    <!-- Sword 1 (Rotated -45deg) -->
    <g transform="rotate(-45)">
      <rect x="-8" y="-120" width="16" height="180" rx="4" fill="url(#bladeGrad)" />
      <polygon points="0,-140 -12,-110 12,-110" fill="#38BDF8" />
      <rect x="-24" y="60" width="48" height="10" rx="4" fill="#64748B" />
      <rect x="-6" y="70" width="12" height="30" rx="3" fill="#334155" />
      <circle cx="0" cy="106" r="8" fill="#38BDF8" />
    </g>

    <!-- Sword 2 (Rotated 45deg) -->
    <g transform="rotate(45)">
      <rect x="-8" y="-120" width="16" height="180" rx="4" fill="url(#bladeGrad)" />
      <polygon points="0,-140 -12,-110 12,-110" fill="#38BDF8" />
      <rect x="-24" y="60" width="48" height="10" rx="4" fill="#64748B" />
      <rect x="-6" y="70" width="12" height="30" rx="3" fill="#334155" />
      <circle cx="0" cy="106" r="8" fill="#38BDF8" />
    </g>

    <!-- Stylized Central "A" Crest / Power Core -->
    <circle cx="0" cy="0" r="42" fill="#090D16" stroke="url(#neonCyan)" stroke-width="6" />
    <path d="M-18,22 L0,-24 L18,22 L10,22 L4,6 L-4,6 L-10,22 Z M-2,0 L2,0 L0,-12 Z" 
          fill="url(#neonCyan)" />
  </g>

  <!-- AKTU ARENA Badge Text -->
  <rect x="136" y="420" width="240" height="42" rx="10" fill="#0B1120" stroke="url(#neonCyan)" stroke-width="2" />
  <text x="256" y="448" text-anchor="middle" font-family="'Outfit', sans-serif" font-weight="900" font-size="20" fill="#F8FAFC" letter-spacing="4">
    AKTU ARENA
  </text>
</svg>`;

// 2. Maskable Icon (safe zone padded 15% on all sides)
const svgMaskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGradM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B0F19"/>
      <stop offset="50%" stop-color="#080C14"/>
      <stop offset="100%" stop-color="#04060A"/>
    </linearGradient>
    <linearGradient id="neonCyanM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#22D3EE"/>
      <stop offset="100%" stop-color="#06B6D4"/>
    </linearGradient>
    <linearGradient id="neonVioletM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#A78BFA"/>
      <stop offset="100%" stop-color="#8B5CF6"/>
    </linearGradient>
    <linearGradient id="bladeGradM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E0E7FF"/>
      <stop offset="50%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#818CF8"/>
    </linearGradient>
    <radialGradient id="glowGlowM" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#06B6D4" stop-opacity="0.4"/>
      <stop offset="50%" stop-color="#8B5CF6" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#06B6D4" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Full bleed background for Android maskable cropping -->
  <rect width="512" height="512" fill="url(#bgGradM)" />
  <circle cx="256" cy="256" r="230" fill="url(#glowGlowM)" />

  <!-- Centered inside 80% Safe Zone (scaled & centered around 256, 256) -->
  <g transform="translate(256, 256) scale(0.78) translate(-256, -240)">
    <!-- Hexagonal Tech Shield Outer -->
    <polygon points="256,64 420,154 420,334 256,424 92,334 92,154" 
             fill="#0F172A" fill-opacity="0.85" 
             stroke="url(#neonCyanM)" stroke-width="9" stroke-linejoin="round" />
    
    <polygon points="256,84 398,164 398,324 256,404 114,324 114,164" 
             fill="none" 
             stroke="url(#neonVioletM)" stroke-width="4" stroke-dasharray="8 6" stroke-opacity="0.7" />

    <!-- Crossed Battle Swords & Energy Core -->
    <g transform="translate(256, 240)">
      <g transform="rotate(-45)">
        <rect x="-8" y="-120" width="16" height="180" rx="4" fill="url(#bladeGradM)" />
        <polygon points="0,-140 -12,-110 12,-110" fill="#38BDF8" />
        <rect x="-24" y="60" width="48" height="10" rx="4" fill="#64748B" />
        <rect x="-6" y="70" width="12" height="30" rx="3" fill="#334155" />
        <circle cx="0" cy="106" r="8" fill="#38BDF8" />
      </g>
      <g transform="rotate(45)">
        <rect x="-8" y="-120" width="16" height="180" rx="4" fill="url(#bladeGradM)" />
        <polygon points="0,-140 -12,-110 12,-110" fill="#38BDF8" />
        <rect x="-24" y="60" width="48" height="10" rx="4" fill="#64748B" />
        <rect x="-6" y="70" width="12" height="30" rx="3" fill="#334155" />
        <circle cx="0" cy="106" r="8" fill="#38BDF8" />
      </g>
      <circle cx="0" cy="0" r="42" fill="#090D16" stroke="url(#neonCyanM)" stroke-width="6" />
      <path d="M-18,22 L0,-24 L18,22 L10,22 L4,6 L-4,6 L-10,22 Z M-2,0 L2,0 L0,-12 Z" 
            fill="url(#neonCyanM)" />
    </g>

    <!-- AKTU ARENA Badge Text -->
    <rect x="136" y="420" width="240" height="42" rx="10" fill="#0B1120" stroke="url(#neonCyanM)" stroke-width="2" />
    <text x="256" y="448" text-anchor="middle" font-family="'Outfit', sans-serif" font-weight="900" font-size="20" fill="#F8FAFC" letter-spacing="4">
      AKTU ARENA
    </text>
  </g>
</svg>`;

async function run() {
  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // 1. Write SVG icons
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgIcon);
  fs.writeFileSync(path.join(publicDir, 'icon-maskable.svg'), svgMaskable);

  // 2. Generate 512x512 standard PNG
  await sharp(Buffer.from(svgIcon))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  // 3. Generate 192x192 standard PNG
  await sharp(Buffer.from(svgIcon))
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  // 4. Generate 512x512 maskable PNG
  await sharp(Buffer.from(svgMaskable))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  // 5. Generate 180x180 Apple Touch Icon PNG
  await sharp(Buffer.from(svgIcon))
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // 6. Generate 64x64 and 32x32 Favicon PNG
  await sharp(Buffer.from(svgIcon))
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));

  console.log('Successfully generated all PWA icons in public/');
}

run().catch(console.error);
