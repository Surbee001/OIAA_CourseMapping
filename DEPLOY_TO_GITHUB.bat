@echo off
echo ========================================
echo  Deploying to GitHub
echo ========================================
echo.

REM Initialize Git repository
echo [1/5] Initializing Git repository...
git init
if errorlevel 1 (
    echo ERROR: Git not found. Please install Git from https://git-scm.com/
    pause
    exit /b 1
)

REM Add all files
echo.
echo [2/5] Adding all files...
git add .

REM Commit changes
echo.
echo [3/5] Committing changes...
git commit -m "feat: Production-ready Course Mapping System with enterprise security"

REM Set main branch
echo.
echo [4/5] Setting main branch...
git branch -M main

REM Add remote origin
echo.
echo [5/5] Adding remote and pushing to GitHub...
git remote add origin https://github.com/Surbee001/OIAA_CourseMapping.git 2>nul

REM Push to GitHub
git push -u origin main

echo.
echo ========================================
echo  Deployment Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Go to https://vercel.com/new
echo 2. Import repository: OIAA_CourseMapping
echo 3. Add environment variables from VERCEL_ENV_READY.txt
echo 4. Click Deploy
echo.
pause

