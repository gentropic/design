/**
 * Generate equatorial stereonet SVG paths for the GCU logo
 * Using the same math as Stereonet.js
 * Now with smooth bezier curves!
 */

const center = 300;  // X center of logo
const centerY = 200; // Y center of logo
const radius = 220;  // Larger radius for better fill

function projectVector(v, equalArea = false) {
    let factor;
    if (equalArea) {
        // Equal-area (Lambert/Schmidt) projection - more even distribution
        factor = Math.sqrt(2 / (1 - v.z));
    } else {
        // Equal-angle (stereographic/Wulff) projection - spreads more at edges
        factor = 1 / (1 - v.z);
    }
    const x = center + v.x * radius * factor / (equalArea ? Math.SQRT2 : 1);
    const y = centerY - v.y * radius * factor / (equalArea ? Math.SQRT2 : 1);
    return { x, y };
}

// Convert points to smooth cubic bezier path using Catmull-Rom spline
function pointsToSmoothPath(points, closed = true) {
    if (points.length < 3) return '';

    const n = points.length;
    let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

    for (let i = 0; i < n - 1; i++) {
        // Get 4 points for Catmull-Rom (wrap around for closed curves)
        const p0 = points[(i - 1 + n) % n];
        const p1 = points[i];
        const p2 = points[(i + 1) % n];
        const p3 = points[(i + 2) % n];

        // Convert Catmull-Rom to cubic bezier control points
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }

    if (closed) path += ' Z';
    return path;
}

function generateGreatCircle(dipDirection, dip, plunge=0, equalArea=false) {
    const points = [];
    const dd = dipDirection * Math.PI / 180;
    const d = dip * Math.PI / 180;
    const p = plunge * Math.PI / 180;
    // Plane normal vector
    const normalBase = {
        x: -Math.sin(d) * Math.sin(dd),
        y: -Math.sin(d) * Math.cos(dd),
        z: -Math.cos(d)
    };

    // Direction vector (strike direction)
    const dirBase = {
        x: Math.cos(dd),
        y: -Math.sin(dd),
        z: 0
    };

    // Dip vector
    const dipVecBase = {
        x: Math.cos(d) * Math.sin(dd),
        y: Math.cos(d) * Math.cos(dd),
        z: -Math.sin(d)
    };

    const normal = {
        x: normalBase.x,
        y: normalBase.y * Math.cos(p) - normalBase.z * Math.sin(p),
        z: normalBase.y * Math.sin(p) + normalBase.z * Math.cos(p)
    };

    const dir = {
        x: dirBase.x,
        y: dirBase.y * Math.cos(p) - dirBase.z * Math.sin(p),
        z: dirBase.y * Math.sin(p) + dirBase.z * Math.cos(p)
    };

    const dipVec = {
        x: dipVecBase.x,
        y: dipVecBase.y * Math.cos(p) - dipVecBase.z * Math.sin(p),
        z: dipVecBase.y * Math.sin(p) + dipVecBase.z * Math.cos(p)
    };


    // Fewer steps needed with smooth curves
    const steps = Math.round(24 + dip / 3);
    for (let i = 0; i < steps; i++) {  // Don't include endpoint (closed path)
        const theta = (i / steps) * 2 * Math.PI;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);

        const v = {
            x: dir.x * cosT + dipVec.x * sinT,
            y: dir.y * cosT + dipVec.y * sinT,
            z: dir.z * cosT + dipVec.z * sinT
        };

        points.push(projectVector(v, equalArea));
    }

    return pointsToSmoothPath(points, true);
}

function generateSmallCircle(axisDirection, openingAngle, axisPlunge=0, equalArea=false) {
    const points = [];
    const azimuth = axisDirection * Math.PI / 180;
    const opening = openingAngle * Math.PI / 180;
    const plunge = axisPlunge * Math.PI / 180;

    const axis = {
        x: Math.sin(azimuth)*Math.cos(plunge),
        y: Math.cos(azimuth)*Math.cos(plunge),
        z: -Math.sin(plunge)
    };

    // dir stays horizontal
    const dir = {
        x: Math.cos(azimuth),
        y: -Math.sin(azimuth),
        z: 0
    };

    const dip = {
        x: -Math.sin(azimuth)*Math.sin(plunge),
        y: -Math.cos(azimuth)*Math.sin(plunge),
        z: -Math.cos(plunge)
    };

    const cosOpening = Math.cos(opening);
    const sinOpening = Math.sin(opening);

    // Fewer steps needed with smooth curves
    const steps = Math.round(24 + openingAngle / 3);
    for (let i = 0; i < steps; i++) {  // Don't include endpoint (closed path)
        const theta = (i / steps) * 2 * Math.PI;
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);

        const gc = {
            x: dir.x * cosTheta + dip.x * sinTheta,
            y: dir.y * cosTheta + dip.y * sinTheta,
            z: dir.z * cosTheta + dip.z * sinTheta
        };

        const v = {
            x: axis.x * cosOpening + gc.x * sinOpening,
            y: axis.y * cosOpening + gc.y * sinOpening,
            z: axis.z * cosOpening + gc.z * sinOpening
        };

        points.push(projectVector(v, equalArea));
    }

    return pointsToSmoothPath(points, true);
}

