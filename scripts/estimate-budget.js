#!/usr/bin/env node
/**
 * Renovation Budget Estimator
 * Calculates detailed budget estimates based on property data and customer inputs
 */

const fs = require('fs').promises;
const path = require('path');

class BudgetEstimator {
  constructor(propertyId) {
    this.propertyId = propertyId;
    this.dataDir = path.join(__dirname, '../data', propertyId);
    this.estimates = {
      propertyId: propertyId,
      generatedAt: new Date().toISOString(),
      projects: [],
      summary: {},
      recommendations: []
    };

    // Cost database (AUD) - approximate market rates
    this.costDatabase = {
      // Kitchen
      'kitchen': {
        basic: { min: 15000, max: 25000, perSqm: 1200 },
        mid: { min: 25000, max: 45000, perSqm: 2000 },
        luxury: { min: 45000, max: 80000, perSqm: 3500 }
      },
      
      // Bathroom
      'bathroom': {
        basic: { min: 12000, max: 20000, perSqm: 2500 },
        mid: { min: 20000, max: 35000, perSqm: 4000 },
        luxury: { min: 35000, max: 60000, perSqm: 6500 }
      },
      
      // Bedroom
      'bedroom': {
        basic: { min: 5000, max: 10000, perSqm: 400 },
        mid: { min: 10000, max: 20000, perSqm: 800 },
        luxury: { min: 20000, max: 40000, perSqm: 1500 }
      },
      
      // Living areas
      'living-room': {
        basic: { min: 8000, max: 15000, perSqm: 500 },
        mid: { min: 15000, max: 30000, perSqm: 1000 },
        luxury: { min: 30000, max: 60000, perSqm: 2000 }
      },
      
      // Exterior
      'exterior-painting': {
        basic: { min: 5000, max: 8000, perSqm: 25 },
        mid: { min: 8000, max: 15000, perSqm: 40 },
        luxury: { min: 15000, max: 25000, perSqm: 65 }
      },
      
      'roof': {
        basic: { min: 8000, max: 15000, perSqm: 80 },
        mid: { min: 15000, max: 28000, perSqm: 140 },
        luxury: { min: 28000, max: 50000, perSqm: 250 }
      },
      
      // Flooring
      'flooring-timber': {
        basic: { min: 80, max: 120, perSqm: 100 },
        mid: { min: 120, max: 200, perSqm: 160 },
        luxury: { min: 200, max: 400, perSqm: 300 }
      },
      
      'flooring-tile': {
        basic: { min: 100, max: 150, perSqm: 125 },
        mid: { min: 150, max: 250, perSqm: 200 },
        luxury: { min: 250, max: 500, perSqm: 375 }
      },
      
      'flooring-carpet': {
        basic: { min: 40, max: 70, perSqm: 55 },
        mid: { min: 70, max: 120, perSqm: 95 },
        luxury: { min: 120, max: 250, perSqm: 185 }
      },
      
      // Windows
      'windows': {
        basic: { min: 8000, max: 15000, perWindow: 800 },
        mid: { min: 15000, max: 30000, perWindow: 1500 },
        luxury: { min: 30000, max: 60000, perWindow: 3000 }
      },
      
      // Extensions
      'extension': {
        basic: { min: 2000, max: 3000, perSqm: 2500 },
        mid: { min: 3000, max: 4500, perSqm: 3750 },
        luxury: { min: 4500, max: 7000, perSqm: 5750 }
      },
      
      // Landscaping
      'landscaping': {
        basic: { min: 5000, max: 15000, total: true },
        mid: { min: 15000, max: 40000, total: true },
        luxury: { min: 40000, max: 100000, total: true }
      },
      
      // Energy efficiency
      'solar-panels': {
        basic: { min: 4000, max: 6000, perKw: 1000 },
        mid: { min: 6000, max: 10000, perKw: 1400 },
        luxury: { min: 10000, max: 18000, perKw: 2000 }
      },
      
      'insulation': {
        basic: { min: 2000, max: 4000, total: true },
        mid: { min: 4000, max: 8000, total: true },
        luxury: { min: 8000, max: 15000, total: true }
      }
    };

    // Additional costs
    this.additionalCosts = {
      designFees: 0.05, // 5% of project cost
      permitsAndApprovals: 0.03, // 3%
      contingency: 0.15, // 15%
      projectManagement: 0.08, // 8%
      gst: 0.10 // 10%
    };
  }

