#!/usr/bin/env node
/**
 * Contractor Allocation System
 * Matches renovation projects with qualified contractors
 */

const fs = require('fs').promises;
const path = require('path');

class ContractorAllocator {
  constructor(propertyId) {
    this.propertyId = propertyId;
    this.dataDir = path.join(__dirname, '../data', propertyId);
    
    // Mock contractor database (in production, this would be a real database)
    this.contractors = [
      {
        id: 'CONT001',
        name: 'Elite Kitchens & Bathrooms',
        specialties: ['kitchen', 'bathroom'],
        rating: 4.8,
        reviews: 127,
        location: 'Wyndham Vale',
        serviceArea: ['Wyndham Vale', 'Werribee', 'Hoppers Crossing', 'Tarneit'],
        hourlyRate: 85,
        projectRange: { min: 15000, max: 100000 },
        availability: '2 weeks',
        licenses: ['Builder', 'Plumber'],
        insurance: true,
        portfolio: ['Modern kitchen renovation', 'Luxury bathroom suite'],
        contact: { phone: '0400 111 222', email: 'elite@example.com' }
      },
      {
        id: 'CONT002',
        name: 'Premier Home Extensions',
        specialties: ['extension', 'structural'],
        rating: 4.9,
        reviews: 89,
        location: 'Werribee',
        serviceArea: ['Werribee', 'Wyndham Vale', 'Point Cook', 'Tarneit'],
        hourlyRate: 95,
        projectRange: { min: 50000, max: 500000 },
        availability: '4 weeks',
        licenses: ['Builder Unlimited', 'Architect'],
        insurance: true,
        portfolio: ['Single storey extension', 'Second storey addition'],
        contact: { phone: '0400 333 444', email: 'premier@example.com' }
      },
      {
        id: 'CONT003',
        name: 'Swift Roofing Solutions',
        specialties: ['roof', 'guttering'],
        rating: 4.7,
        reviews: 203,
        location: 'Hoppers Crossing',
        serviceArea: ['Hoppers Crossing', 'Wyndham Vale', 'Werribee', 'Laverton'],
        hourlyRate: 75,
        projectRange: { min: 5000, max: 50000 },
        availability: '1 week',
        licenses: ['Roofing Contractor'],
        insurance: true,
        portfolio: ['Tile roof restoration', 'Metal roof replacement'],
        contact: { phone: '0400 555 666', email: 'swift@example.com' }
      },
      {
        id: 'CONT004',
        name: 'Master Painters Co',
        specialties: ['painting', 'exterior'],
        rating: 4.6,
        reviews: 156,
        location: 'Tarneit',
        serviceArea: ['Tarneit', 'Wyndham Vale', 'Truganina', 'Werribee'],
        hourlyRate: 55,
        projectRange: { min: 3000, max: 30000 },
        availability: '1 week',
        licenses: ['Painter'],
        insurance: true,
        portfolio: ['Exterior repaint', 'Interior color refresh'],
        contact: { phone: '0400 777 888', email: 'master@example.com' }
      },
      {
        id: 'CONT005',
        name: 'Green Energy Installations',
        specialties: ['solar', 'electrical', 'insulation'],
        rating: 4.9,
        reviews: 312,
        location: 'Werribee',
        serviceArea: ['Werribee', 'Wyndham Vale', 'Hoppers Crossing', 'Point Cook'],
        hourlyRate: 90,
        projectRange: { min: 3000, max: 25000 },
        availability: '3 days',
        licenses: ['Electrician', 'Solar Installer'],
        insurance: true,
        portfolio: ['6.6kW solar system', 'Battery installation'],
        contact: { phone: '0400 999 000', email: 'green@example.com' }
      },
      {
        id: 'CONT006',
        name: 'Luxury Flooring Specialists',
        specialties: ['flooring', 'tiling'],
        rating: 4.8,
        reviews: 178,
        location: 'Point Cook',
        serviceArea: ['Point Cook', 'Wyndham Vale', 'Tarneit', 'Williams Landing'],
        hourlyRate: 65,
        projectRange: { min: 5000, max: 40000 },
        availability: '2 weeks',
        licenses: ['Flooring Installer'],
        insurance: true,
        portfolio: ['Timber floor installation', 'Porcelain tile project'],
        contact: { phone: '0411 222 333', email: 'luxury@example.com' }
      },
      {
        id: 'CONT007',
        name: 'Complete Landscaping',
        specialties: ['landscaping', 'decking', 'paving'],
        rating: 4.7,
        reviews: 134,
        location: 'Wyndham Vale',
        serviceArea: ['Wyndham Vale', 'Werribee', 'Tarneit', 'Truganina'],
        hourlyRate: 70,
        projectRange: { min: 5000, max: 60000 },
        availability: '2 weeks',
        licenses: ['Landscaper'],
        insurance: true,
        portfolio: ['Native garden design', 'Outdoor entertainment area'],
        contact: { phone: '0411 444 555', email: 'complete@example.com' }
      },
      {
        id: 'CONT008',
        name: 'Smart Home Integration',
        specialties: ['smart-home', 'electrical', 'security'],
        rating: 4.9,
        reviews: 89,
        location: 'Williams Landing',
        serviceArea: ['Williams Landing', 'Point Cook', 'Wyndham Vale', 'Tarneit'],
        hourlyRate: 100,
        projectRange: { min: 2000, max: 20000 },
        availability: '1 week',
        licenses: ['Electrician', 'Security Installer'],
        insurance: true,
        portfolio: ['Smart lighting system', 'Home security installation'],
        contact: { phone: '0411 666 777', email: 'smart@example.com' }
      },
      {
        id: 'CONT009',
        name: 'Certified Home Inspectors',
        specialties: ['inspection', 'assessment'],
        rating: 5.0,
        reviews: 245,
        location: 'Werribee',
        serviceArea: ['All Melbourne West'],
        hourlyRate: 150,
        projectRange: { min: 400, max: 1500 },
        availability: '3 days',
        licenses: ['Building Inspector', 'Pest Inspector'],
        insurance: true,
        portfolio: ['Pre-purchase inspection', 'Renovation assessment'],
        contact: { phone: '0411 888 999', email: 'inspect@example.com' }
      },
      {
        id: 'CONT010',
        name: 'Heritage Restoration Experts',
        specialties: ['heritage', 'restoration', 'period-homes'],
        rating: 4.9,
        reviews: 67,
        location: 'Melbourne CBD',
        serviceArea: ['Greater Melbourne'],
        hourlyRate: 120,
        projectRange: { min: 20000, max: 200000 },
        availability: '6 weeks',
        licenses: ['Heritage Builder', 'Restoration Specialist'],
        insurance: true,
        portfolio: ['Victorian terrace restoration', 'Art deco renovation'],
        contact: { phone: '0422 111 222', email: 'heritage@example.com' }
      }
    ];
  }

