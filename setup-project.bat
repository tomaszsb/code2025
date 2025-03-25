@echo off
echo ===================================================
echo Project Management Game - Setup Script
echo ===================================================
echo.

REM Initialize Git repository if it doesn't exist
if not exist ".git" (
    echo Initializing Git repository...
    git init
    echo Adding all files to staging...
    git add .
    echo Creating initial commit...
    git commit -m "Initial project setup with core movement system"
    echo Git repository initialized successfully!
    echo.
) else (
    echo Git repository already initialized.
    echo.
)

REM Check if Python is installed for running a local server
python --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Python detected. You can run a local server with:
    echo python -m http.server 8000
    echo.
    echo Then visit: http://localhost:8000
    echo.
    
    echo Would you like to start the Python server now? (Y/N)
    set /p startserver=
    if /i "%startserver%"=="Y" (
        echo Starting Python server...
        start "" http://localhost:8000
        python -m http.server 8000
    )
) else (
    echo Python not detected. Please install Python or use another method 
    echo to run a local server as described in docs/RUNNING_LOCALLY.md
    echo.
)

echo ===================================================
echo Next steps:
echo 1. Run the project using a local web server
echo 2. Implement board movement functionalities
echo 3. Test with multiple players
echo ===================================================
echo.
echo See docs/README.md for more information.
echo.
pause
