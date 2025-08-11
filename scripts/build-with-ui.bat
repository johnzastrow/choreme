@echo off
REM Build script that includes React UI in Go binary (Windows)

echo 🏗️  Building ChoreMe with embedded UI...

REM Check if Node.js is available
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js/npm not found. Installing UI dependencies requires Node.js.
    echo    You can still build the backend-only version with: go build cmd/choreme/main.go
    exit /b 1
)

REM Build React PWA
echo 📦 Building React PWA...
cd ..\web
call npm install --silent
call npm run build
cd ..\choreme

REM Create the embed directory structure
echo 📁 Preparing embedded files...
if not exist "internal\web\build" mkdir "internal\web\build"
xcopy "..\web\build\*" "internal\web\build\" /E /H /C /I /Y >nul

REM Build Go binary with embedded UI
echo 🚀 Building Go binary with embedded UI...
go build -o choreme.exe cmd/choreme/main.go

echo ✅ Build complete! Run 'choreme.exe' to start with embedded UI
echo    The UI will be available at http://localhost:8080