// Generate multiple SVG variants
const fs = require('fs');

function generatePaths() {
    let paths = [];
    // Great circles - E and W dipping
    for (let dip = 15; dip <= 75; dip += 15) {
        paths.push(generateGreatCircle(90, dip));
    }
    for (let dip = 15; dip <= 75; dip += 15) {
        paths.push(generateGreatCircle(270, dip));
    }
    // Small circles - N and S axis
    for (let opening = 15; opening <= 75; opening += 15) {
        paths.push(generateSmallCircle(0, opening));
    }
    for (let opening = 15; opening <= 75; opening += 15) {
        paths.push(generateSmallCircle(180, opening));
    }
    return paths;
}

const paths = generatePaths();
const extend = 800;

function stereonetGroup(opts = {}) {
    const { opacity = 0.12, strokeWidth = 0.75, stroke = '#a0a0a0' } = opts;
    const lines = paths.map(d => `    <path d="${d}"/>`);
    lines.push(`    <line x1="${center}" y1="${centerY - extend}" x2="${center}" y2="${centerY + extend}"/>`);
    lines.push(`    <line x1="${center - extend}" y1="${centerY}" x2="${center + extend}" y2="${centerY}"/>`);
    lines.push(`    <circle cx="${center}" cy="${centerY}" r="${radius}"/>`);
    return `  <g opacity="${opacity}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="none"
     transform="rotate(15, 300, 200) translate(40, -20)">
${lines.join('\n')}
  </g>`;
}

// 1. Main screen version (rectangle)
const svgScreen = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
  <rect x="0" y="0" width="600" height="400" rx="16" ry="16" fill="#2d2d2d"/>
${stereonetGroup({ opacity: 0.15, strokeWidth: 1.5 })}
  <rect x="6" y="6" width="588" height="388" rx="12" ry="12" fill="none" stroke="#b87333" stroke-width="3"/>
  <text x="300" y="245" font-family="'Latin Modern Roman', 'CMU Serif', 'Computer Modern', 'STIX Two Text', Georgia, serif" font-size="140" fill="#b87333" text-anchor="middle">GCU</text>
  <text x="30" y="50" font-family="'Latin Modern Sans', Arial, sans-serif" font-size="20" fill="#b87333" letter-spacing="4" font-weight="bold">GEOSCIENTIFICAL</text>
  <text x="570" y="375" font-family="'Latin Modern Sans', Arial, sans-serif" font-size="20" fill="#b87333" letter-spacing="4" font-weight="bold" text-anchor="end">CHAOS UNION</text>
</svg>`;

// 2. Print version (bolder lines)
const svgPrint = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
  <rect x="0" y="0" width="600" height="400" rx="16" ry="16" fill="#2d2d2d"/>
${stereonetGroup({ opacity: 0.25, strokeWidth: 2.5 })}
  <rect x="6" y="6" width="588" height="388" rx="12" ry="12" fill="none" stroke="#b87333" stroke-width="3"/>
  <text x="300" y="245" font-family="'Latin Modern Roman', 'CMU Serif', 'Computer Modern', 'STIX Two Text', Georgia, serif" font-size="140" fill="#b87333" text-anchor="middle">GCU</text>
  <text x="30" y="50" font-family="'Latin Modern Sans', Arial, sans-serif" font-size="20" fill="#b87333" letter-spacing="4" font-weight="bold">GEOSCIENTIFICAL</text>
  <text x="570" y="375" font-family="'Latin Modern Sans', Arial, sans-serif" font-size="20" fill="#b87333" letter-spacing="4" font-weight="bold" text-anchor="end">CHAOS UNION</text>
</svg>`;

// 3. Square version (icon/social)
const svgSquare = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="100 0 400 400" width="400" height="400">
  <rect x="100" y="0" width="400" height="400" rx="16" ry="16" fill="#2d2d2d"/>
