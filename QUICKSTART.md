# 🏠 House Intelligence Platform - Quick Start Guide

## What You've Got

A complete property intelligence and renovation estimation system for **698 Armstrong Road, Wyndham Vale, VIC 3024**.

## 📁 Application Structure

```
house-intelligence-app/
├── scripts/
│   ├── gather-property-data.js      # Gathers data from real estate sites, Google Maps, council
│   ├── customer-questionnaire.js    # Interactive CLI questionnaire
│   ├── estimate-budget.js           # Calculates renovation budgets
│   └── allocate-contractors.js      # Matches projects with contractors
├── src/
│   ├── server.js                    # Express web server
│   └── views/                       # EJS templates for dashboard
├── data/                            # Property data storage
└── start.sh                         # Easy startup script
```

## 🚀 How to Run

### Option 1: Web Dashboard (Recommended)

```bash
cd house-intelligence-app
npm install
npm start
```

Then open: **http://localhost:3000**

### Option 2: Interactive Startup Menu

```bash
cd house-intelligence-app
./start.sh
```

### Option 3: Command Line

```bash
# Gather property data
npm run gather

# Run questionnaire
npm run questionnaire

# Generate budget estimate
npm run estimate

# Allocate contractors
npm run allocate

# Run everything
npm run full
```

## 📊 What It Does

### 1. Data Gathering
- **Real Estate:** Domain, REA, property values, sales history
- **Google Maps:** Location, amenities, street view
- **Council:** Zoning, planning overlays, rates
- **Aerial:** Nearmap imagery (requires API key)

### 2. Customer Questionnaire
- Basic property info
- Current condition assessment
- Room-by-room details
- Renovation priorities
- Budget preferences
- Style preferences

### 3. Budget Estimation
- Itemized project costs
- 3-tier pricing (Basic/Mid/Luxury)
- Additional costs (GST, permits, contingency)
- Phasing recommendations
- Total timeline

### 4. Contractor Allocation
- Smart matching algorithm
- Top 3 contractors per project
- Estimated quotes
- Contact information
- Availability tracking

## 💰 Sample Budget Output

For your property at 698 Armstrong Road:

| Project | Cost Range | Timeline |
|---------|-----------|----------|
| Kitchen Renovation | $25,000 - $35,000 | 4-6 weeks |
| Bathroom Renovation | $20,000 - $30,000 | 3-4 weeks |
| Exterior Painting | $8,000 - $12,000 | 1-2 weeks |
| Solar Panels (6.6kW) | $6,000 - $9,000 | 1-2 days |
| Flooring | $7,200 - $10,800 | 3-5 days |

**Total Budget (with fees & GST): ~$119,000**

## 🔧 Customization

### Add Real API Keys

Copy `.env.example` to `.env` and add your keys:

```bash
cp .env.example .env
```

Then edit `.env` with your:
- Google Maps API key
- Domain API key
- Nearmap API key

### Add More Contractors

Edit `scripts/allocate-contractors.js` and add to the `contractors` array.

### Modify Pricing

Edit cost database in `scripts/estimate-budget.js`:
- Kitchen costs
- Bathroom costs
- Flooring rates
- Additional cost percentages

## 🌐 Web Interface

The dashboard provides:
- Visual property overview
- Interactive questionnaire
- Budget breakdown with charts
- Contractor matching
- Progress tracking

## 📱 API Endpoints

- `GET /api/property` - Property data
- `GET /api/estimate` - Budget estimate
- `GET /api/contractors` - Contractor matches
- `POST /questionnaire` - Submit questionnaire

## 🎯 Next Steps

1. **Install dependencies:** `npm install`
2. **Start server:** `npm start`
3. **Complete questionnaire** at http://localhost:3000/questionnaire
4. **View estimate** at http://localhost:3000/estimate
5. **See contractors** at http://localhost:3000/contractors

## 📝 Notes

- Demo data is pre-populated for 698 Armstrong Road
- Replace with real API calls for production use
- Contractor database is mock data - replace with real providers
- All costs in AUD

---

**Built for:** 698 Armstrong Road, Wyndham Vale, VIC 3024
