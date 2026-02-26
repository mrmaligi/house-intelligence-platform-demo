/**
 * House Intelligence Platform - Web Server
 * Express.js server for property data, estimates, and contractor allocation
 */

const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Property ID (698 Armstrong Road)
const PROPERTY_ID = '698-armstrong-road-wyndham-vale';
const DATA_DIR = path.join(__dirname, '../data', PROPERTY_ID);

// Helper to load JSON data
async function loadData(filename) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

// Routes

// Dashboard - Main view
app.get('/', async (req, res) => {
  const property = await loadData('property-profile.json');
  const estimate = await loadData('budget-estimate.json');
  const allocation = await loadData('contractor-allocation.json');
  
  res.render('dashboard', {
    property,
    estimate,
    allocation,
    propertyId: PROPERTY_ID,
    address: '698 Armstrong Road, Wyndham Vale, VIC 3024'
  });
});

// Questionnaire page
app.get('/questionnaire', (req, res) => {
  res.render('questionnaire', { propertyId: PROPERTY_ID });
});

// Submit questionnaire
app.post('/questionnaire', async (req, res) => {
  const data = {
    propertyId: PROPERTY_ID,
    completedAt: new Date().toISOString(),
    sections: req.body
  };
  
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(
    path.join(DATA_DIR, 'customer-questionnaire.json'),
    JSON.stringify(data, null, 2)
  );
  
  res.json({ success: true, message: 'Questionnaire saved!' });
});

// Estimate page
app.get('/estimate', async (req, res) => {
  const estimate = await loadData('budget-estimate.json');
  res.render('estimate', { estimate, propertyId: PROPERTY_ID });
});

// Contractors page
app.get('/contractors', async (req, res) => {
  const allocation = await loadData('contractor-allocation.json');
  res.render('contractors', { allocation, propertyId: PROPERTY_ID });
});

// Property profile page
app.get('/property', async (req, res) => {
  const property = await loadData('property-profile.json');
  res.render('property', { property, propertyId: PROPERTY_ID });
});

// API Routes

// Get property data
app.get('/api/property', async (req, res) => {
  const data = await loadData('property-profile.json');
  res.json(data || { error: 'Property data not found. Run gather first.' });
});

// Get questionnaire data
app.get('/api/questionnaire', async (req, res) => {
  const data = await loadData('customer-questionnaire.json');
  res.json(data || { error: 'Questionnaire not found.' });
});

// Get budget estimate
app.get('/api/estimate', async (req, res) => {
  const data = await loadData('budget-estimate.json');
  res.json(data || { error: 'Estimate not found. Run estimate first.' });
});

// Get contractor allocation
app.get('/api/contractors', async (req, res) => {
  const data = await loadData('contractor-allocation.json');
  res.json(data || { error: 'Allocation not found. Run allocate first.' });
});

// Trigger data gathering (placeholder - would run the script)
app.post('/api/gather', async (req, res) => {
  res.json({ 
    message: 'Data gathering initiated',
    note: 'In production, this would trigger the gather script'
  });
});

// Generate estimate
app.post('/api/estimate', async (req, res) => {
  res.json({ 
    message: 'Estimate generation initiated',
    note: 'Run: npm run estimate'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`╔══════════════════════════════════════════════════════════╗`);
  console.log(`║     🏠 HOUSE INTELLIGENCE PLATFORM                       ║`);
  console.log(`║                                                          ║`);
  console.log(`║     Server running at http://localhost:${PORT}              ║`);
  console.log(`║                                                          ║`);
  console.log(`║     Property: 698 Armstrong Road, Wyndham Vale          ║`);
  console.log(`╚══════════════════════════════════════════════════════════╝`);
  console.log(`\n📍 Dashboard:  http://localhost:${PORT}`);
  console.log(`📝 Questionnaire: http://localhost:${PORT}/questionnaire`);
  console.log(`💰 Estimate:  http://localhost:${PORT}/estimate`);
  console.log(`🔨 Contractors: http://localhost:${PORT}/contractors`);
  console.log(`\nAPI endpoints:`);
  console.log(`  GET  /api/property`);
  console.log(`  GET  /api/questionnaire`);
  console.log(`  GET  /api/estimate`);
  console.log(`  GET  /api/contractors\n`);
});

module.exports = app;
