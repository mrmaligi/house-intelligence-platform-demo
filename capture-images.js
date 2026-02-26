const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = './data/698-armstrong-road-wyndham-vale-vic-3024/images/captured';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const IMAGES = [
    {
        name: 'streetview_front',
        url: 'https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=-37.8923,144.6234&heading=0&pitch=0',
        width: 1280,
        height: 720
    },
    {
        name: 'streetview_back',
        url: 'https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=-37.8923,144.6234&heading=180&pitch=0',
        width: 1280,
        height: 720
    },
    {
        name: 'satellite_close',
        url: 'https://www.google.com/maps/@-37.8923,144.6234,20z/data=!3m1!1e3',
        width: 1280,
        height: 720
    },
    {
        name: 'map_view',
        url: 'https://www.google.com/maps/search/698+Armstrong+Road,+Wyndham+Vale+VIC+3024/@-37.8923,144.6234,17z',
        width: 1280,
        height: 720
    }
];

async function captureImage(browser, imageSpec) {
    console.log(`Capturing: ${imageSpec.name}...`);
    
    const page = await browser.newPage();
    await page.setViewport({ width: imageSpec.width, height: imageSpec.height });
    
    try {
        await page.goto(imageSpec.url, { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        // Wait for map to load
        await page.waitForTimeout(5000);
        
        // Take screenshot
        const outputPath = path.join(OUTPUT_DIR, `${imageSpec.name}.png`);
        await page.screenshot({ 
            path: outputPath,
            fullPage: false 
        });
        
        console.log(`✓ Saved: ${outputPath}`);
        
    } catch (error) {
        console.error(`✗ Failed: ${imageSpec.name} - ${error.message}`);
    } finally {
        await page.close();
    }
}

async function main() {
    console.log('Starting image capture for 698 Armstrong Road...\n');
    
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    for (const image of IMAGES) {
        await captureImage(browser, image);
    }
    
    await browser.close();
    
    console.log('\n✅ Capture complete!');
    console.log(`Images saved to: ${OUTPUT_DIR}`);
}

main().catch(console.error);
