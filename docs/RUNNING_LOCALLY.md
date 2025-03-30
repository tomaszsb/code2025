# Running the Project Management Game Locally

This document explains how to run the Project Management Game on your local machine to avoid CORS errors.

## What is CORS?

CORS (Cross-Origin Resource Sharing) is a security feature implemented by web browsers that restricts web pages from making requests to a different domain than the one that served the original page. When opening HTML files directly from your file system (using the `file://` protocol), browsers apply strict security rules that prevent JavaScript from loading local files.

## Setting Up a Local Server

To run this project properly, you need to use a local web server. Here are several options:

### Option 1: Using Visual Studio Code Live Server (Recommended)

1. Install Visual Studio Code if you don't have it already
2. Install the "Live Server" extension:
   - Click on the Extensions icon in the sidebar
   - Search for "Live Server"
   - Click "Install" on the extension by Ritwick Dey
3. Open the project folder in VS Code
4. Right-click on the `index.html` file
5. Select "Open with Live Server"
6. The project will open in your default browser (usually on http://127.0.0.1:5500)

### Option 2: Using Python's Built-in HTTP Server

If you have Python installed on your machine:

#### For Python 3:
1. Open a command prompt or terminal
2. Navigate to the project directory (`cd path/to/code2025`)
3. Run: `python -m http.server 8000`
4. Open your web browser and go to: `http://localhost:8000`

#### For Python 2:
1. Open a command prompt or terminal
2. Navigate to the project directory (`cd path/to/code2025`)
3. Run: `python -m SimpleHTTPServer 8000`
4. Open your web browser and go to: `http://localhost:8000`

### Option 3: Using Node.js http-server

If you have Node.js installed:

1. Install the http-server package globally:
   ```
   npm install -g http-server
   ```
2. Navigate to the project directory
3. Run: `http-server -p 8000`
4. Open your web browser and go to: `http://localhost:8000`

## Game Features Overview

The Project Management Game includes the following features that require proper local server setup:

### CSV Data Loading
The game loads several CSV files to populate:
- Game spaces and their properties
- Card data for different card types (W, B, I, L, E)
- Dice roll outcomes based on spaces and visit types

### Interactive Features
The game includes interactive elements that rely on proper JavaScript execution:
- 3D dice rolling with animations
- Card management system with filtering and interactions
- Dynamic board display with space filtering
- Player movement and resource tracking

## Troubleshooting

### Still Seeing CORS Errors?

- Make sure you're accessing the page through the server URL (http://localhost:...) and not by opening the file directly
- Check that all file paths in your HTML are correct and relative
- Try a different browser
- Ensure no browser extensions are interfering with the project

### Server Won't Start?

- Check if another process is already using the port (try a different port number)
- Ensure you have the necessary permissions to run a server on your machine
- Verify that Python or Node.js is installed correctly and accessible in your PATH

### Game Features Not Working?

- Check the browser console for JavaScript errors
- Verify that all CSV files are properly loaded
- Make sure you're using a modern browser with CSS3 and ES6 support
- Check that 3D transforms are supported for the dice rolling feature

## Development Notes

- Any changes you make to your files will be immediately available when using most development servers
- If using VS Code Live Server, it will automatically reload the page when files are saved
- For other servers, you may need to manually refresh the browser to see changes
- The 3D dice rolling feature uses CSS transforms which work best in modern browsers
- The card system uses CSS animations which might behave differently across browsers