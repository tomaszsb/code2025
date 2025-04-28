// CardTypeUtils.js - Utility functions for handling card types
console.log('CardTypeUtils.js file is beginning to be used');

// Create a CardTypeUtils namespace
window.CardTypeUtils = {
  // Get the appropriate card color based on type
  getCardColor: (cardType) => {
    console.log('CardTypeUtils - getCardColor for type:', cardType);
    
    // Normalize cardType to handle null/undefined/empty values
    const normalizedType = typeof cardType === 'string' ? cardType.trim().toUpperCase() : '';
    
    switch (normalizedType) {
      case 'W': return '#4285f4'; // Blue for Work Type
      case 'B': return '#ea4335'; // Red for Bank
      case 'I': return '#fbbc05'; // Yellow for Investor
      case 'L': return '#34a853'; // Green for Life
      case 'E': return '#8e44ad'; // Purple for Expeditor
      default: 
        console.log('CardTypeUtils - Unknown card type:', cardType, 'defaulting to gray');
        return '#777777';  // Gray for unknown
    }
  },

  // Get the full card type name
  getCardTypeName: (cardType) => {
    console.log('CardTypeUtils - getCardTypeName for type:', cardType);
    
    // Normalize cardType to handle null/undefined/empty values
    const normalizedType = typeof cardType === 'string' ? cardType.trim().toUpperCase() : '';
    
    switch (normalizedType) {
      case 'W': return 'Work Type';
      case 'B': return 'Bank';
      case 'I': return 'Investor';
      case 'L': return 'Life';
      case 'E': return 'Expeditor';
      default: 
        console.log('CardTypeUtils - Unknown card type name:', cardType, 'defaulting to Unknown');
        return 'Unknown';
    }
  },
  
  // Detect card type from card data if not explicitly set
  detectCardType: function(card) {
    if (!card) return null;
    
    console.log('CardTypeUtils - detectCardType for card:', card.id || 'unknown');
    
    // If card already has a valid type, return it
    if (card.type && ['W', 'B', 'I', 'L', 'E'].includes(card.type.toUpperCase())) {
      console.log('CardTypeUtils - Card already has valid type:', card.type);
      return card.type.toUpperCase();
    }
    
    // Try to extract type from card ID
    if (card.id && typeof card.id === 'string') {
      const idParts = card.id.split('-');
      if (idParts.length >= 1 && idParts[0].length === 1) {
        const extractedType = idParts[0].toUpperCase();
        if (['W', 'B', 'I', 'L', 'E'].includes(extractedType)) {
          console.log('CardTypeUtils - Detected card type from ID:', extractedType);
          return extractedType;
        }
      }
    }
    
    // Try to determine type from card properties
    if (card['Work Type'] && (card['Job Description'] || card['Estimated Job Costs'])) {
      console.log('CardTypeUtils - Detected card type from properties: W');
      return 'W';
    } else if (card['Distribution Level'] && card['Amount'] && card['Description']) {
      console.log('CardTypeUtils - Detected card type from properties: I');
      return 'I';
    } else if (card['Card Name'] && (card['Distribution Level'] || card['Loan Percentage Cost'])) {
      console.log('CardTypeUtils - Detected card type from properties: B');
      return 'B';
    } else if (card['Card Name'] && card['Effect'] && card['Color']) {
      console.log('CardTypeUtils - Detected card type from properties: E');
      return 'E';
    } else if (card['Card Name'] && card['Effect'] && card['Category']) {
      console.log('CardTypeUtils - Detected card type from properties: L');
      return 'L';
    }
    
    console.log('CardTypeUtils - Could not detect card type, defaulting to E');
    return 'E'; // Default to Expeditor if cannot determine
  },

  // Get the primary display field for a card based on type
  getCardPrimaryField: function(card) {
    if (!card) return '';
    
    console.log('CardTypeUtils - getCardPrimaryField for card:', card.id || 'unknown');
    
    // Ensure card has a type
    const cardType = this.detectCardType(card);
    
    switch (cardType) {
      case 'W': 
        const workType = card['Work Type'] || '';
        console.log('CardTypeUtils - Work Type primary field:', workType);
        return workType;
      case 'B': 
        const cardName = card['Card Name'] || '';
        console.log('CardTypeUtils - Bank primary field:', cardName);
        return cardName;
      case 'I': 
        let investorAmount = '';
        if (card['Amount']) {
          // Format amount as currency string
          try {
            const numAmount = typeof card['Amount'] === 'number' 
              ? card['Amount'] 
              : parseFloat(String(card['Amount']).replace(/[^0-9.-]+/g, ''));
            investorAmount = !isNaN(numAmount) ? numAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '';
          } catch (e) {
            console.error('CardTypeUtils - Error formatting Investor amount:', e);
            investorAmount = String(card['Amount']);
          }
        }
        console.log('CardTypeUtils - Investor primary field:', investorAmount);
        return investorAmount;
      case 'L': 
        const lifeCardName = card['Card Name'] || '';
        console.log('CardTypeUtils - Life primary field:', lifeCardName);
        return lifeCardName;
      case 'E': 
        const expeditorCardName = card['Card Name'] || '';
        console.log('CardTypeUtils - Expeditor primary field:', expeditorCardName);
        return expeditorCardName;
      default: 
        console.log('CardTypeUtils - Unknown card type for primary field, returning empty string');
        return '';
    }
  },

  // Get the secondary display field for a card based on type
  getCardSecondaryField: function(card) {
    if (!card) return '';
    
    console.log('CardTypeUtils - getCardSecondaryField for card:', card.id || 'unknown');
    
    // Ensure card has a type
    const cardType = this.detectCardType(card);
    
    switch (cardType) {
      case 'W': 
        const jobDesc = card['Job Description'] || '';
        console.log('CardTypeUtils - Work Type secondary field:', jobDesc.substring(0, 20) + '...');
        return jobDesc;
      case 'B': 
        const effect = card['Effect'] || '';
        console.log('CardTypeUtils - Bank secondary field:', effect.substring(0, 20) + '...');
        return effect;
      case 'I': 
        const description = card['Description'] || '';
        console.log('CardTypeUtils - Investor secondary field:', description.substring(0, 20) + '...');
        return description;
      case 'L': 
        const lifeEffect = card['Effect'] || '';
        console.log('CardTypeUtils - Life secondary field:', lifeEffect.substring(0, 20) + '...');
        return lifeEffect;
      case 'E': 
        const expeditorEffect = card['Effect'] || '';
        console.log('CardTypeUtils - Expeditor secondary field:', expeditorEffect.substring(0, 20) + '...');
        return expeditorEffect;
      default: 
        console.log('CardTypeUtils - Unknown card type for secondary field, returning empty string');
        return '';
    }
  },

  // Get additional fields to display for a card type in the detail view
  getCardDetailFields: function(card) {
    if (!card) return [];
    
    console.log('CardTypeUtils - getCardDetailFields for card:', card.id || 'unknown');
    
    // Ensure card has a type
    const cardType = this.detectCardType(card);
    console.log('CardTypeUtils - Using card type for detail fields:', cardType);
    
    // Helper function to create field object only if value exists
    const createField = (label, value) => {
      const processedValue = value !== undefined && value !== null ? String(value) : '';
      return { label, value: processedValue };
    };
    
    switch (cardType) {
      case 'W':
        console.log('CardTypeUtils - Returning Work Type fields');
        return [
          createField('Work Type', card['Work Type']),
          createField('Description', card['Job Description']),
          createField('Estimated Cost', card['Estimated Job Costs'] ? `${parseFloat(String(card['Estimated Job Costs']).replace(/[^0-9.-]+/g, '')).toLocaleString()}` : '')
        ].filter(field => field.value.trim() !== '');
        
      case 'B':
        console.log('CardTypeUtils - Returning Bank fields');
        return [
          createField('Card Name', card['Card Name']),
          createField('Distribution Level', card['Distribution Level']),
          createField('Amount', card['Amount'] ? `${parseFloat(String(card['Amount']).replace(/[^0-9.-]+/g, '')).toLocaleString()}` : ''),
          createField('Loan Percentage', card['Loan Percentage Cost'] ? `${card['Loan Percentage Cost']}%` : ''),
          createField('Effect', card['Effect'])
        ].filter(field => field.value.trim() !== '');
        
      case 'I':
        console.log('CardTypeUtils - Returning Investor fields');
        return [
          createField('Distribution Level', card['Distribution Level']),
          createField('Amount', card['Amount'] ? `${parseFloat(String(card['Amount']).replace(/[^0-9.-]+/g, '')).toLocaleString()}` : ''),
          createField('Description', card['Description'])
        ].filter(field => field.value.trim() !== '');
        
      case 'L':
        console.log('CardTypeUtils - Returning Life fields');
        return [
          createField('Card Name', card['Card Name']),
          createField('Effect', card['Effect']),
          createField('Flavor Text', card['Flavor Text']),
          createField('Category', card['Category'])
        ].filter(field => field.value.trim() !== '');
        
      case 'E':
        console.log('CardTypeUtils - Returning Expeditor fields');
        return [
          createField('Card Name', card['Card Name']),
          createField('Effect', card['Effect']),
          createField('Flavor Text', card['Flavor Text']),
          createField('Color', card['Color']),
          createField('Phase', card['Phase'])
        ].filter(field => field.value.trim() !== '');
        
      default:
        console.log('CardTypeUtils - Unknown card type for detail fields, trying to detect type');
        // This should not normally be reached due to type detection above,
        // but included as a fallback just in case
        const detectedType = this.detectCardType(card);
        if (detectedType && detectedType !== cardType) {
          console.log('CardTypeUtils - Re-detected card type:', detectedType);
          return this.getCardDetailFields({...card, type: detectedType});
        }
        
        console.log('CardTypeUtils - Could not determine card detail fields');
        return [];
    }
  },

  // Get player color
  getPlayerColor: (playerId) => {
    console.log('CardTypeUtils - getPlayerColor for player:', playerId);
    
    // Check for proper GameState access
    if (!window.GameState || !window.GameState.players) {
      console.error('CardTypeUtils - GameState or players not available');
      return '#f9f9f9'; // Default color
    }
    
    // Find the player in the game state
    const player = window.GameState.players.find(p => p.id === playerId);
    return player?.color || '#f9f9f9';
  },
  
  // Format currency values consistently
  formatCurrency: (value) => {
    if (!value) return '';
    
    try {
      // Handle both number and string formats
      const numValue = typeof value === 'number' 
        ? value 
        : parseFloat(String(value).replace(/[^0-9.-]+/g, ''));
        
      return !isNaN(numValue) 
        ? numValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) 
        : '';
    } catch (e) {
      console.error('CardTypeUtils - Error formatting currency:', e);
      return String(value);
    }
  }
};

console.log('CardTypeUtils.js code execution finished');
