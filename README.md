# House Intelligence Platform

## 🏠 Property Intelligence & Renovation Estimation System

A comprehensive platform for gathering property data, assessing renovation needs, estimating budgets, and allocating contractors.

**Target Property:** 698 Armstrong Road, Wyndham Vale, VIC 3024

---

## 🎯 Features

### 1. Automated Data Gathering
- **Real Estate Data:** Property values, sales history, market trends
- **Google Maps Integration:** Street view, satellite imagery, nearby amenities
- **Council Data:** Zoning, planning overlays, rates information
- **Historical Data:** Previous sales, price trends
- **Aerial Imagery:** Roof measurements, land analysis

### 2. 📸 Image Collection & 3D Visualization
- **Street View Images:** 360° views from multiple angles
- **Aerial Imagery:** Satellite photos at multiple zoom levels
- **Photo Guide:** Step-by-step guide for homeowners to upload photos
- **3D Reconstruction:** Photogrammetry plan for creating 3D models
- **Interactive 3D Viewer:** Web-based Three.js visualization
- **Image Stitching:** Prepares images for panorama creation

### 3. Customer Questionnaire
Comprehensive 6-section questionnaire covering:
- Basic property information
- Current condition assessment (room-by-room)
- Renovation plans & priorities
- Style preferences & constraints
- Budget & timeline expectations
- Contact & access information

### 4. Budget Estimation
- Itemized project costs
- 3-tier pricing (Basic/Mid/Luxury)
- Additional costs (permits, GST, contingency)
- Phasing recommendations
- ROI calculations

### 5. Contractor Allocation
- Smart matching algorithm
- Contractor database with ratings
- Quote estimation
- Availability tracking
- Contact management

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Step 1: Gather property data
npm run gather

# Step 2: Gather images & 3D visualization data
npm run gather-images

# Step 3: Complete customer questionnaire
npm run questionnaire

# Step 4: Generate budget estimate
npm run estimate

# Step 5: Allocate contractors
npm run allocate

# Or run all steps with images
npm run full-with-images

# Start web server
npm start
```

---

## 📁 Project Structure

```
house-intelligence-app/
├── src/
│   ├── server.js              # Express web server
│   ├── routes/
│   │   ├── property.js        # Property data API
│   │   ├── estimate.js        # Budget estimation API
│   │   └── contractors.js     # Contractor API
│   └── views/
│       ├── dashboard.ejs      # Main dashboard
│       ├── questionnaire.ejs  # Customer form
│       ├── estimate.ejs       # Budget report
│       └── 3d-viewer.ejs      # 3D visualization
├── scripts/
│   ├── gather-property-data.js    # Data gathering
│   ├── gather-images-3d.js        # Image collection & 3D planning
│   ├── customer-questionnaire.js  # Interactive questionnaire
│   ├── estimate-budget.js         # Budget calculator
│   └── allocate-contractors.js    # Contractor matching
├── data/
│   └── 698-armstrong-road-wyndham-vale/
│       ├── property-profile.json
│       ├── image-data.json
│       ├── 3d-reconstruction-plan.json
│       ├── 3d-viewer.html
│       ├── photo-guide.html
│       ├── customer-questionnaire.json
│       ├── budget-estimate.json
│       └── contractor-allocation.json
├── docs/
│   └── api-documentation.md
├── package.json
└── README.md
```

---

## 📊 Data Sources

| Source | Data Type | API/Method |
|--------|-----------|------------|
| Domain/REA | Property values | Web scraping/API |
| Google Maps | Location, amenities | Google Maps API |
| Google Street View | 360° imagery | Street View Static API |
| Nearmap | Aerial imagery | Nearmap API |
| Wyndham Council | Zoning, permits | Council website |
| User Upload | Property photos | File upload |
| 3D Tools | 3D reconstruction | OpenDroneMap/Meshroom |
| Customer | Preferences | Questionnaire |
| Contractor DB | Service providers | Internal database |

---

## 💰 Cost Database (AUD)

### Kitchen Renovation
- **Basic:** $15,000 - $25,000
- **Mid:** $25,000 - $45,000
- **Luxury:** $45,000 - $80,000

### Bathroom Renovation
- **Basic:** $12,000 - $20,000
- **Mid:** $20,000 - $35,000
- **Luxury:** $35,000 - $60,000

### Other Projects
See `scripts/estimate-budget.js` for complete pricing.

---

## 🔧 Configuration

Create `.env` file:

```env
# Google Maps API
GOOGLE_MAPS_API_KEY=your_key_here