  async loadData() {
    // Load gathered property data
    const propertyPath = path.join(this.dataDir, 'property-profile.json');
    try {
      this.propertyData = JSON.parse(await fs.readFile(propertyPath, 'utf8'));
    } catch (e) {
      this.propertyData = {};
    }

    // Load customer questionnaire
    const questionnairePath = path.join(this.dataDir, 'customer-questionnaire.json');
    try {
      this.questionnaire = JSON.parse(await fs.readFile(questionnairePath, 'utf8'));
    } catch (e) {
      this.questionnaire = {};
    }
  }

  calculateProjectCost(projectType, specifications = {}) {
    const costs = this.costDatabase[projectType];
    if (!costs) {
      return { min: 0, max: 0, note: 'Unknown project type' };
    }

    const tier = specifications.tier || 'mid';
    const costRange = costs[tier];
    
    let min = costRange.min;
    let max = costRange.max;

    // Calculate based on area if provided
    if (specifications.area && costRange.perSqm) {
      min = Math.max(min, specifications.area * costRange.perSqm * 0.8);
      max = Math.max(max, specifications.area * costRange.perSqm * 1.2);
    }

    // Calculate based on quantity if provided
    if (specifications.quantity && costRange.perWindow) {
      min = specifications.quantity * costRange.perWindow * 0.9;
      max = specifications.quantity * costRange.perWindow * 1.1;
    }

    // Calculate based on kW if provided (for solar)
    if (specifications.kw && costRange.perKw) {
      min = specifications.kw * costRange.perKw;
      max = specifications.kw * costRange.perKw * 1.5;
    }

    return {
      min: Math.round(min),
      max: Math.round(max),
      tier: tier,
      type: projectType
    };
  }

  calculateKitchen(specs = {}) {
    const area = specs.area || 15; // Default 15 sqm
    const cost = this.calculateProjectCost('kitchen', { ...specs, area });
    
    return {
      name: 'Kitchen Renovation',
      description: `Complete kitchen renovation (${area} sqm)`,
      baseCost: cost,
      inclusions: [
        'Cabinetry (custom or flat-pack)',
        'Benchtops (stone/laminate)',
        'Appliances (cooktop, oven, rangehood)',
        'Sink and tapware',
        'Splashback (tiles/glass)',
        'Flooring (if applicable)',
        'Lighting',
        'Installation and labour'
      ],
      exclusions: [
        'High-end appliances (Sub-Zero, Wolf)',
        'Structural changes',
        'Plumbing relocation (if major)',
        'Electrical upgrade (if required)'
      ],
      timeline: '4-8 weeks',
      complexity: 'High'
    };
  }

  calculateBathroom(specs = {}) {
    const area = specs.area || 8; // Default 8 sqm
    const cost = this.calculateProjectCost('bathroom', { ...specs, area });
    
    return {
      name: 'Bathroom Renovation',
      description: `Complete bathroom renovation (${area} sqm)`,
      baseCost: cost,
      inclusions: [
        'Vanity and basin',
        'Toilet',
        'Shower/bath',
        'Tapware and fixtures',
        'Tiles (floor and wall)',
        'Waterproofing',
        'Lighting and exhaust fan',
        'Installation and labour'
      ],
      exclusions: [
        'Luxury fixtures ( designer brands)',
        'Structural changes',
        'Window replacement',
        'Heating (towel rails additional)'
      ],
      timeline: '3-6 weeks',
      complexity: 'High'
    };
  }

