#!/usr/bin/env node
/**
 * Customer Property Questionnaire
 * Collects detailed information about the property from the owner
 */

const readline = require('readline');
const fs = require('fs').promises;
const path = require('path');

class PropertyQuestionnaire {
  constructor(propertyId) {
    this.propertyId = propertyId;
    this.dataDir = path.join(__dirname, '../data', propertyId);
    this.answers = {
      propertyId: propertyId,
      completedAt: null,
      sections: {}
    };
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async askQuestion(question, defaultValue = '') {
    return new Promise((resolve) => {
      const prompt = defaultValue 
        ? `${question} [${defaultValue}]: `
        : `${question}: `;
      
      this.rl.question(prompt, (answer) => {
        resolve(answer.trim() || defaultValue);
      });
    });
  }

  async askYesNo(question, defaultValue = false) {
    const answer = await this.askQuestion(`${question} (yes/no)`, defaultValue ? 'yes' : 'no');
    return answer.toLowerCase().startsWith('y');
  }

  async askNumber(question, defaultValue = 0) {
    const answer = await this.askQuestion(question, defaultValue.toString());
    return parseFloat(answer) || defaultValue;
  }

  // Section 1: Basic Property Information
  async sectionBasicInfo() {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🏠 SECTION 1: BASIC PROPERTY INFORMATION');
    console.log('═══════════════════════════════════════════════════════════\n');

    this.answers.sections.basicInfo = {
      yearBuilt: await this.askQuestion('What year was the house built?', '2015'),
      yearPurchased: await this.askQuestion('What year did you purchase the house?', '2019'),
      purchasePrice: await this.askQuestion('What was the purchase price?', '$520,000'),
      currentMarketValue: await this.askQuestion('Estimated current market value?', '$650,000'),
      
      houseType: await this.askQuestion('House type (single/double storey/townhouse)?', 'single'),
      constructionType: await this.askQuestion('Construction type (brick/timber/weatherboard)?', 'brick veneer'),
      roofType: await this.askQuestion('Roof type (tile/metal/slate)?', 'concrete tile'),
      
      bedrooms: await this.askNumber('Number of bedrooms?', 4),
      bathrooms: await this.askNumber('Number of bathrooms?', 2),
      toilets: await this.askNumber('Number of toilets (total)?', 2),
      carSpaces: await this.askNumber('Number of car spaces?', 2),
      
      floorArea: await this.askQuestion('Approximate floor area (sqm)?', '180'),
      landArea: await this.askQuestion('Land area (sqm)?', '550'),
      
      orientation: await this.askQuestion('House orientation (north/south/east/west facing)?', 'north'),
      slope: await this.askQuestion('Is the land flat or sloped?', 'flat')
    };
  }

  // Section 2: Current Condition Assessment
  async sectionCondition() {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🔍 SECTION 2: CURRENT CONDITION ASSESSMENT');
    console.log('═══════════════════════════════════════════════════════════\n');

    const conditionRatings = ['Excellent', 'Good', 'Fair', 'Poor', 'Needs Replacement'];
    
    this.answers.sections.condition = {
      roof: {
        condition: await this.askQuestion('Roof condition (Excellent/Good/Fair/Poor)?', 'Good'),
        age: await this.askNumber('Roof age (years)?', 8),
        leaks: await this.askYesNo('Any leaks or water damage?', false),
        gutterCondition: await this.askQuestion('Gutter condition?', 'Good')
      },
      
      exterior: {
        condition: await this.askQuestion('Exterior walls condition?', 'Good'),
        paintAge: await this.askNumber('When was exterior last painted (year)?', 2019),
        cracks: await this.askYesNo('Any visible cracks in walls?', false),
        damp: await this.askYesNo('Any damp issues?', false)
      },
      
      windows: {
        condition: await this.askQuestion('Windows condition?', 'Good'),
        type: await this.askQuestion('Window type (single/double glazed)?', 'single glazed'),
        age: await this.askNumber('Window age (years)?', 8),
        drafty: await this.askYesNo('Are windows drafty?', false)
      },
      
      floors: {
        condition: await this.askQuestion('Flooring condition?', 'Good'),
        type: await this.askQuestion('Main flooring type (carpet/timber/tile)?', 'carpet'),
        sagging: await this.askYesNo('Any sagging floors?', false),
        squeaky: await this.askYesNo('Any squeaky floors?', true)
      },
      
      plumbing: {
        condition: await this.askQuestion('Plumbing condition?', 'Good'),
        age: await this.askNumber('Plumbing age (years)?', 8),
        waterPressure: await this.askQuestion('Water pressure (good/low)?', 'good'),
        hotWaterSystem: await this.askQuestion('Hot water system type?', 'electric'),
        hotWaterAge: await this.askNumber('Hot water system age (years)?', 8)
      },
      
      electrical: {
        condition: await this.askQuestion('Electrical condition?', 'Good'),
        age: await this.askNumber('Electrical age (years)?', 8),
        switchboard: await this.askQuestion('Switchboard type (fuse/circuit breakers)?', 'circuit breakers'),
        enoughPowerPoints: await this.askYesNo('Enough power points?', true),
        safetySwitch: await this.askYesNo('Has safety switch (RCD)?', true)
      },
      
      heatingCooling: {
        heatingType: await this.askQuestion('Heating type (gas/ducted/split/none)?', 'split system'),
        coolingType: await this.askQuestion('Cooling type (ducted/split/none)?', 'split system'),
        condition: await this.askQuestion('Heating/cooling condition?', 'Good'),
        age: await this.askNumber('System age (years)?', 5),
        adequate: await this.askYesNo('Adequate for house size?', true)
      },
      
      insulation: {
        ceiling: await this.askYesNo('Ceiling insulation installed?', true),
        wall: await this.askYesNo('Wall insulation installed?', false),
        floor: await this.askYesNo('Floor insulation installed?', false),
        condition: await this.askQuestion('Insulation condition?', 'Good')
      }
    };
  }

  // Section 3: Room-by-Room Details
  async sectionRooms() {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🛏️  SECTION 3: ROOM-BY-ROOM DETAILS');
    console.log('═══════════════════════════════════════════════════════════\n');

    this.answers.sections.rooms = [];

    const roomTypes = [
      'Master Bedroom',
      'Bedroom 2',
      'Bedroom 3',
      'Bedroom 4',
      'Main Bathroom',
      'Ensuite',
      'Kitchen',
      'Living Room',
      'Dining Room',
      'Laundry',
      'Garage',
      'Outdoor Area'
    ];

    for (const roomType of roomTypes) {
      const hasRoom = await this.askYesNo(`Do you have a ${roomType}?`, roomType.includes('Bedroom') || roomType === 'Kitchen' || roomType === 'Living Room');
      
      if (hasRoom) {
        console.log(`\n  📋 Details for ${roomType}:`);
        
        const room = {
          name: roomType,
          dimensions: await this.askQuestion(`    Dimensions (e.g., 4x5m)?`, ''),
          flooring: await this.askQuestion(`    Flooring type?`, ''),
          condition: await this.askQuestion(`    Condition (Excellent/Good/Fair/Poor)?`, 'Good'),
          renovationPriority: await this.askQuestion(`    Renovation priority (High/Medium/Low/None)?`, 'None'),
          notes: await this.askQuestion(`    Notes/issues?`, '')
        };
        
        this.answers.sections.rooms.push(room);
      }
    }
  }

  // Section 4: Renovation Plans
  async sectionRenovationPlans() {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🔨 SECTION 4: RENOVATION PLANS & PRIORITIES');
    console.log('═══════════════════════════════════════════════════════════\n');

    this.answers.sections.renovationPlans = {
      wantsRenovation: await this.askYesNo('Are you planning renovations?', true),
      
      reasons: [],
      priorities: [],
      budgetRange: null,
      timeline: null,
      diyVsProfessional: {},
      specificProjects: []
    };

    if (this.answers.sections.renovationPlans.wantsRenovation) {
      // Reasons for renovation
      console.log('\nReasons for renovation (select all that apply):');
      const reasons = [
        'Increase property value',
        'Improve comfort/lifestyle',
        'Fix maintenance issues',
        'Modernize outdated areas',
        'Add space/rooms',
        'Improve energy efficiency',
        'Prepare for sale',
        'Accommodate growing family'
      ];
      
      for (const reason of reasons) {
        if (await this.askYesNo(`  ${reason}?`, false)) {
          this.answers.sections.renovationPlans.reasons.push(reason);
        }
      }

      // Priority areas
      console.log('\nPriority areas for renovation:');
      const areas = [
        'Kitchen',
        'Bathroom(s)',
        'Master Bedroom',
        'Living Areas',
        'Exterior',
        'Roof',
        'Flooring',
        'Windows/Doors',
        'Landscaping',
        'Extension/Addition'
      ];
      
      for (const area of areas) {
        const priority = await this.askQuestion(`  ${area} priority (High/Medium/Low/None)?`, 'None');
        if (priority !== 'None') {
          this.answers.sections.renovationPlans.priorities.push({ area, priority });
        }
      }

      // Budget
      this.answers.sections.renovationPlans.budgetRange = await this.askQuestion(
        '\nEstimated budget range (e.g., $50k-$100k)?',
        '$50,000 - $100,000'
      );

      // Timeline
      this.answers.sections.renovationPlans.timeline = await this.askQuestion(
        'Preferred timeline (e.g., 3 months, 6 months, 1 year)?',
        '6 months'
      );

      // DIY vs Professional
      console.log('\nDIY vs Professional preferences:');
      this.answers.sections.renovationPlans.diyVsProfessional = {
        painting: await this.askQuestion('  Painting (DIY/Professional)?', 'DIY'),
        flooring: await this.askQuestion('  Flooring (DIY/Professional)?', 'Professional'),
        tiling: await this.askQuestion('  Tiling (DIY/Professional)?', 'Professional'),
        electrical: await this.askQuestion('  Electrical (DIY/Professional)?', 'Professional'),
        plumbing: await this.askQuestion('  Plumbing (DIY/Professional)?', 'Professional'),
        carpentry: await this.askQuestion('  Carpentry (DIY/Professional)?', 'Professional')
      };

      // Specific projects
      console.log('\nSpecific projects (describe any specific projects):');
      let addMore = true;
      while (addMore) {
        const project = await this.askQuestion('  Project name/description (or "done"):', 'done');
        if (project.toLowerCase() === 'done') {
          addMore = false;
        } else {
          const estimatedCost = await this.askQuestion('    Estimated cost?', 'TBD');
          this.answers.sections.renovationPlans.specificProjects.push({
            description: project,
            estimatedCost: estimatedCost
          });
        }
      }
    }
  }

  // Section 5: Preferences & Constraints
  async sectionPreferences() {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('⚙️  SECTION 5: PREFERENCES & CONSTRAINTS');
    console.log('═══════════════════════════════════════════════════════════\n');

    this.answers.sections.preferences = {
      style: await this.askQuestion('Preferred style (Modern/Traditional/Contemporary/Hamptons/Industrial)?', 'Contemporary'),
      
      sustainability: {
        important: await this.askYesNo('Is sustainability/energy efficiency important?', true),
        solarPanels: await this.askYesNo('Interested in solar panels?', true),
        batteryStorage: await this.askYesNo('Interested in battery storage?', false),
        rainwaterTank: await this.askYesNo('Interested in rainwater tank?', true),
        greywaterSystem: await this.askYesNo('Interested in greywater system?', false)
      },
      
      smartHome: {
        interested: await this.askYesNo('Interested in smart home features?', true),
        features: []
      },
      
      constraints: {
        heritageListed: await this.askYesNo('Is the property heritage listed?', false),
        easements: await this.askYesNo('Any easements on the property?', false),
        covenants: await this.askYesNo('Any restrictive covenants?', false),
        bodyCorporate: await this.askYesNo('Body corporate/HOA restrictions?', false),
        budgetConstraints: await this.askQuestion('Any specific budget constraints?', ''),
        timeConstraints: await this.askQuestion('Any specific time constraints?', '')
      },
      
      mustHaves: [],
      niceToHaves: [],
      dealBreakers: []
    };

    // Smart home features
    if (this.answers.sections.preferences.smartHome.interested) {
      const features = [
        'Smart lighting',
        'Smart thermostat',
        'Security system',
        'Smart locks',
        'Automated blinds',
        'Voice control',
        'Energy monitoring'
      ];
      
      console.log('\nSmart home features of interest:');
      for (const feature of features) {
        if (await this.askYesNo(`  ${feature}?`, false)) {
          this.answers.sections.preferences.smartHome.features.push(feature);
        }
      }
    }

    // Must-haves and nice-to-haves
    console.log('\nMust-haves (enter items, type "done" when finished):');
    let item = '';
    while (item !== 'done') {
      item = await this.askQuestion('  Must-have:', 'done');
      if (item !== 'done') {
        this.answers.sections.preferences.mustHaves.push(item);
      }
    }

    console.log('\nNice-to-haves:');
    item = '';
    while (item !== 'done') {
      item = await this.askQuestion('  Nice-to-have:', 'done');
      if (item !== 'done') {
        this.answers.sections.preferences.niceToHaves.push(item);
      }
    }
  }

  // Section 6: Contact & Access
  async sectionContact() {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📞 SECTION 6: CONTACT & ACCESS INFORMATION');
    console.log('═══════════════════════════════════════════════════════════\n');

    this.answers.sections.contact = {
      ownerName: await this.askQuestion('Your full name?', ''),
      phone: await this.askQuestion('Phone number?', ''),
      email: await this.askQuestion('Email address?', ''),
      
      bestTimeToContact: await this.askQuestion('Best time to contact?', 'Evenings'),
      preferredContactMethod: await this.askQuestion('Preferred contact method (Phone/Email/Text)?', 'Email'),
      
      access: {
        availableForInspection: await this.askYesNo('Property available for inspection?', true),
        preferredInspectionTimes: await this.askQuestion('Preferred inspection times?', 'Weekends'),
        petsOnProperty: await this.askYesNo('Pets on property?', false),
        specialInstructions: await this.askQuestion('Special access instructions?', '')
      },
      
      urgent: await this.askYesNo('Is this urgent?', false),
      additionalNotes: await this.askQuestion('Any additional notes?', '')
    };
  }

  // Main execution
  async run() {
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║     PROPERTY INTELLIGENCE QUESTIONNAIRE                  ║');
    console.log('║     698 Armstrong Road, Wyndham Vale                     ║');
    console.log('╚══════════════════════════════════════════════════════════╝');

    await this.sectionBasicInfo();
    await this.sectionCondition();
    await this.sectionRooms();
    await this.sectionRenovationPlans();
    await this.sectionPreferences();
    await this.sectionContact();

    this.answers.completedAt = new Date().toISOString();

    // Save results
    const outputPath = path.join(this.dataDir, 'customer-questionnaire.json');
    await fs.mkdir(this.dataDir, { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(this.answers, null, 2));

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('✅ QUESTIONNAIRE COMPLETE');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`\nSaved to: ${outputPath}`);
    console.log('\nNext step: Run budget estimation based on this data.');

    this.rl.close();
    return this.answers;
  }
}

// CLI usage
if (require.main === module) {
  const propertyId = process.argv[2] || '698-armstrong-road-wyndham-vale';
  const questionnaire = new PropertyQuestionnaire(propertyId);
  questionnaire.run().catch(console.error);
}

module.exports = PropertyQuestionnaire;
