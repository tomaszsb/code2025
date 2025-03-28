// CSV Parser utility function
window.parseCSV = function(csvText) {
  console.log('Starting CSV parsing with text length:', csvText.length);
  
  // Remove UTF-8 BOM if present
  if (csvText.charCodeAt(0) === 0xFEFF) {
    console.log('Removing UTF-8 BOM character');
    csvText = csvText.slice(1);
  }
  
  try {
    // Split by lines (handle both \r\n and \n)
    const lines = csvText.split(/\r?\n/);
    console.log(`CSV has ${lines.length} lines`);
    
    if (lines.length === 0) {
      console.error('No lines found in CSV');
      return [];
    }
    
    // Extract headers
    const headerLine = lines[0];
    if (!headerLine || headerLine.trim() === '') {
      console.error('No header line found in CSV');
      return [];
    }
    
    // Basic logging of the first line to diagnose issues
    console.log('Header line:', headerLine.substring(0, 50) + '...');
    
    const headers = headerLine.split(',').map(h => h.trim());
    console.log(`Found ${headers.length} headers:`, headers.slice(0, 5));
    
    // Check if headers exist
    if (headers.length === 0) {
      console.error('No headers extracted from CSV');
      return [];
    }
    
    // Parse rows
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line || line.trim() === '') {
        console.log(`Skipping empty line ${i}`);
        continue; // Skip empty lines
      }
      
      // Simple split by comma - for more complex CSVs with quoted fields, we would need a more sophisticated approach
      const values = line.split(',');
      
      // Skip if we don't have enough values
      if (values.length < 3) {
        console.log(`Skipping line ${i}: insufficient values (${values.length})`);
        continue;
      }
      
      const row = {};
      
      // For debugging the first few rows
      if (i < 3) {
        console.log(`Row ${i} has ${values.length} values:`, values.slice(0, 5));
      }
      
      headers.forEach((header, index) => {
        // Safely get the value, defaulting to empty string if beyond bounds
        const value = index < values.length ? values[index].trim() : '';
        row[header] = value;
      });
      
      // Only add rows with a valid Space Name
      if (row['Space Name'] && row['Space Name'].trim() !== '') {
        data.push(row);
      } else {
        console.log(`Skipping row ${i}: missing Space Name`);
      }
    }
    
    console.log(`Successfully parsed ${data.length} rows`);
    
    // Log the first space for debugging
    if (data.length > 0) {
      console.log('First space:', data[0]['Space Name']);
    }
    
    return data;
  } catch (error) {
    console.error('Error parsing CSV:', error);
    return [];
  }
}