${stereonetGroup({ opacity: 0.15, strokeWidth: 1.5 })}
  <rect x="106" y="6" width="388" height="388" rx="12" ry="12" fill="none" stroke="#b87333" stroke-width="3"/>
  <text x="300" y="200" font-family="'Latin Modern Roman', 'CMU Serif', 'Computer Modern', 'STIX Two Text', Georgia, serif" font-size="120" fill="#b87333" text-anchor="middle">GCU</text>
  <text x="475" y="350" font-family="'Latin Modern Sans', Arial, sans-serif" font-size="14" fill="#b87333" letter-spacing="2" font-weight="bold" text-anchor="end">GEOSCIENTIFICAL</text>
  <text x="475" y="370" font-family="'Latin Modern Sans', Arial, sans-serif" font-size="14" fill="#b87333" letter-spacing="2" font-weight="bold" text-anchor="end">CHAOS UNION</text>
</svg>`;

// 4. Square print version
const svgSquarePrint = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="100 0 400 400" width="400" height="400">
  <rect x="100" y="0" width="400" height="400" rx="16" ry="16" fill="#2d2d2d"/>
${stereonetGroup({ opacity: 0.25, strokeWidth: 2.5 })}
  <rect x="106" y="6" width="388" height="388" rx="12" ry="12" fill="none" stroke="#b87333" stroke-width="3"/>
  <text x="300" y="200" font-family="'Latin Modern Roman', 'CMU Serif', 'Computer Modern', 'STIX Two Text', Georgia, serif" font-size="120" fill="#b87333" text-anchor="middle">GCU</text>
  <text x="475" y="350" font-family="'Latin Modern Sans', Arial, sans-serif" font-size="14" fill="#b87333" letter-spacing="2" font-weight="bold" text-anchor="end">GEOSCIENTIFICAL</text>
  <text x="475" y="370" font-family="'Latin Modern Sans', Arial, sans-serif" font-size="14" fill="#b87333" letter-spacing="2" font-weight="bold" text-anchor="end">CHAOS UNION</text>
</svg>`;

// 5. Light version (for light backgrounds)
const svgLight = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
  <rect x="0" y="0" width="600" height="400" rx="16" ry="16" fill="#f5f5f5"/>
${stereonetGroup({ opacity: 0.15, strokeWidth: 1.5, stroke: '#555555' })}
  <rect x="6" y="6" width="588" height="388" rx="12" ry="12" fill="none" stroke="#8b5a2b" stroke-width="3"/>
  <text x="300" y="245" font-family="'Latin Modern Roman', 'CMU Serif', 'Computer Modern', 'STIX Two Text', Georgia, serif" font-size="140" fill="#8b5a2b" text-anchor="middle">GCU</text>
  <text x="30" y="50" font-family="'Latin Modern Sans', Arial, sans-serif" font-size="20" fill="#8b5a2b" letter-spacing="4" font-weight="bold">GEOSCIENTIFICAL</text>
  <text x="570" y="375" font-family="'Latin Modern Sans', Arial, sans-serif" font-size="20" fill="#8b5a2b" letter-spacing="4" font-weight="bold" text-anchor="end">CHAOS UNION</text>
</svg>`;

// 6. Icon parameters - similar to favicon but for larger size
const ICON_PLUNGE = 15;              // Plunge angle
const ICON_GC_DIPS = [0, 30, 60];       // Great circle dip angles
const ICON_SC_OPENS = [30, 60];      // Small circle opening angles
const ICON_ROTATION = 15;            // Overall rotation

function generateIconPaths() {
    let paths = [];

    // Great circles with rake (plunge effect)
    for (const dip of ICON_GC_DIPS) {
        paths.push(generateGreatCircle(90, dip, -ICON_PLUNGE));
        paths.push(generateGreatCircle(90, 90 + dip, -ICON_PLUNGE));
    }

    // paths.push(generateGreatCircle(90, 90, -ICON_PLUNGE));

    // Small circles with plunge
    for (const opening of ICON_SC_OPENS) {
        paths.push(generateSmallCircle(0, opening, ICON_PLUNGE));
        paths.push(generateSmallCircle(180, opening, -ICON_PLUNGE));
    }

    // Equator (90° small circle)
    paths.push(generateSmallCircle(0, 90, ICON_PLUNGE));

    return paths;
}

function iconStereonetGroup(opts = {}) {
    const { opacity = 0.25, strokeWidth = 2, stroke = '#a0a0a0' } = opts;
    const iconPaths = generateIconPaths();
    const lines = iconPaths.map(d => `    <path d="${d}"/>`);
    // Add primitive circle
    lines.push(`    <circle cx="${center}" cy="${centerY}" r="${radius}"/>`);
    return `  <g opacity="${opacity}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="none"
     transform="rotate(${ICON_ROTATION}, 300, 200) translate(65, 35)">