  calculateBedroom(specs = {}) {
    const area = specs.area || 12;
    const cost = this.calculateProjectCost('bedroom', { ...specs, area });
    
    return {
      name: 'Bedroom Renovation',
      description: `Bedroom refresh (${area} sqm)`,
      baseCost: cost,
      inclusions: [
        'Painting',
        'Flooring',
        'Lighting upgrade',
        'Built-in wardrobe (if applicable)',
        'Window treatments'
      ],
      timeline: '1-2 weeks',
      complexity: 'Low'
    };
  }

  calculateExteriorPainting(specs = {}) {
    const area = specs.area || 180; // House exterior sqm
    const cost = this.calculateProjectCost('exterior-painting', { ...specs, area });
    
    return {
      name: 'Exterior Painting',
      description: `Full exterior repaint (${area} sqm)`,
      baseCost: cost,
      inclusions: [
        'Surface preparation',
        'Pressure washing',
        'Minor repairs to timber',
        'Primer and paint (2 coats)',
        'Gutter painting',
        'Clean up'
      ],
      timeline: '1-2 weeks',
      complexity: 'Medium'
    };
  }

  calculateRoof(specs = {}) {
    const area = specs.area || 180;
    const cost = this.calculateProjectCost('roof', { ...specs, area });
    
    return {
      name: 'Roof Restoration/Replacement',
      description: `Roof restoration (${area} sqm)`,
      baseCost: cost,
      inclusions: [
        'Pressure cleaning',
        'Repairs to broken tiles/sheets',
        'Re-bedding and pointing (tile roofs)',
        'Rust treatment (metal roofs)',
        'Sealing and painting',
        'Gutter replacement (if included)'
      ],
      timeline: '1-2 weeks',
      complexity: 'High'
    };
  }

