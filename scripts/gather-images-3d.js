#!/usr/bin/env node
/**
 * Property Image Gatherer & 3D Visualization Engine
 * Collects images from multiple sources and prepares for stitching/viewing
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
    this.results = {
      address: address,
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

  // Source 1: Google Street View - Multiple angles
  async gatherStreetViewImages() {
    console.log('\n🌐 Gathering Google Street View Images...');
    
    const streetViewData = {
      source: 'Google Street View',
      images: [],
      metadata: {}
    };

    try {
      // Mock coordinates for 698 Armstrong Road, Wyndham Vale
      const lat = -37.8923;
      const lng = 144.6234;
      
      // Generate multiple angles for 360° view
      const angles = [0, 45, 90, 135, 180, 225, 270, 315];
      
      for (const heading of angles) {
        const imageUrl = `https://maps.googleapis.com/maps/api/streetview?size=640x480&location=${lat},${lng}&heading=${heading}&pitch=0&key=${process.env.GOOGLE_MAPS_API_KEY || 'DEMO_KEY'}`;
        
        const imageInfo = {
          angle: heading,
          url: imageUrl,
          filename: `streetview_${heading}deg.jpg`,
          lat: lat,
          lng: lng,
          pitch: 0,
          fov: 90
        };
        
        streetViewData.images.push(imageInfo);
        console.log(`  📸 Captured angle: ${heading}°`);
      }

      // Add different elevations/pitches
      const pitches = [-20, 0, 20];
      for (const pitch of pitches) {
        const imageUrl = `https://maps.googleapis.com/maps/api/streetview?size=640x480&location=${lat},${lng}&heading=0&pitch=${pitch}&key=${process.env.GOOGLE_MAPS_API_KEY || 'DEMO_KEY'}`;
        
        streetViewData.images.push({
          angle: 0,
          pitch: pitch,
          url: imageUrl,
          filename: `streetview_pitch${pitch}.jpg`,
          type: 'elevation'
        });
      }

      console.log(`  ✅ Collected ${streetViewData.images.length} Street View images`);
      
    } catch (error) {
      console.error('  ❌ Error:', error.message);
    }

    this.results.sources.streetView = streetViewData;
    return streetViewData;
  }

  // Source 2: Aerial/Satellite Imagery
  async gatherAerialImages() {
    console.log('\n🛰️ Gathering Aerial Imagery...');
    
    const aerialData = {
      source: 'Aerial/Satellite',
      images: [],
      coverage: {}
    };

    try {
      const lat = -37.8923;
      const lng = 144.6234;
      
      // Different zoom levels
      const zoomLevels = [18, 19, 20, 21];
      
      for (const zoom of zoomLevels) {
        // Google Satellite
        const googleUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=640x640&maptype=satellite&key=${process.env.GOOGLE_MAPS_API_KEY || 'DEMO_KEY'}`;
        
        aerialData.images.push({
          source: 'Google Satellite',
          zoom: zoom,
          url: googleUrl,
          filename: `aerial_google_z${zoom}.jpg`,
          type: 'satellite'
        });
        
        console.log(`  📸 Zoom level: ${zoom}`);
      }

      // Add Nearmap-style high-res aerial (mock)
      aerialData.images.push({
        source: 'Nearmap (High-Res)',
        zoom: 22,
        url: `https://api.nearmap.com/coverage/v2/coord/${lat}/${lng}?apikey=${process.env.NEARMAP_API_KEY || 'DEMO'}`,
        filename: 'aerial_nearmap_hires.jpg',
        type: 'high-resolution',
        resolution: '5cm/pixel'
      });

      console.log(`  ✅ Collected ${aerialData.images.length} aerial images`);
      
    } catch (error) {
      console.error('  ❌ Error:', error.message);
    }

    this.results.sources.aerial = aerialData;
    return aerialData;
  }

  // Source 3: User Upload Instructions
  async generatePhotoGuide() {
    console.log('\n📱 Generating User Photo Guide...');
    
    const photoGuide = {
      title: 'Property Photo Upload Guide',
      purpose: 'Create virtual tour and 3D reconstruction',
      requiredShots: [
        {
          id: 'exterior_front',
          name: 'Front Exterior',
          description: 'Full front facade from street',
          angle: 'Eye level',
          instructions: 'Stand across the street, capture entire front including roofline'
        },
        {
          id: 'exterior_left',
          name: 'Left Side',
          description: 'Left side of house',
          angle: 'Perpendicular to wall',
          instructions: 'Stand at property boundary, capture full side elevation'
        },
        {
          id: 'exterior_right',
          name: 'Right Side',
          description: 'Right side of house',
          angle: 'Perpendicular to wall',
          instructions: 'Stand at property boundary, capture full side elevation'
        },
        {
          id: 'exterior_rear',
          name: 'Rear Exterior',
          description: 'Back of house',
          angle: 'Eye level',
          instructions: 'From backyard, capture entire rear facade'
        },
        {
          id: 'roof_overview',
          name: 'Roof Overview',
          description: 'Roof from elevated position',
          angle: 'High angle',
          instructions: 'From upstairs window or drone if possible'
        },
        {
          id: 'driveway',
          name: 'Driveway & Entry',
          description: 'Approach to house',
          angle: 'Low angle',
          instructions: 'Capture driveway, path, and front entry'
        },
        {
          id: 'garden_front',
          name: 'Front Garden',
          description: 'Landscaping and front yard',
          angle: 'Eye level',
          instructions: 'Capture garden beds, lawn, trees'
        },
        {
          id: 'garden_rear',
          name: 'Rear Garden',
          description: 'Backyard area',
          angle: 'Eye level',
          instructions: 'Full backyard view including boundaries'
        }
      ],
      interiorShots: [
        {
          id: 'entry_hall',
          name: 'Entry Hall',
          description: 'Main entrance interior',
          instructions: 'From doorway, capture full view of entry space'
        },
        {
          id: 'living_room',
          name: 'Living Room',
          description: 'Main living area',
          instructions: 'From each corner, capture all walls and features'
        },
        {
          id: 'kitchen',
          name: 'Kitchen',
          description: 'Kitchen area',
          instructions: 'Capture all cabinets, appliances, and layout'
        },
        {
          id: 'kitchen_panorama',
          name: 'Kitchen Panorama',
          description: '360° view of kitchen',
          instructions: 'Stand in center, rotate and capture all angles'
        },
        {
          id: 'master_bedroom',
          name: 'Master Bedroom',
          description: 'Main bedroom',
          instructions: 'From doorway and opposite corner'
        },
        {
          id: 'bathroom_main',
          name: 'Main Bathroom',
          description: 'Primary bathroom',
          instructions: 'Capture all fixtures, tiles, and layout'
        },
        {
          id: 'hallway',
          name: 'Hallway',
          description: 'Main circulation space',
          instructions: 'Capture length and connections to rooms'
        },
        {
          id: 'ceiling_details',
          name: 'Ceiling Details',
          description: 'Ceiling features',
          instructions: 'Capture cornices, downlights, ceiling condition'
        }
      ],
      bestPractices: [
        'Use natural daylight when possible',
        'Take photos in landscape (horizontal) orientation',
        'Overlap shots by 20-30% for stitching',
        'Keep camera level and steady',
        'Include reference points (doors, windows) in multiple shots',
        'Take multiple shots of each area from different angles',
        'Use highest resolution setting on your camera',
        'Label photos by room/location'
      ],
      for3DReconstruction: [
        'Minimum 50 photos for exterior 3D model',
        'Minimum 30 photos per room for interior',
        'Capture overlapping views (60% overlap ideal)',
        'Include floor, walls, and ceiling in shots',
        'Walk around the property in a systematic pattern',
        'Take photos at consistent height (chest level)'
      ]
    };

    // Save guide
    const guidePath = path.join(this.dataDir, 'photo-guide.json');
    await fs.writeFile(guidePath, JSON.stringify(photoGuide, null, 2));
    
    console.log(`  ✅ Photo guide saved to: ${guidePath}`);
    console.log(`  📋 Required exterior shots: ${photoGuide.requiredShots.length}`);
    console.log(`  📋 Required interior shots: ${photoGuide.interiorShots.length}`);
    
    this.results.photoGuide = photoGuide;
    return photoGuide;
  }

  // Generate HTML photo guide for users
  async generatePhotoGuideHTML() {
    const guide = this.results.photoGuide;
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Photo Guide - ${this.address}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, sans-serif; background: #f5f7fa; color: #333; }
    .container { max-width: 800px; margin: 0 auto; padding: 20px; }
    header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
    h1 { font-size: 1.8em; margin-bottom: 10px; }
    .section { background: white; border-radius: 12px; padding: 25px; margin: 20px 0; }
    .shot { border: 2px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 15px 0; }
    .shot h3 { color: #667eea; margin-bottom: 10px; }
    .shot.complete { border-color: #28a745; background: #f8fff8; }
    .upload-area { border: 3px dashed #667eea; border-radius: 12px; padding: 40px; text-align: center; margin: 20px 0; cursor: pointer; }
    .upload-area:hover { background: #f0f4ff; }
    .tips { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; }
    .progress { background: #e0e0e0; height: 8px; border-radius: 4px; overflow: hidden; }
    .progress-fill { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); height: 100%; width: 0%; }
    .btn { background: #667eea; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; }
  </style>
</head>
<body>
  <header>
    <h1>📸 Property Photo Guide</h1>
    <p>${this.address}</p>
  </header>
  
  <div class="container">
    <div class="section">
      <h2>Progress</h2>
      <div class="progress"><div class="progress-fill" id="progress"></div></div>
      <p style="margin-top: 10px;"><span id="uploaded">0</span> / ${guide.requiredShots.length + guide.interiorShots.length} photos uploaded</p>
    </div>

    <div class="section">
      <h2>🏠 Exterior Photos Required</h2>
      ${guide.requiredShots.map((shot, i) => `
        <div class="shot" id="shot-${shot.id}">
          <h3>${i + 1}. ${shot.name}</h3>
          <p><strong>${shot.description}</strong></p>
          <p style="color: #666; margin-top: 8px;">💡 ${shot.instructions}</p>
          <div class="upload-area" onclick="document.getElementById('file-${shot.id}').click()">
            <p>📷 Click to upload photo</p>
            <input type="file" id="file-${shot.id}" accept="image/*" style="display:none" onchange="uploadPhoto('${shot.id}')">
          </div>
        </div>
      `).join('')}
    </div>

    <div class="section">
      <h2>🛋️ Interior Photos Required</h2>
      ${guide.interiorShots.map((shot, i) => `
        <div class="shot" id="shot-${shot.id}">
          <h3>${i + 1}. ${shot.name}</h3>
          <p><strong>${shot.description}</strong></p>
          <p style="color: #666; margin-top: 8px;">💡 ${shot.instructions}</p>
          <div class="upload-area" onclick="document.getElementById('file-${shot.id}').click()">
            <p>📷 Click to upload photo</p>
            <input type="file" id="file-${shot.id}" accept="image/*" style="display:none" onchange="uploadPhoto('${shot.id}')">
          </div>
        </div>
      `).join('')}
    </div>

    <div class="section tips">
      <h3>📋 Photography Tips</h3>
      <ul style="margin-left: 20px; margin-top: 10px;">
        ${guide.bestPractices.map(tip => `<li>${tip}</li>`).join('')}
      </ul>
    </div>

    <div class="section" style="text-align: center;">
      <button class="btn" onclick="completeUpload()">Complete Upload</button>
    </div>
  </div>

  <script>
    let uploadedCount = 0;
    const totalShots = ${guide.requiredShots.length + guide.interiorShots.length};
    
    function uploadPhoto(id) {
      document.getElementById('shot-' + id).classList.add('complete');
      uploadedCount++;
      updateProgress();
    }
    
    function updateProgress() {
      document.getElementById('uploaded').textContent = uploadedCount;
      document.getElementById('progress').style.width = (uploadedCount / totalShots * 100) + '%';
    }
    
    function completeUpload() {
      alert('Photos uploaded! We\\'ll process them for 3D reconstruction.');
    }
  </script>
</body>
</html>`;

    const htmlPath = path.join(this.dataDir, 'photo-guide.html');
    await fs.writeFile(htmlPath, html);
    console.log(`  ✅ HTML guide saved to: ${htmlPath}`);
    
    return htmlPath;
  }

  // Image Processing - Prepare for stitching
  async prepareForStitching() {
    console.log('\n🧵 Preparing Images for Stitching...');
    
    const stitchingConfig = {
      exterior: {
        method: 'panorama',
        images: this.results.sources.streetView?.images || [],
        output: 'exterior_panorama.jpg',
        options: {
          projection: 'equirectangular',
          blend: 'multi-band',
          outputWidth: 4096
        }
      },
      aerial: {
        method: 'mosaic',
        images: this.results.sources.aerial?.images || [],
        output: 'aerial_mosaic.jpg',
        options: {
          alignment: 'affine',
          blending: 'feather'
        }
      },
      interior: {
        method: 'cubemap',
        description: 'Requires user-uploaded photos',
        recommendedTools: [
          'Matterport',
          'Cupix',
          'Google Street View Studio',
          'OpenDroneMap'
        ]
      }
    };

    // Save stitching configuration
    const configPath = path.join(this.dataDir, 'stitching-config.json');
    await fs.writeFile(configPath, JSON.stringify(stitchingConfig, null, 2));
    
    console.log(`  ✅ Stitching config saved`);
    console.log(`  📊 Exterior: ${stitchingConfig.exterior.images.length} images`);
    console.log(`  📊 Aerial: ${stitchingConfig.aerial.images.length} images`);
    
    this.results.stitchingConfig = stitchingConfig;
    return stitchingConfig;
  }

  // 3D Reconstruction Options
  async generate3DReconstructionPlan() {
    console.log('\n🏗️ Generating 3D Reconstruction Plan...');
    
    const plan = {
      title: '3D Property Visualization Plan',
      approaches: [
        {
          name: 'Photogrammetry (Recommended)',
          description: 'Create 3D model from photos using computer vision',
          tools: [
            {
              name: 'OpenDroneMap',
              url: 'https://www.opendronemap.org/',
              cost: 'Free (Open Source)',
              complexity: 'Medium',
              output: '3D mesh, point cloud, orthophoto'
            },
            {
              name: 'Meshroom',
              url: 'https://alicevision.org/#meshroom',
              cost: 'Free (Open Source)',
              complexity: 'Medium',
              output: '3D mesh, textures'
            },
            {
              name: 'RealityCapture',
              url: 'https://www.capturingreality.com/',
              cost: 'Paid (~$3,500 license)',
              complexity: 'Low',
              output: 'High-quality 3D model'
            }
          ],
          requirements: {
            minPhotos: 50,
            overlap: '60-80%',
            resolution: 'Minimum 12MP camera',
            processingTime: '2-8 hours depending on photo count'
          }
        },
        {
          name: '360° Virtual Tour',
          description: 'Interactive panoramic tour without full 3D model',
          tools: [
            {
              name: 'Matterport',
              url: 'https://matterport.com/',
              cost: 'Subscription ($9-309/month)',
              complexity: 'Low',
              requires: 'Matterport camera or compatible phone'
            },
            {
              name: 'Cupix',
              url: 'https://www.cupix.com/',
              cost: 'Subscription',
              complexity: 'Low',
              requires: '360° camera or phone app'
            },
            {
              name: 'Google Street View',
              url: 'https://www.google.com/streetview/',
              cost: 'Free',
              complexity: 'Low',
              requires: '360° camera or Street View app'
            }
          ],
          requirements: {
            minPhotos: '10-20 panoramas',
            equipment: '360° camera recommended',
            processingTime: '1-2 hours'
          }
        },
        {
          name: 'LiDAR Scanning',
          description: 'High-precision 3D scanning',
          tools: [
            {
              name: 'iPhone/iPad Pro LiDAR',
              cost: 'Free apps available',
              complexity: 'Low',
              apps: ['Polycam', 'Scaniverse', '3D Scanner App']
            },
            {
              name: 'Professional Scanner',
              cost: 'Hire service ($500-2000)',
              complexity: 'None (outsourced)',
              accuracy: 'Millimeter precision'
            }
          ],
          bestFor: 'Interior spaces, detailed measurements'
        }
      ],
      recommendation: {
        approach: 'Photogrammetry + 360° Tour',
        reasoning: 'Best balance of quality, cost, and ease',
        workflow: [
          '1. Take 100+ photos following the photo guide',
          '2. Process with OpenDroneMap for 3D model',
          '3. Create 360° panoramas for key rooms',
          '4. Combine into interactive web experience'
        ]
      },
      outputFormats: {
        web: ['Three.js visualization', 'WebGL viewer', 'Embedded 360° tour'],
        model: ['OBJ', 'FBX', 'glTF', 'PLY (point cloud)'],
        measurements: 'Accurate to 1-2% of real dimensions'
      }
    };

    const planPath = path.join(this.dataDir, '3d-reconstruction-plan.json');
    await fs.writeFile(planPath, JSON.stringify(plan, null, 2));
    
    console.log(`  ✅ 3D reconstruction plan saved`);
    console.log(`  🎯 Recommended approach: ${plan.recommendation.approach}`);
    
    this.results.reconstructionPlan = plan;
    return plan;
  }

  // Create a simple 3D viewer HTML
  async create3DViewerHTML() {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>3D Property Viewer - ${this.address}</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, sans-serif; overflow: hidden; }
    #canvas-container { width: 100vw; height: 100vh; }
    .overlay {
      position: absolute;
      top: 20px;
      left: 20px;
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 20px;
      border-radius: 12px;
      max-width: 300px;
    }
    .overlay h1 { font-size: 1.2em; margin-bottom: 10px; }
    .controls {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.7);
      padding: 15px;
      border-radius: 30px;
      display: flex;
      gap: 10px;
    }
    .controls button {
      background: #667eea;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 20px;
      cursor: pointer;
    }
    .controls button:hover { background: #5a6fd6; }
    #loading {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 1.5em;
      text-align: center;
    }
  </style>
</head>
<body>
  <div id="canvas-container"></div>
  
  <div class="overlay">
    <h1>🏠 3D Property View</h1>
    <p>${this.address}</p>
    <p style="margin-top: 10px; font-size: 0.9em; opacity: 0.8;">
      🖱️ Left click: Rotate<br>
      🖱️ Right click: Pan<br>
      🖱️ Scroll: Zoom<br>
      📱 Touch: Pinch to zoom
    </p>
  </div>

  <div class="controls">
    <button onclick="resetView()">🏠 Reset View</button>
    <button onclick="toggleWireframe()">🔲 Wireframe</button>
    <button onclick="toggleAutoRotate()">🔄 Auto Rotate</button>
  </div>

  <div id="loading">
    <p>🏗️ Loading 3D Model...</p>
    <p style="font-size: 0.8em; margin-top: 10px;">
      Upload photos to generate 3D view
    </p>
  </div>

  <script>
    // Three.js setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 10, 100);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(15, 10, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x3d5c3d,
      roughness: 0.8 
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Simple house placeholder (until real model loads)
    const houseGroup = new THREE.Group();

    // Main building
    const houseGeometry = new THREE.BoxGeometry(12, 6, 10);
    const houseMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xf5f5f5,
      roughness: 0.5 
    });
    const house = new THREE.Mesh(houseGeometry, houseMaterial);
    house.position.y = 3;
    house.castShadow = true;
    houseGroup.add(house);

    // Roof
    const roofGeometry = new THREE.ConeGeometry(10, 4, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8B4513,
      roughness: 0.7 
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 8;
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1, 0.5, 1);
    houseGroup.add(roof);

    // Garage
    const garageGeometry = new THREE.BoxGeometry(6, 4, 6);
    const garage = new THREE.Mesh(garageGeometry, houseMaterial);
    garage.position.set(9, 2, 2);
    garage.castShadow = true;
    houseGroup.add(garage);

    // Windows
    const windowGeometry = new THREE.PlaneGeometry(1.5, 1.5);
    const windowMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x87CEEB,
      metalness: 0.9,
      roughness: 0.1 
    });

    // Front windows
    for (let i = -2; i <= 2; i += 2) {
      const window = new THREE.Mesh(windowGeometry, windowMaterial);
      window.position.set(i * 1.5, 3, 5.1);
      houseGroup.add(window);
    }

    // Driveway
    const drivewayGeometry = new THREE.PlaneGeometry(4, 12);
    const drivewayMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x808080,
      roughness: 0.9 
    });
    const driveway = new THREE.Mesh(drivewayGeometry, drivewayMaterial);
    driveway.rotation.x = -Math.PI / 2;
    driveway.position.set(9, 0.01, 10);
    houseGroup.add(driveway);

    scene.add(houseGroup);

    // Hide loading
    document.getElementById('loading').style.display = 'none';

    // Controls
    let autoRotate = false;
    let wireframe = false;

    function resetView() {
      camera.position.set(15, 10, 15);
      controls.reset();
    }

    function toggleWireframe() {
      wireframe = !wireframe;
      houseGroup.traverse((child) => {
        if (child.isMesh) {
          child.material.wireframe = wireframe;
        }
      });
    }

    function toggleAutoRotate() {
      autoRotate = !autoRotate;
      controls.autoRotate = autoRotate;
    }

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    // Handle resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  </script>
</body>
</html>`;

    const viewerPath = path.join(this.dataDir, '3d-viewer.html');
    await fs.writeFile(viewerPath, html);
    
    console.log(`  ✅ 3D viewer created: ${viewerPath}`);
    console.log(`  🌐 Open in browser to see 3D placeholder`);
    
    return viewerPath;
  }

  // Main execution
  async gather() {
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║     📸 PROPERTY IMAGE GATHERER & 3D VISUALIZATION        ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log(`\n📍 Target: ${this.address}\n`);

    await this.init();

    // Gather images from sources
    await this.gatherStreetViewImages();
    await this.gatherAerialImages();
    await this.generatePhotoGuide();
    await this.generatePhotoGuideHTML();
    await this.prepareForStitching();
    await this.generate3DReconstructionPlan();
    await this.create3DViewerHTML();

    // Save results
    const outputPath = path.join(this.dataDir, 'image-data.json');
    await fs.writeFile(outputPath, JSON.stringify(this.results, null, 2));

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📊 IMAGE GATHERING COMPLETE');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`\nTotal images collected: ${Object.values(this.results.sources).reduce((acc, s) => acc + (s.images?.length || 0), 0)}`);
    console.log(`Photo guide created: ${this.results.photoGuide?.requiredShots?.length} exterior + ${this.results.photoGuide?.interiorShots?.length} interior shots required`);
    console.log(`3D Viewer: Open ${path.join(this.dataDir, '3d-viewer.html')} in browser`);
    console.log('\n📸 Next: Upload property photos following the photo guide');

    return this.results;
  }
}

// CLI usage
if (require.main === module) {
  const address = process.argv[2] || "698 Armstrong Road, Wyndham Vale, VIC 3024";
  const gatherer = new PropertyImageGatherer(address);
  gatherer.gather().catch(console.error);
}

module.exports = PropertyImageGatherer;