${lines.join('\n')}
  </g>`;
}

const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="100 0 400 400" width="128" height="128">
  <rect x="100" y="0" width="400" height="400" rx="32" ry="32" fill="#2d2d2d"/>
${iconStereonetGroup({ opacity: 0.3, strokeWidth: 3 })}
  <text x="300" y="240" font-family="'Latin Modern Roman', 'CMU Serif', Georgia, serif" font-size="160" font-weight="500" fill="#b87333" text-anchor="middle">GCU</text>
</svg>`;

// Oblique stereonet favicon - using real projection math
// Parameters to tweak:
const FAVICON_PLUNGE = 16;        // Plunge angle for small circles
const FAVICON_GC_DIPS = [45];     // Great circle dip angles to show
const FAVICON_SC_OPENS = [48];    // Small circle opening angles to show
const FAVICON_ROTATION = 15;      // Overall SVG rotation

const FAVICON_EQUAL_AREA = true;  // Use equal-area projection for favicons

function generateFaviconPaths() {
    let paths = [];

    // Great circles (E and W dipping)
    for (const dip of FAVICON_GC_DIPS) {
        paths.push(generateGreatCircle(90, dip, -FAVICON_PLUNGE, FAVICON_EQUAL_AREA));
        paths.push(generateGreatCircle(90, 90+dip, -FAVICON_PLUNGE, FAVICON_EQUAL_AREA));
    }

    // Small circles with plunge (N and S axis)
    for (const opening of FAVICON_SC_OPENS) {
        paths.push(generateSmallCircle(0, opening, FAVICON_PLUNGE, FAVICON_EQUAL_AREA));
        paths.push(generateSmallCircle(180, opening, -FAVICON_PLUNGE, FAVICON_EQUAL_AREA));
    }

    paths.push(generateSmallCircle(0, 90, FAVICON_PLUNGE, FAVICON_EQUAL_AREA));

    return paths;
}

function faviconStereonetGroup(scale, opts = {}) {
    const { opacity = 1, strokeWidth = 1.5, stroke = '#b87333' } = opts;
    const paths = generateFaviconPaths();

    // Scale and center: original is centered at (300, 200) with radius 220
    // We need to transform to fit the favicon size
    const offsetX = 300;
    const offsetY = 200;
    const clipId = 'clip-' + opts.size;

    // IMPORTANT: strokeWidth must be compensated for the scale transform!
    // If we apply strokeWidth before scale(0.032), an 8px stroke becomes 0.256px
    // So we divide by scale to get the desired final width
    const compensatedStrokeWidth = strokeWidth / scale;

    let svg = paths.map(d => `<path d="${d}"/>`).join('\n    ');

    return `<defs>
    <clipPath id="${clipId}">
      <circle cx="${center}" cy="${centerY}" r="${radius}" transform="rotate(${FAVICON_ROTATION}, ${center}, ${centerY})"/>
    </clipPath>
  </defs>
  <g opacity="${opacity}" stroke="${stroke}" stroke-width="${compensatedStrokeWidth}" fill="none"
     transform="translate(${-offsetX * scale + (opts.size/2)}, ${-offsetY * scale + (opts.size/2)}) scale(${scale}) rotate(${FAVICON_ROTATION}, ${center}, ${centerY})"
     clip-path="url(#${clipId})">
    ${svg}
  </g>
  <circle cx="${opts.size/2}" cy="${opts.size/2}" r="${radius * scale}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="none" opacity="${opacity}"
     transform="rotate(${FAVICON_ROTATION}, ${opts.size/2}, ${opts.size/2})"/>`;
}

// Now that stroke widths are properly compensated for scale, use final pixel values
const STROKE_WIDTH_FAVICON = 1;      // 1.5px effective
const STROKE_WIDTH_FAVICON_16 = 1.5;     // 2px effective (thicker for tiny size)

// 7. Favicon 64 - oblique stereonet + GCU
const svgFavicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="8" fill="#2d2d2d"/>
${faviconStereonetGroup(64/500, { size: 64, opacity: 0.4, stroke: '#a0a0a0', strokeWidth: STROKE_WIDTH_FAVICON })}
  <text x="32" y="44" font-family="Georgia, serif" font-size="28" font-weight="bold" fill="#b87333" text-anchor="middle">GCU</text>
</svg>`;

// 8. Favicon 32 - oblique stereonet symbol
const svgFavicon32 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect width="32" height="32" rx="4" fill="#2d2d2d"/>
${faviconStereonetGroup(32/500, { size: 32, strokeWidth: STROKE_WIDTH_FAVICON })}
</svg>`;

