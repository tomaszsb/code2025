// CSV Parser utility function
function parseCSV(csvText) {
  // Split by lines
  const lines = csvText.split('\n');
  // Extract headers
  const headers = lines[0].split(',').map(h => h.trim());
  
  // Parse rows
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue; // Skip empty lines
    
    const values = lines[i].split(',').map(v => v.trim());
    const row = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    
    data.push(row);
  }
  
  return data;
}