# Domain API
DOMAIN_API_KEY=your_key_here

# Nearmap API
NEARMAP_API_KEY=your_key_here

# Database
DB_PATH=./data

# Server
PORT=3000
NODE_ENV=development
```

---

## 📝 Usage Examples

### 1. Gather Property Data
```bash
node scripts/gather-property-data.js "698 Armstrong Road, Wyndham Vale"
```

**Output:**
- Property profile with market data
- Coordinates and nearby amenities
- Council zoning information
- Historical sales data

### 4. Image Collection & 3D Visualization
```bash
node scripts/gather-images-3d.js "698 Armstrong Road, Wyndham Vale"
```

**Output:**
- Street View images (8 angles)
- Aerial imagery (multiple zoom levels)
- Photo upload guide for homeowners
- 3D reconstruction plan
- Interactive 3D viewer (Three.js)

### 5. Customer Questionnaire
```bash
node scripts/customer-questionnaire.js
```

Interactive prompts covering:
- Property specifications
- Condition assessment
- Room-by-room details
- Renovation priorities
- Budget preferences

### 6. Generate Budget
```bash
node scripts/estimate-budget.js
```

**Output includes:**
- Itemized project costs
- Additional fees (permits, GST, etc.)
- Phasing recommendations
- Total budget range

### 7. Allocate Contractors
```bash
node scripts/allocate-contractors.js
# Or get contact list:
node scripts/allocate-contractors.js --contacts
```

**Output:**
- Top 3 contractors per project
- Estimated quotes
- Contact information
- Match scores

---

## 🎨 Web Interface

Start the web server:
```bash
npm run dev
```

Access:
- **Dashboard:** http://localhost:3000
- **Questionnaire:** http://localhost:3000/questionnaire
- **Estimate:** http://localhost:3000/estimate
- **Contractors:** http://localhost:3000/contractors
- **3D Viewer:** http://localhost:3000/3d-viewer
- **Photo Guide:** Open `data/*/photo-guide.html` in browser

---

## 📈 Sample Output

### Property Profile
```json
{
  "address": "698 Armstrong Road, Wyndham Vale",
  "estimatedValue": "$650,000 - $720,000",
  "propertyType": "House",
  "bedrooms": 4,
  "bathrooms": 2,
  "landSize": "550 sqm"
}
```

### Budget Estimate
```json
{
  "totalBudget": "$145,000",
  "projects": [
    { "name": "Kitchen Renovation", "cost": "$35,000" },
    { "name": "Bathroom Renovation", "cost": "$28,000" }
  ],
  "timeline": "4-6 months"
}
```

### Contractor Match
```json
{
  "name": "Elite Kitchens & Bathrooms",
  "rating": 4.8,
  "estimatedQuote": "$32,000 - $38,000",
  "availability": "2 weeks"
}
```

---

## 🛠️ API Endpoints

### Property
- `GET /api/property/:id` - Get property profile
- `POST /api/property/:id/gather` - Trigger data gathering

### Estimate
- `GET /api/estimate/:id` - Get budget estimate
- `POST /api/estimate/:id/generate` - Generate new estimate

### Contractors
- `GET /api/contractors` - List all contractors
- `GET /api/contractors/:id` - Get contractor details
- `POST /api/contractors/allocate` - Run allocation

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run specific test
npm test -- estimate.test.js
```

---

## 🚧 Roadmap

- [x] Integration with real estate APIs
- [x] Google Street View image collection
- [x] Aerial imagery gathering
- [x] 3D visualization viewer (Three.js)
- [x] Photo guide for homeowners
- [x] Image stitching preparation
- [ ] AI-powered renovation suggestions
- [ ] Automated 3D reconstruction pipeline
- [ ] Matterport/Cupix integration
- [ ] Permit application automation
- [ ] Progress tracking system
- [ ] Mobile app

---

## 📄 License

MIT License

---

## 🤝 Support

For issues or questions, contact the development team.

---

**Built with:** Node.js, Express, Puppeteer, SQLite

**Location:** Wyndham Vale, Victoria, Australia