// 9. Favicon 16 - oblique stereonet symbol
const svgFavicon16 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
  <rect width="16" height="16" rx="2" fill="#2d2d2d"/>
${faviconStereonetGroup(16/500, { size: 16, strokeWidth: STROKE_WIDTH_FAVICON_16 })}
</svg>`;

// 10. Favicon 16 transparent - just copper stereonet lines, no background
const svgFavicon16Trans = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
${faviconStereonetGroup(16/500, { size: 16, strokeWidth: STROKE_WIDTH_FAVICON_16 })}
</svg>`;

// 11. Favicon 32 transparent - just copper stereonet lines, no background
const svgFavicon32Trans = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
${faviconStereonetGroup(32/500, { size: 32, strokeWidth: STROKE_WIDTH_FAVICON })}
</svg>`;

// 12. Computatro et Malleo - with border
const svgMalleo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
  <rect x="0" y="0" width="600" height="400" rx="16" ry="16" fill="#2d2d2d"/>
${stereonetGroup({ opacity: 0.15, strokeWidth: 1.5 })}
  <rect x="6" y="6" width="588" height="388" rx="12" ry="12" fill="none" stroke="#b87333" stroke-width="3"/>
  <text x="300" y="180" font-family="'Latin Modern Roman', 'CMU Serif', 'Computer Modern', 'STIX Two Text', Georgia, serif" font-size="90" fill="#b87333" text-anchor="middle">Computatro</text>
  <text x="300" y="285" font-family="'Latin Modern Roman', 'CMU Serif', 'Computer Modern', 'STIX Two Text', Georgia, serif" font-size="90" fill="#b87333" text-anchor="middle">et Malleo</text>
</svg>`;

// 13. Computatro et Malleo - no border
const svgMalleoNoBorder = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
  <rect x="0" y="0" width="600" height="400" rx="16" ry="16" fill="#2d2d2d"/>
${stereonetGroup({ opacity: 0.18, strokeWidth: 1.5 })}
  <text x="300" y="180" font-family="'Latin Modern Roman', 'CMU Serif', 'Computer Modern', 'STIX Two Text', Georgia, serif" font-size="90" fill="#b87333" text-anchor="middle">Computatro</text>
  <text x="300" y="285" font-family="'Latin Modern Roman', 'CMU Serif', 'Computer Modern', 'STIX Two Text', Georgia, serif" font-size="90" fill="#b87333" text-anchor="middle">et Malleo</text>
</svg>`;

fs.writeFileSync('gcu-logo.svg', svgScreen);
fs.writeFileSync('gcu-logo-print.svg', svgPrint);
fs.writeFileSync('gcu-logo-square.svg', svgSquare);
fs.writeFileSync('gcu-logo-square-print.svg', svgSquarePrint);
fs.writeFileSync('gcu-logo-light.svg', svgLight);
fs.writeFileSync('gcu-logo-icon.svg', svgIcon);
fs.writeFileSync('gcu-favicon-64.svg', svgFavicon);
fs.writeFileSync('gcu-favicon-32.svg', svgFavicon32);
fs.writeFileSync('gcu-favicon-16.svg', svgFavicon16);
fs.writeFileSync('gcu-favicon-16-transparent.svg', svgFavicon16Trans);
fs.writeFileSync('gcu-favicon-32-transparent.svg', svgFavicon32Trans);
fs.writeFileSync('gcu-malleo.svg', svgMalleo);
fs.writeFileSync('gcu-malleo-noborder.svg', svgMalleoNoBorder);

console.log('Generated 13 variants:');
console.log('  gcu-logo.svg                   - Screen version (rectangle)');
console.log('  gcu-logo-print.svg             - Print version (bolder lines)');
console.log('  gcu-logo-square.svg            - Square for social/icons');
console.log('  gcu-logo-square-print.svg      - Square print version');
console.log('  gcu-logo-light.svg             - Light background version');
console.log('  gcu-logo-icon.svg              - Icon (128x128)');
console.log('  gcu-favicon-64.svg             - Favicon 64x64 (circle+cross+GCU)');
console.log('  gcu-favicon-32.svg             - Favicon 32x32 (circle+GCU)');
console.log('  gcu-favicon-16.svg             - Favicon 16x16 (stereonet symbol)');
console.log('  gcu-favicon-16-transparent.svg - Favicon 16x16 transparent');
console.log('  gcu-favicon-32-transparent.svg - Favicon 32x32 transparent');
console.log('  gcu-malleo.svg                 - Computatro et Malleo (with border)');
console.log('  gcu-malleo-noborder.svg        - Computatro et Malleo (no border)');