  async loadBudgetEstimate() {
    try {
      const estimatePath = path.join(this.dataDir, 'budget-estimate.json');
      const data = await fs.readFile(estimatePath, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      console.error('❌ Budget estimate not found. Run estimate-budget.js first.');
      return null;
    }
  }

  matchContractorsToProject(project) {
    const projectType = this.categorizeProject(project.name);
    
    const matches = this.contractors
      .filter(contractor => {
        // Check if contractor specializes in this type
        const specialtyMatch = contractor.specialties.some(s => 
          projectType.includes(s) || s.includes(projectType)
        );
        
        // Check budget range
        const avgCost = (project.baseCost.min + project.baseCost.max) / 2;
        const budgetMatch = avgCost >= contractor.projectRange.min && 
                           avgCost <= contractor.projectRange.max;
        
        return specialtyMatch || budgetMatch;
      })
      .map(contractor => ({
        ...contractor,
        matchScore: this.calculateMatchScore(contractor, project),
        estimatedQuote: this.estimateQuote(contractor, project)
      }))
      .sort((a, b) => b.matchScore - a.matchScore);

    return matches.slice(0, 3); // Top 3 matches
  }

  categorizeProject(projectName) {
    const name = projectName.toLowerCase();
    
    if (name.includes('kitchen')) return 'kitchen';
    if (name.includes('bathroom')) return 'bathroom';
    if (name.includes('bedroom')) return 'bedroom';
    if (name.includes('extension')) return 'extension';
    if (name.includes('roof')) return 'roof';
    if (name.includes('paint')) return 'painting';
    if (name.includes('floor')) return 'flooring';
    if (name.includes('solar')) return 'solar';
    if (name.includes('landscaping')) return 'landscaping';
    if (name.includes('window')) return 'windows';
    
    return 'general';
  }

  calculateMatchScore(contractor, project) {
    let score = 0;
    
    // Rating (out of 5)
    score += contractor.rating * 10;
    
    // Number of reviews (experience indicator)
    score += Math.min(contractor.reviews / 10, 20);
    
    // Specialty match (crucial)
    const projectType = this.categorizeProject(project.name);
    if (contractor.specialties.includes(projectType)) {
      score += 30;
    }
    
    // Proximity (mock - would use actual distance calculation)
    if (contractor.location === 'Wyndham Vale' || 
        contractor.serviceArea.includes('Wyndham Vale')) {
      score += 15;
    }
    
    // Availability (faster is better)
    const availabilityScore = {
      '3 days': 15,
      '1 week': 12,
      '2 weeks': 10,
      '4 weeks': 5,
      '6 weeks': 2
    };
    score += availabilityScore[contractor.availability] || 0;
    
    return score;
  }

  estimateQuote(contractor, project) {
    const baseCost = (project.baseCost.min + project.baseCost.max) / 2;
    
    // Adjust based on contractor's typical rates
    const marketRate = 75; // Average hourly rate
    const rateMultiplier = contractor.hourlyRate / marketRate;
    
    let estimate = baseCost * rateMultiplier;
    
    // High-rated contractors may charge premium
    if (contractor.rating >= 4.8) {
      estimate *= 1.1;
    }
    
    return {
      min: Math.round(estimate * 0.9),
      max: Math.round(estimate * 1.1),
      breakdown: {
        materials: Math.round(estimate * 0.4),
        labour: Math.round(estimate * 0.5),
        margin: Math.round(estimate * 0.1)
      }
    };
  }

  async allocate() {
    console.log('🔨 Contractor Allocation System\n');
    
    const budgetEstimate = await this.loadBudgetEstimate();
    if (!budgetEstimate) return;

    const allocation = {
      propertyId: this.propertyId,
      allocatedAt: new Date().toISOString(),
      projects: [],
      summary: {
        totalContractors: 0,
        totalEstimatedCost: 0,
        timeline: ''
      }
    };

    console.log(`Matching contractors for ${budgetEstimate.projects.length} projects...\n`);

    for (const project of budgetEstimate.projects) {
      console.log(`📋 Project: ${project.name}`);
      console.log(`   Budget: $${project.baseCost.min.toLocaleString()} - $${project.baseCost.max.toLocaleString()}`);
      
      const matches = this.matchContractorsToProject(project);
      
      if (matches.length === 0) {
        console.log('   ⚠️  No matching contractors found\n');
        continue;
      }

      console.log(`   ✅ Found ${matches.length} matching contractors:\n`);

      const projectAllocation = {
        project: project,
        recommendedContractors: matches.map(c => ({
          id: c.id,
          name: c.name,
          rating: c.rating,
          reviews: c.reviews,
          specialties: c.specialties,
          estimatedQuote: c.estimatedQuote,
          availability: c.availability,
          contact: c.contact,
          matchScore: c.matchScore,
          whyRecommended: this.generateRecommendationReason(c, project)
        }))
      };

      allocation.projects.push(projectAllocation);

      // Print contractor details
      matches.forEach((contractor, index) => {
        console.log(`   ${index + 1}. ${contractor.name}`);
        console.log(`      ⭐ Rating: ${contractor.rating}/5 (${contractor.reviews} reviews)`);
        console.log(`      💰 Estimated Quote: $${contractor.estimatedQuote.min.toLocaleString()} - $${contractor.estimatedQuote.max.toLocaleString()}`);
        console.log(`      📅 Availability: ${contractor.availability}`);
        console.log(`      📞 Contact: ${contractor.contact.phone}`);
        console.log(`      🎯 Match Score: ${contractor.matchScore.toFixed(1)}/100`);
        console.log(`      ℹ️  ${projectAllocation.recommendedContractors[index].whyRecommended}\n`);
      });
    }

    // Generate summary
    allocation.summary = this.generateSummary(allocation);

    // Save allocation
    const outputPath = path.join(this.dataDir, 'contractor-allocation.json');
    await fs.writeFile(outputPath, JSON.stringify(allocation, null, 2));

    this.printSummary(allocation);

    return allocation;
  }

  generateRecommendationReason(contractor, project) {
    const reasons = [];
    
    if (contractor.rating >= 4.8) {
      reasons.push('Excellent rating');
    }
    
    if (contractor.reviews > 100) {
      reasons.push('Highly experienced');
    }
    
    const projectType = this.categorizeProject(project.name);
    if (contractor.specialties.includes(projectType)) {
      reasons.push(`Specializes in ${projectType}`);
    }
    
    if (contractor.location === 'Wyndham Vale') {
      reasons.push('Local to area');
    }
    
    if (contractor.availability === '1 week' || contractor.availability === '3 days') {
      reasons.push('Quick availability');
    }
    
    return reasons.join(', ');
  }

  generateSummary(allocation) {
    const uniqueContractors = new Set();
    let totalCost = 0;
    let maxTimeline = 0;

    allocation.projects.forEach(project => {
      if (project.recommendedContractors.length > 0) {
        // Use first (best) contractor
        const contractor = project.recommendedContractors[0];
        uniqueContractors.add(contractor.id);
        
        const avgQuote = (contractor.estimatedQuote.min + contractor.estimatedQuote.max) / 2;
        totalCost += avgQuote;
        
        // Parse timeline
        const weeks = this.parseTimeline(project.project.timeline);
        maxTimeline = Math.max(maxTimeline, weeks);
      }
    });

    return {
      totalContractors: uniqueContractors.size,
      totalEstimatedCost: Math.round(totalCost),
      estimatedTimeline: `${maxTimeline}-${Math.ceil(maxTimeline * 1.3)} weeks`
    };
  }

  parseTimeline(timeline) {
    // Parse "3-6 weeks" format
    const match = timeline?.match(/(\d+)-?(\d+)?/);
    if (match) {
      return parseInt(match[2] || match[1]);
    }
    return 4; // Default
  }

  printSummary(allocation) {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📊 CONTRACTOR ALLOCATION SUMMARY');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log(`Total Projects: ${allocation.projects.length}`);
    console.log(`Recommended Contractors: ${allocation.summary.totalContractors}`);
    console.log(`Total Estimated Cost: $${allocation.summary.totalEstimatedCost.toLocaleString()}`);
    console.log(`Estimated Timeline: ${allocation.summary.estimatedTimeline}\n`);

    console.log('NEXT STEPS:');
    console.log('───────────');
    console.log('1. Review contractor recommendations');
    console.log('2. Contact top 2-3 contractors for each project');
    console.log('3. Request detailed quotes');
    console.log('4. Check licenses and insurance');
    console.log('5. Review past work/portfolio');
    console.log('6. Get references from past clients');
    console.log('7. Sign contracts and schedule work\n');

    console.log('💾 Full allocation saved to:');
    console.log(`   data/${this.propertyId}/contractor-allocation.json\n`);
  }

  async generateContactList() {
    const allocationPath = path.join(this.dataDir, 'contractor-allocation.json');
    
    try {
      const data = await fs.readFile(allocationPath, 'utf8');
      const allocation = JSON.parse(data);

      console.log('\n═══════════════════════════════════════════════════════════');
      console.log('📞 CONTRACTOR CONTACT LIST');
      console.log('═══════════════════════════════════════════════════════════\n');

      const contacted = new Set();

      allocation.projects.forEach(project => {
        if (project.recommendedContractors.length > 0) {
          const topContractor = project.recommendedContractors[0];
          
          if (!contacted.has(topContractor.id)) {
            contacted.add(topContractor.id);
            
            console.log(`${topContractor.name}`);
            console.log(`Project: ${project.project.name}`);
            console.log(`Phone: ${topContractor.contact.phone}`);
            console.log(`Email: ${topContractor.contact.email}`);
            console.log(`Estimated: $${topContractor.estimatedQuote.min.toLocaleString()} - $${topContractor.estimatedQuote.max.toLocaleString()}`);
            console.log('');
          }
        }
      });

    } catch (e) {
      console.error('❌ Allocation file not found. Run allocate first.');
    }
  }
}

// CLI usage
if (require.main === module) {
  const propertyId = process.argv[2] || '698-armstrong-road-wyndham-vale';
  const allocator = new ContractorAllocator(propertyId);
  
  if (process.argv.includes('--contacts')) {
    allocator.generateContactList();
  } else {
    allocator.allocate();
  }
}

module.exports = ContractorAllocator;
