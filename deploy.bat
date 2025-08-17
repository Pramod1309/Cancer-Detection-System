@echo off
echo 🏥 Cancer Detection System - Deployment Script
echo ==============================================

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git is not installed. Please install Git first.
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.11+ first.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed!

REM Initialize git repository if not already done
if not exist ".git" (
    echo 📁 Initializing Git repository...
    git init
    echo ✅ Git repository initialized
) else (
    echo ✅ Git repository already exists
)

REM Add all files to git
echo 📝 Adding files to Git...
git add .

REM Commit changes
echo 💾 Committing changes...
git commit -m "Initial commit: Cancer Detection System"

echo.
echo 🚀 Deployment Steps:
echo ===================
echo.
echo 1. 📤 Push to GitHub:
echo    - Create a new repository on GitHub
echo    - Run: git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
echo    - Run: git push -u origin main
echo.
echo 2. 🌐 Deploy to Render:
echo    - Go to https://render.com
echo    - Sign up/Login with GitHub
echo    - Click 'New Web Service'
echo    - Connect your GitHub repository
echo    - Set Build Command: pip install -r requirements.txt
echo    - Set Start Command: gunicorn app:app
echo    - Choose Free plan
echo    - Click 'Create Web Service'
echo.
echo 3. ⏳ Wait for deployment (5-10 minutes)
echo.
echo 4. 🎉 Your app will be live at: https://YOUR_APP_NAME.onrender.com
echo.
echo 📚 For detailed instructions, see README.md
echo.
echo ✅ Deployment script completed!
pause 