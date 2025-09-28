// createPlaceholders.js
const fs = require('fs');
const path = require('path');

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname, 'src', 'public', 'images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
    console.log('Created images directory:', imagesDir);
}

// Check if ppid.jpg exists, if not create a placeholder
const ppidPath = path.join(imagesDir, 'ppid.jpg');
if (!fs.existsSync(ppidPath)) {
    // Simple SVG content for placeholder
    const ppidSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#2e7d32" />
        <text x="100" y="100" font-family="Arial" font-size="24" fill="white" text-anchor="middle" alignment-baseline="middle">PPID Logo</text>
    </svg>`;
    
    // Write to file
    fs.writeFileSync(ppidPath.replace('.jpg', '.svg'), ppidSvg);
    console.log('Created placeholder for PPID logo:', ppidPath.replace('.jpg', '.svg'));
}

// Check if kota-madiun.jpeg exists, if not create a placeholder
const madiunPath = path.join(imagesDir, 'kota-madiun.jpeg');
if (!fs.existsSync(madiunPath)) {
    // Simple SVG content for placeholder
    const madiunSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="300" viewBox="0 0 500 300">
        <rect width="500" height="300" fill="#81c784" />
        <text x="250" y="150" font-family="Arial" font-size="24" fill="white" text-anchor="middle" alignment-baseline="middle">Kota Madiun</text>
    </svg>`;
    
    // Write to file
    fs.writeFileSync(madiunPath.replace('.jpeg', '.svg'), madiunSvg);
    console.log('Created placeholder for Kota Madiun image:', madiunPath.replace('.jpeg', '.svg'));
}

console.log('Placeholders created successfully!');