  calculateFlooring(specs = {}) {
    const area = specs.area || 100;
    const type = specs.flooringType || 'timber';
    const cost = this.calculateProjectCost(`flooring-${type}`, { ...specs, area });
    
    return {
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Flooring`,
      description: `${type} flooring (${area} sqm)`,
      baseCost: cost,
      inclusions: [
        'Removal of existing flooring',
        'Subfloor preparation',
        'Underlay (if required)',
        'Flooring materials',
        'Installation',
        'Skirting boards (if included)'
      ],
      timeline: '3-7 days',
      complexity: 'Medium'
    };
  }

  calculateWindows(specs = {}) {
    const quantity = specs.quantity || 8;
    const cost = this.calculateProjectCost('windows', { ...specs, quantity });
    
    return {
      name: 'Window Replacement',
      description: `Replace ${quantity} windows with double glazing`,
      baseCost: cost,
      inclusions: [
        'Removal of old windows',
        'New double-glazed windows',
        'Installation and sealing',
        'Internal/external trim',
        'Disposal of old windows'
      ],
      timeline: '1-2 weeks',
      complexity: 'Medium'
    };
  }

  calculateSolar(specs = {}) {
    const kw = specs.kw || 6.6; // Typical residential system
    const cost = this.calculateProjectCost('solar-panels', { ...specs, kw });
    
    return {
      name: 'Solar Panel Installation',
      description: `${kw}kW solar system with inverter`,
      baseCost: cost,
      inclusions: [
        'Solar panels (tier 1 brand)',
        'Inverter (string or micro)',
        'Mounting system',
        'Electrical work and connection',
        'Monitoring system',
        'Warranty (typically 10-25 years)'
      ],
      rebates: 'STC rebates may apply (approx $400-600/kW)',
      timeline: '1-2 days',
      complexity: 'Medium',
      roi: '3-5 years typical payback'
    };
  }

  calculateLandscaping(specs = {}) {
    const cost = this.calculateProjectCost('landscaping', specs);
    
    return {
      name: 'Landscaping',
      description: 'Front and back yard landscaping',
      baseCost: cost,
      inclusions: [
        'Design (if applicable)',
        'Plants and trees',
        'Mulch and soil',
        'Paving/decking (if included)',
        'Irrigation system (if included)',
        'Garden lighting (if included)'
      ],
      timeline: '1-4 weeks',
      complexity: 'Low to Medium'
    };
  }

  calculateExtension(specs = {}) {
    const area = specs.area || 30;
    const cost = this.calculateProjectCost('extension', { ...specs, area });
    
    return {
      name: 'Home Extension',
      description: `Single storey extension (${area} sqm)`,
      baseCost: cost,
      inclusions: [
        'Design and plans',
        'Building permits',
        'Foundations and slab',
        'Frame and roof',
        'External cladding',
        'Windows and doors',
        'Basic electrical and plumbing',
        'Insulation'
      ],
      exclusions: [
        'Internal fit-out (kitchen, bathroom)',
        'Flooring (if premium)',
        'Heating/cooling',
        'Landscaping'
      ],
      timeline: '3-6 months',
      complexity: 'Very High',
      requiresPermits: true
    };
  }

  calculateAdditionalCosts(subtotal) {
    const designFees = subtotal * this.additionalCosts.designFees;
    const permits = subtotal * this.additionalCosts.permitsAndApprovals;
    const contingency = subtotal * this.additionalCosts.contingency;
    const projectManagement = subtotal * this.additionalCosts.projectManagement;
    const gst = (subtotal + designFees + permits + contingency + projectManagement) * this.additionalCosts.gst;

    return {
      designFees: Math.round(designFees),
      permitsAndApprovals: Math.round(permits),
      contingency: Math.round(contingency),
      projectManagement: Math.round(projectManagement),
      gst: Math.round(gst),
      total: Math.round(subtotal + designFees + permits + contingency + projectManagement + gst)
    };
  }

  generatePhasingRecommendation(projects, budget) {
    // Sort projects by priority and dependencies
    const phases = [];
    
    // Phase 1: Structural/essential
    const structural = projects.filter(p => 
      p.name.includes('Roof') || 
      p.name.includes('Extension') ||
      p.complexity === 'Very High'
    );
    if (structural.length > 0) {
      phases.push({
        phase: 1,
        name: 'Structural & Essential',
        projects: structural,
        estimatedDuration: '3-6 months'
      });
    }
    
    // Phase 2: Kitchens and bathrooms
    const wetAreas = projects.filter(p => 
      p.name.includes('Kitchen') || 
      p.name.includes('Bathroom')
    );
    if (wetAreas.length > 0) {
      phases.push({
        phase: 2,
        name: 'Wet Areas',
        projects: wetAreas,
        estimatedDuration: '2-4 months'
      });
    }
    
    // Phase 3: Other interior
    const interior = projects.filter(p => 
      p.name.includes('Bedroom') || 
      p.name.includes('Living') ||
      p.name.includes('Flooring')
    );
    if (interior.length > 0) {
      phases.push({
        phase: 3,
        name: 'Interior Finishes',
        projects: interior,
        estimatedDuration: '1-3 months'
      });
    }
    
    // Phase 4: Exterior
    const exterior = projects.filter(p => 
      p.name.includes('Exterior') || 
      p.name.includes('Landscaping') ||
      p.name.includes('Solar')
    );
    if (exterior.length > 0) {
      phases.push({
        phase: 4,
        name: 'Exterior & Outdoor',
        projects: exterior,
        estimatedDuration: '1-2 months'
      });
    }
    
    return phases;
  }

  async generateEstimate() {
    await this.loadData();
    
    console.log('💰 Generating Renovation Budget Estimate\n');
    
    const projects = [];
    let subtotal = 0;

    // Determine projects based on questionnaire
    const priorities = this.questionnaire?.sections?.renovationPlans?.priorities || [];
    const rooms = this.questionnaire?.sections?.rooms || [];

    // Kitchen
    const kitchenPriority = priorities.find(p => p.area.includes('Kitchen'));
    if (kitchenPriority) {
      const kitchen = this.calculateKitchen({ tier: this.mapPriorityToTier(kitchenPriority.priority) });
      projects.push(kitchen);
      subtotal += (kitchen.baseCost.min + kitchen.baseCost.max) / 2;
    }

    // Bathrooms
    const bathroomPriority = priorities.find(p => p.area.includes('Bathroom'));
    const numBathrooms = rooms.filter(r => r.name.includes('Bathroom')).length;
    if (bathroomPriority && numBathrooms > 0) {
      for (let i = 0; i < numBathrooms; i++) {
        const bathroom = this.calculateBathroom({ tier: this.mapPriorityToTier(bathroomPriority.priority) });
        bathroom.name = `Bathroom ${i + 1} Renovation`;
        projects.push(bathroom);
        subtotal += (bathroom.baseCost.min + bathroom.baseCost.max) / 2;
      }
    }

    // Bedrooms
    const bedroomRooms = rooms.filter(r => r.name.includes('Bedroom'));
    bedroomRooms.forEach(room => {
      if (room.renovationPriority !== 'None') {
        const bedroom = this.calculateBedroom({ 
          tier: this.mapPriorityToTier(room.renovationPriority),
          area: this.parseDimensions(room.dimensions)
        });
        bedroom.name = room.name + ' Renovation';
        projects.push(bedroom);
        subtotal += (bedroom.baseCost.min + bedroom.baseCost.max) / 2;
      }
    });

    // Exterior painting
    const exteriorPriority = priorities.find(p => p.area.includes('Exterior'));
    if (exteriorPriority) {
      const exterior = this.calculateExteriorPainting();
      projects.push(exterior);
      subtotal += (exterior.baseCost.min + exterior.baseCost.max) / 2;
    }

    // Flooring (if specified)
    const floorRooms = rooms.filter(r => 
      r.renovationPriority !== 'None' && r.flooring
    );
    if (floorRooms.length > 0) {
      const flooring = this.calculateFlooring({ area: floorRooms.length * 15 });
      projects.push(flooring);
      subtotal += (flooring.baseCost.min + flooring.baseCost.max) / 2;
    }

    // Solar
    const sustainability = this.questionnaire?.sections?.preferences?.sustainability;
    if (sustainability?.solarPanels) {
      const solar = this.calculateSolar({ kw: 6.6 });
      projects.push(solar);
      subtotal += (solar.baseCost.min + solar.baseCost.max) / 2;
    }

    // Landscaping
    const landscapingPriority = priorities.find(p => p.area.includes('Landscaping'));
    if (landscapingPriority) {
      const landscaping = this.calculateLandscaping();
      projects.push(landscaping);
      subtotal += (landscaping.baseCost.min + landscaping.baseCost.max) / 2;
    }

    // Calculate additional costs
    const additionalCosts = this.calculateAdditionalCosts(subtotal);

    // Generate phasing
    const phasing = this.generatePhasingRecommendation(projects);

    // Compile estimate
    this.estimates = {
      propertyId: this.propertyId,
      generatedAt: new Date().toISOString(),
      projects: projects,
      subtotal: Math.round(subtotal),
      additionalCosts: additionalCosts,
      totalBudget: additionalCosts.total,
      phasingRecommendation: phasing,
      timeline: this.calculateTotalTimeline(projects),
      recommendations: this.generateRecommendations(projects, additionalCosts.total)
    };

    // Save estimate
    const outputPath = path.join(this.dataDir, 'budget-estimate.json');
    await fs.mkdir(this.dataDir, { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(this.estimates, null, 2));

    this.printEstimate();
    
    return this.estimates;
  }

  mapPriorityToTier(priority) {
    const map = {
      'High': 'luxury',
      'Medium': 'mid',
      'Low': 'basic',
      'None': 'basic'
    };
    return map[priority] || 'mid';
  }

  parseDimensions(dimensions) {
    if (!dimensions) return 15;
    // Parse "4x5m" format
    const match = dimensions.match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)/);
    if (match) {
      return parseFloat(match[1]) * parseFloat(match[2]);
    }
    return 15;
  }

  calculateTotalTimeline(projects) {
    let totalWeeks = 0;
    projects.forEach(p => {
      const weeks = p.timeline?.match(/(\d+)-(\d+)/);
      if (weeks) {
        totalWeeks += parseInt(weeks[2]); // Use max
      }
    });
    return `${Math.ceil(totalWeeks / 4)}-${Math.ceil(totalWeeks / 3)} months`;
  }

  generateRecommendations(projects, totalBudget) {
    const recommendations = [];
    
    if (totalBudget > 100000) {
      recommendations.push({
        type: 'finance',
        message: 'Consider construction loan or home equity loan for large renovation',
        priority: 'High'
      });
    }
    
    if (projects.length > 5) {
      recommendations.push({
        type: 'phasing',
        message: 'Projects should be phased to manage cash flow and livability',
        priority: 'High'
      });
    }
    
    const hasStructural = projects.some(p => p.complexity === 'Very High');
    if (hasStructural) {
      recommendations.push({
        type: 'permits',
        message: 'Structural work requires building permits - allow 4-8 weeks for approval',
        priority: 'High'
      });
    }
    
    recommendations.push({
      type: 'contingency',
      message: 'Keep 15% contingency for unexpected issues (already included in estimate)',
      priority: 'Medium'
    });
    
    recommendations.push({
      type: 'quotes',
      message: 'Get at least 3 quotes from licensed builders for each major project',
      priority: 'High'
    });
    
    return recommendations;
  }

  printEstimate() {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📊 RENOVATION BUDGET ESTIMATE');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log(`Property: ${this.propertyId}`);
    console.log(`Generated: ${new Date().toLocaleDateString()}\n`);

    console.log('PROJECT BREAKDOWN:');
    console.log('─────────────────');
    
    this.estimates.projects.forEach((project, index) => {
      console.log(`\n${index + 1}. ${project.name}`);
      console.log(`   Description: ${project.description}`);
      console.log(`   Cost Range: $${project.baseCost.min.toLocaleString()} - $${project.baseCost.max.toLocaleString()}`);
      console.log(`   Timeline: ${project.timeline}`);
      console.log(`   Complexity: ${project.complexity}`);
    });

    console.log('\n\nCOST SUMMARY:');
    console.log('─────────────');
    console.log(`Subtotal (Projects):     $${this.estimates.subtotal.toLocaleString()}`);
    console.log(`Design Fees (5%):        $${this.estimates.additionalCosts.designFees.toLocaleString()}`);
    console.log(`Permits & Approvals (3%): $${this.estimates.additionalCosts.permitsAndApprovals.toLocaleString()}`);
    console.log(`Project Management (8%): $${this.estimates.additionalCosts.projectManagement.toLocaleString()}`);
    console.log(`Contingency (15%):       $${this.estimates.additionalCosts.contingency.toLocaleString()}`);
    console.log(`GST (10%):               $${this.estimates.additionalCosts.gst.toLocaleString()}`);
    console.log('─────────────────────────────────');
    console.log(`TOTAL BUDGET:            $${this.estimates.totalBudget.toLocaleString()}`);

    console.log('\n\nRECOMMENDED PHASING:');
    console.log('────────────────────');
    this.estimates.phasingRecommendation.forEach(phase => {
      console.log(`\nPhase ${phase.phase}: ${phase.name}`);
      console.log(`Duration: ${phase.estimatedDuration}`);
      phase.projects.forEach(p => console.log(`  • ${p.name}`));
    });

    console.log('\n\nRECOMMENDATIONS:');
    console.log('────────────────');
    this.estimates.recommendations.forEach(rec => {
      console.log(`\n[${rec.priority}] ${rec.type.toUpperCase()}:`);
      console.log(`  ${rec.message}`);
    });

    console.log('\n\n═══════════════════════════════════════════════════════════');
    console.log(`Estimated Timeline: ${this.estimates.timeline}`);
    console.log(`Total Budget Range: $${this.estimates.totalBudget.toLocaleString()}`);
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('💾 Full estimate saved to: data/' + this.propertyId + '/budget-estimate.json');
    console.log('\nNext step: Review estimate and allocate to contractors.');
  }
}

// CLI usage
if (require.main === module) {
  const propertyId = process.argv[2] || '698-armstrong-road-wyndham-vale';
  const estimator = new BudgetEstimator(propertyId);
  estimator.generateEstimate().catch(console.error);
}

module.exports = BudgetEstimator;
