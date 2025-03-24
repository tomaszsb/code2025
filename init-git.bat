@echo off
echo Initializing Git repository...
git init
echo Adding all files to staging...
git add .
echo Creating initial commit...
git commit -m "Initial project setup with core movement system"
echo Git repository initialized successfully!
echo.
echo Next steps:
echo 1. Start implementing the game board display
echo 2. Test movement between spaces
echo 3. Implement player turns
echo.
echo Refer to README.md and LESSONS_LEARNED.md for implementation guidance
pause
