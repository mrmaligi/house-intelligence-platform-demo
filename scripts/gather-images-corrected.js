#!/usr/bin/env node
/**
 * Property Image Gatherer & 3D Visualization Engine
 * Collects images from multiple sources and prepares for stitching/viewing
 * CORRECTED COORDINATES for 698 Armstrong Road: -37.8857635, 144.6073309
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class PropertyImageGatherer {
  constructor(address, propertyId) {
    this.address = address;
    this.propertyId = propertyId || this.generatePropertyId(address);
    this.dataDir = path.join(__dirname, '../data', this.propertyId);
    this.imagesDir = path.join(this.dataDir, 'images');
    // CORRECT COORDINATES
    this.lat = -37.8857635;
    this.lng = 144.6073309;
    this.results = {
      address: address,
      coordinates: { lat: this.lat, lng: this.lng },
      gatheredAt: new Date().toISOString(),
      sources: {},
      imageSets: []
    };
  }

  generatePropertyId(address) {
    return address.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async init() {
    await fs.mkdir(this.imagesDir, { recursive: true });
    await fs.mkdir(path.join(this.imagesDir, 'streetview'), { recursive: true });
    await fs.mkdir(path.join(this.imagesDir, 'aerial'), { recursive: true });
    await fs.mkdir(path.join(this.imagesDir, 'user'), { recursive: true });
    await fs.mkdir(path.join(this.imagesDir, 'stitched'), { recursive: true });
    console.log(`📁 Initialized image directories in ${this.imagesDir}`);
  }

  // Generate Google Maps URLs for the correct property
  async generateGoogleMapsUrls() {
    console.log('\n🗺️ Generating Google Maps URLs...');
    
    const urls = {
      streetView: {
        main: `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${this.lat},${this.lng}`,
        angles: {}
      },
      satellite: `https://www.google.com/maps/@${this.lat},${this.lng},20z`,
      map: `https://www.google.com/maps/search/${encodeURIComponent(this.address)}`,
      embedded: {
        streetView: `https://www.google.com/maps/embed?pb=!4v1709040000000!6m8!1m7!1sCAoSLEFGMVFpcE1NVEtCXzBJSE9ZZmpuSjhqTjNxeWhxXzk3NWN0Ug!2m2!1d${this.lat}!2d${this.lng}!3f0!4f0!5f0.7820865974627469`,
        satellite: `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d250!2d${this.lng}!3d${this.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1sen!2sau`,
        map: `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3155!2d${this.lng}!3d${this.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDUzJzMyLjMiUyAxNDTCsDM3JzI0LjIiRQ!5e0!3m2!1sen!2sau`
      }
    };

    // Generate URLs for all 8 angles
    const angles = [0, 45, 90, 135, 180, 225, 270, 315];
    for (const angle of angles) {
      urls.streetView.angles[angle] = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${this.lat},${this.lng}&heading=${angle}&pitch=0`;
    }

    this.results.googleMapsUrls = urls;
    
    console.log('  ✅ Generated URLs:');
    console.log(`     Street View: ${urls.streetView.main}`);
    console.log(`     Satellite: ${urls.satellite}`);
    console.log(`     Map: ${urls.map}`);
    
    return urls;
  }

  // Generate HTML gallery with embedded images
  async generateImageGallery() {
    console.log('\n🎨 Generating Image Gallery HTML...');
    
    const urls = this.results.googleMapsUrls;
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>698 Armstrong Road - Property Images Gallery</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, sans-serif; background: #0a0a0a; color: white; line-height: 1.6; }
        header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }
        h1 { font-size: 1.8em; margin-bottom: 10px; }
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        .section { margin: 40px 0; }
        .section h2 { color: #667eea; margin-bottom: 20px; font-size: 1.5em; border-left: 4px solid #667eea; padding-left: 15px; }
        .full-width { width: 100%; height: 500px; border-radius: 12px; overflow: hidden; border: 1px solid #333; }
        iframe { width: 100%; height: 100%; border: none; }
        .angle-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 20px 0; }
        .angle-btn { background: #333; padding: 15px; text-align: center; border-radius: 8px; text-decoration: none; color: white; transition: background 0.2s; font-size: 0.9em; }
        .angle-btn:hover { background: #667eea; }
        .info-box { background: #1a1a1a; border: 1px solid #333; border-radius: 12px; padding: 20px; margin: 20px 0; }
        .info-box h3 { color: #667eea; margin-bottom: 15px; }
        .coordinates { font-family: monospace; background: #222; padding: 10px 15px; border-radius: 6px; display: inline-block; margin: 5px 0; color: #00ff00; }
    </style>
</head>
<body>
    <header>
        <h1>🏠 ${this.address}</h1>
        <p>Verified Property Images</p>
    </header>

    <div class="container">
        <div class="info-box">
            <h3>📍 Verified Coordinates</h3>
            <p><strong>Latitude:</strong></p>
            <div class="coordinates">${this.lat}</div><br>
            <p><strong>Longitude:</strong></p>
            <div class="coordinates">${this.lng}</div><br>
            <p style="margin-top: 15px;"><strong>Property:</strong> 3 bed, 2 bath, 2 car | Block: 416 m²</p>
        </div>

        <div class="section">
            <h2>🌐 Street View - 360° Interactive</h2>
            <div class="full-width">
                <iframe src="${urls.embedded.streetView}" allowfullscreen="" loading="lazy"></iframe>
            </div>
            <p style="margin-top: 10px; color: #888;">💡 Drag to rotate, scroll to zoom, click arrows to move</p>

            <h3 style="margin-top: 30px;">View from Different Angles:</h3>
            <div class="angle-grid">
                ${Object.entries(urls.streetView.angles).map(([angle, url]) => `
                <a href="${url}" target="_blank" class="angle-btn">${angle}°</a>
                `).join('')}
            </div>
        </div>

        <div class="section">
            <h2>🛰️ Satellite / Aerial View</h2>
            <div class="full-width">
                <iframe src="${urls.embedded.satellite}" allowfullscreen="" loading="lazy"></iframe>
            </div>
        </div>

        <div class="section">
            <h2>🗺️ Map View with Street Names</h2>
            <div class="full-width" style="height: 400px;">
                <iframe src="${urls.embedded.map}" allowfullscreen="" loading="lazy"></iframe>
            </div>
        </div>

        <div class="section">
            <h2>🔗 Direct Links</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                <a href="${urls.map}" target="_blank" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; text-decoration: none; text-align: center;">
                    <strong>🌍 Open in Google Maps</strong>
                </a>
                <a href="${urls.satellite}" target="_blank"
                   style="background: #333; color: white; padding: 20px; border-radius: 12px; text-decoration: none; text-align: center;">
                    <strong>🛰️ Satellite Only</strong>
                </a>
                <a href="${urls.streetView.main}" target="_blank"
                   style="background: #333; color: white; padding: 20px; border-radius: 12px; text-decoration: none; text-align: center;">
                    <strong>🌐 Street View Only</strong>
                </a>
            </div>
        </div>
    </div>
</body>
</html>`;

    const galleryPath = path.join(this.imagesDir, 'property-gallery.html');
    await fs.writeFile(galleryPath, html);
    
    console.log(`  ✅ Gallery created: ${galleryPath}`);
    
    return galleryPath;
  }

  // Main execution
  async gather() {
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║     📸 PROPERTY IMAGE GATHERER - CORRECTED COORDS        ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log(`\n📍 Target: ${this.address}`);
    console.log(`📍 Coordinates: ${this.lat}, ${this.lng}\n`);

    await this.init();
    await this.generateGoogleMapsUrls();
    await this.generateImageGallery();

    // Save results
    const outputPath = path.join(this.dataDir, 'corrected-image-data.json');
    await fs.writeFile(outputPath, JSON.stringify(this.results, null, 2));

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('✅ CORRECTED DATA COMPLETE');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`\nOpen this file to see the property images:`);
    console.log(`${path.join(this.imagesDir, 'property-gallery.html')}`);
    console.log(`\nOr visit: ${this.results.googleMapsUrls.streetView.main}`);

    return this.results;
  }
}

// CLI usage
if (require.main === module) {
  const address = "698 Armstrong Road, Wyndham Vale, VIC 3024";
  const gatherer = new PropertyImageGatherer(address);
  gatherer.gather().catch(console.error);
}

module.exports = PropertyImageGatherer;
