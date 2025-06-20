// Node.js script to verify the card drawing fix is properly implemented
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Card Drawing Fix Implementation...\n');

// Check if the DiceManager file exists and contains the fix
const diceManagerPath = path.join(__dirname, 'js/components/DiceManager.js');

try {
    const diceManagerContent = fs.readFileSync(diceManagerPath, 'utf8');
    
    console.log('✅ DiceManager.js file found');
    
    // Check for the processing flag implementation
    const hasProcessingFlag = diceManagerContent.includes('this.isProcessingCardDraws = false');
    const hasProcessingKey = diceManagerContent.includes('this.currentProcessingKey = null');
    const hasTurnTracking = diceManagerContent.includes('this.processedCardDrawsThisTurn = new Set()');
    const hasPreventionCheck = diceManagerContent.includes('if (this.processedCardDrawsThisTurn.has(processingKey))');
    const hasCleanup = diceManagerContent.includes('this.processedCardDrawsThisTurn.clear()');
    const hasButtonMarking = diceManagerContent.includes('markRelatedCardButtonsAsUsed');
    
    console.log('\n📋 Fix Implementation Status:');
    console.log(`   🏗️  Processing flag initialization: ${hasProcessingFlag ? '✅' : '❌'}`);
    console.log(`   🔑 Processing key tracking: ${hasProcessingKey ? '✅' : '❌'}`);
    console.log(`   🔄 Turn-based tracking: ${hasTurnTracking ? '✅' : '❌'}`);
    console.log(`   🛡️  Double processing prevention: ${hasPreventionCheck ? '✅' : '❌'}`);
    console.log(`   🧹 Tracking cleanup: ${hasCleanup ? '✅' : '❌'}`);
    console.log(`   🔘 Button marking system: ${hasButtonMarking ? '✅' : '❌'}`);
    
    // Check for specific fix patterns
    const hasCorrectSpaceName = diceManagerContent.includes('currentPlayer.position') && 
                                diceManagerContent.includes('spaceName = spaceId');
    console.log(`   🎯 Correct space name usage: ${hasCorrectSpaceName ? '✅' : '❌'}`);
    
    // Check for CSV data usage
    const usesCsvData = diceManagerContent.includes('DiceRoll Info.csv') || 
                       diceManagerContent.includes('diceRollData') ||
                       diceManagerContent.includes('this.diceOutcomes');
    console.log(`   📊 CSV data integration: ${usesCsvData ? '✅' : '❌'}`);
    
    // Check for SpaceInfoCards button intelligence
    const spaceInfoCardsPath = path.join(__dirname, 'js/components/SpaceInfoCards.js');
    let hasButtonIntelligence = false;
    try {
        const spaceInfoCardsContent = fs.readFileSync(spaceInfoCardsPath, 'utf8');
        hasButtonIntelligence = spaceInfoCardsContent.includes('Auto-marked') && 
                               spaceInfoCardsContent.includes('dice already drew');
        console.log(`   🧠 Button intelligence system: ${hasButtonIntelligence ? '✅' : '❌'}`);
    } catch (error) {
        console.log(`   🧠 Button intelligence system: ❌ (SpaceInfoCards.js not found)`);
    }
    
    // Check for SpaceInfo button prevention
    const spaceInfoPath = path.join(__dirname, 'js/components/SpaceInfo.js');
    let hasButtonPrevention = false;
    try {
        const spaceInfoContent = fs.readFileSync(spaceInfoPath, 'utf8');
        hasButtonPrevention = spaceInfoContent.includes('shouldShowCardButton') && 
                             spaceInfoContent.includes('fieldToCardType') &&
                             spaceInfoContent.includes('dice already drew');
        console.log(`   🚫 Button prevention system: ${hasButtonPrevention ? '✅' : '❌'}`);
    } catch (error) {
        console.log(`   🚫 Button prevention system: ❌ (SpaceInfo.js not found)`);
    }
    
    // Overall assessment
    const allChecksPass = hasProcessingFlag && hasProcessingKey && hasTurnTracking && 
                         hasPreventionCheck && hasCleanup && hasCorrectSpaceName && 
                         hasButtonMarking && hasButtonIntelligence && hasButtonPrevention;
    
    console.log('\n🎯 Overall Fix Status:');
    if (allChecksPass) {
        console.log('   ✅ ALL CHECKS PASS - Fix is properly implemented!');
    } else {
        console.log('   ❌ Some checks failed - Fix may be incomplete');
    }
    
    // Check CSV files exist
    console.log('\n📁 Data File Status:');
    
    const csvFiles = [
        'data/DiceRoll Info.csv',
        'data/Spaces.csv',
        'data/cards.csv'
    ];
    
    csvFiles.forEach(file => {
        const exists = fs.existsSync(path.join(__dirname, file));
        console.log(`   ${exists ? '✅' : '❌'} ${file}`);
    });
    
    console.log('\n🎮 Testing Instructions:');
    console.log('   1. Open http://localhost:8000/test-card-drawing-manual.html');
    console.log('   2. Click "Run Test" to verify CSV data');
    console.log('   3. Open http://localhost:8000/ to test manually');
    console.log('   4. Start new game and test dice rolling on OWNER-SCOPE-INITIATION');
    console.log('   5. Verify only correct number of cards are drawn (1 for roll 1-2, 2 for roll 3-4, 3 for roll 5-6)');
    
} catch (error) {
    console.error('❌ Error reading DiceManager.js:', error.message);
}

console.log('\n🏁 Verification complete!');