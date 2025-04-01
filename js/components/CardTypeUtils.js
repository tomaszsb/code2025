// CardTypeUtils.js - Utility functions for handling card types
console.log('CardTypeUtils.js file is beginning to be used');

// Create a CardTypeUtils namespace
window.CardTypeUtils = {
  // Get the appropriate card color based on type
  getCardColor: (cardType) => {
    switch (cardType) {
      case 'W': return '#4285f4'; // Blue for Work Type
      case 'B': return '#ea4335'; // Red for Bank
      case 'I': return '#fbbc05'; // Yellow for Investor
      case 'L': return '#34a853'; // Green for Life
      case 'E': return '#8e44ad'; // Purple for Expeditor
      default: return '#777777';  // Gray for unknown
    }
  },

  // Get the full card type name
  getCardTypeName: (cardType) => {
    switch (cardType) {
      case 'W': return 'Work Type';
      case 'B': return 'Bank';
      case 'I': return 'Investor';
      case 'L': return 'Life';
      case 'E': return 'Expeditor';
      default: return 'Unknown';
    }
  },

  // Get the primary display field for a card based on type
  getCardPrimaryField: (card) => {
    if (!card) return '';
    
    switch (card.type) {
      case 'W': return card['Work Type'] || '';
      case 'B': return card['Card Name'] || '';
      case 'I': return card['Amount'] ? `${card['Amount']}` : '';
      case 'L': return card['Card Name'] || '';
      case 'E': return card['Card Name'] || '';
      default: return '';
    }
  },

  // Get the secondary display field for a card based on type
  getCardSecondaryField: (card) => {
    if (!card) return '';
    
    switch (card.type) {
      case 'W': return card['Job Description'] || '';
      case 'B': return card['Effect'] || '';
      case 'I': return card['Description'] || '';
      case 'L': return card['Effect'] || '';
      case 'E': return card['Effect'] || '';
      default: return '';
    }
  },

  // Get additional fields to display for a card type in the detail view
  getCardDetailFields: function(card) {
    if (!card) return [];
    
    console.log('CardTypeUtils - getCardDetailFields - Card:', JSON.stringify(card));
    console.log('CardTypeUtils - getCardDetailFields - Card type:', card.type);
    
    // Make a defensive copy of the card type to prevent any reference issues
    const cardType = String(card.type || '');
    console.log('CardTypeUtils - getCardDetailFields - Using card type:', cardType);
    
    switch (cardType) {
      case 'W':
        console.log('CardTypeUtils - getCardDetailFields - Returning Work Type fields');
        return [
          { label: 'Work Type', value: card['Work Type'] },
          { label: 'Description', value: card['Job Description'] },
          { label: 'Estimated Cost', value: card['Estimated Job Costs'] ? `${card['Estimated Job Costs']}` : '' }
        ];
      case 'B':
        console.log('CardTypeUtils - getCardDetailFields - Returning Bank fields');
        return [
          { label: 'Card Name', value: card['Card Name'] },
          { label: 'Distribution Level', value: card['Distribution Level'] },
          { label: 'Amount', value: card['Amount'] ? `${card['Amount']}` : '' },
          { label: 'Loan Percentage', value: card['Loan Percentage Cost'] ? `${card['Loan Percentage Cost']}%` : '' },
          { label: 'Effect', value: card['Effect'] }
        ];
      case 'I':
        console.log('CardTypeUtils - getCardDetailFields - Returning Investor fields');
        return [
          { label: 'Distribution Level', value: card['Distribution Level'] },
          { label: 'Amount', value: card['Amount'] ? `${card['Amount']}` : '' },
          { label: 'Description', value: card['Description'] }
        ];
      case 'L':
        console.log('CardTypeUtils - getCardDetailFields - Returning Life fields');
        return [
          { label: 'Card Name', value: card['Card Name'] },
          { label: 'Effect', value: card['Effect'] },
          { label: 'Flavor Text', value: card['Flavor Text'] },
          { label: 'Category', value: card['Category'] }
        ];
      case 'E':
        console.log('CardTypeUtils - getCardDetailFields - Returning Expeditor fields');
        return [
          { label: 'Card Name', value: card['Card Name'] },
          { label: 'Effect', value: card['Effect'] },
          { label: 'Flavor Text', value: card['Flavor Text'] },
          { label: 'Color', value: card['Color'] },
          { label: 'Phase', value: card['Phase'] }
        ];
      default:
        console.log('CardTypeUtils - getCardDetailFields - Unknown card type:', cardType);
        console.log('CardTypeUtils - getCardDetailFields - Attempting to determine type from properties');
        
        // Try to determine the card type based on its properties
        if (card['Work Type'] && card['Job Description']) {
          return this.getCardDetailFields({...card, type: 'W'});
        } else if (card['Distribution Level'] && card['Amount'] && card['Description']) {
          return this.getCardDetailFields({...card, type: 'I'});
        } else if (card['Card Name'] && card['Distribution Level'] && card['Amount']) {
          return this.getCardDetailFields({...card, type: 'B'});
        } else if (card['Card Name'] && card['Effect'] && card['Flavor Text'] && card['Color']) {
          return this.getCardDetailFields({...card, type: 'E'});
        } else if (card['Card Name'] && card['Effect'] && card['Flavor Text'] && card['Category']) {
          return this.getCardDetailFields({...card, type: 'L'});
        }
        
        return [];
    }
  },

  // Get player color
  getPlayerColor: (playerId) => {
    // Find the player in the game state
    const player = window.GameState?.players?.find(p => p.id === playerId);
    return player?.color || '#f9f9f9';
  }
};

console.log('CardTypeUtils.js code execution finished');
