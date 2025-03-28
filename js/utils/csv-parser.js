// CSV Parser utility function
console.log('csv-parser.js file is being processed');

window.parseCSV = function(csvText) {
  console.log('CSV parsing started');
  
  // Remove UTF-8 BOM if present
  if (csvText.charCodeAt(0) === 0xFEFF) {
    csvText = csvText.slice(1);
  }
  
  try {
    // Split by lines (handle both \r\n and \n)
    const lines = csvText.split(/\r?\n/);
    
    if (lines.length === 0) {
      return [];
    }
    
    // Extract headers
    const headerLine = lines[0];
    if (!headerLine || headerLine.trim() === '') {
      return [];
    }
    
    const headers = headerLine.split(',').map(h => h.trim());
    
    // Parse rows
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line || line.trim() === '') {
        continue; // Skip empty lines
      }
      
      // Simple split by comma
      const values = line.split(',');
      
      // Skip if we don't have enough values
      if (values.length < 3) {
        continue;
      }
      
      const row = {};
      
      headers.forEach((header, index) => {
        // Safely get the value, defaulting to empty string if beyond bounds
        const value = index < values.length ? values[index].trim() : '';
        row[header] = value;
      });
      
      // Only add rows with a valid Space Name
      if (row['Space Name'] && row['Space Name'].trim() !== '') {
        data.push(row);
      }
    }
    
    console.log(`CSV parsing completed: ${data.length} rows`);
    return data;
  } catch (error) {
    console.error('Error parsing CSV:', error);
    return [];
  }
}

console.log('csv-parser.js execution complete');