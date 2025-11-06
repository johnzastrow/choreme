# ChoreMe with Embedded UI - Go Only Setup

This guide shows you how to build ChoreMe with the React UI embedded directly into the Go binary, so you only need Go installed (no Node.js required at runtime).

## 🎯 Two Approaches Available

### Option A: Pre-built with Embedded UI (Recommended)

This embeds the React PWA directly into the Go binary:

#### Build Steps (One-time Setup)
```bash
# 1. Build with embedded UI (requires Node.js for build only)
make build-ui

# OR manually:
./scripts/build-with-ui.sh      # Linux/Mac
scripts\build-with-ui.bat       # Windows
```

#### Run Steps (Go Only)
```bash
# 2. Run the single binary
./choreme                       # Linux/Mac
choreme.exe                     # Windows
```

**Result**: Full ChoreMe app available at `http://localhost:8080` (both API and UI)

### Option B: Pure Go HTML Templates

For a completely Go-only solution, you could replace React with Go HTML templates:

```go
// Example: internal/templates/dashboard.html
<!DOCTYPE html>
<html>
<head>
    <title>ChoreMe Dashboard</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>/* Mobile-first CSS */</style>
</head>
<body>
    <h1>Welcome, {{.User.Name}}</h1>
    <div>Balance: ${{.Balance}}</div>
    <!-- Server-rendered HTML -->
</body>
</html>
```

## 🚀 Quick Commands

### One-Time Build (Need Node.js for this step only)
```bash
# Windows
scripts\build-with-ui.bat

# Linux/Mac  
make build-ui
```

### Runtime (Go Only - No Node.js needed)
```bash
# Start the app
./choreme                 # Linux/Mac
choreme.exe              # Windows

# Visit in browser
# http://localhost:8080
```

## 📂 How It Works

1. **Build Time**: React app is built and embedded into Go binary using `go:embed`
2. **Runtime**: Go serves the embedded React files + API from single port
3. **Result**: Single executable with both backend and frontend

## 🔄 Update Process

When you update the React UI:

```bash
# Rebuild the embedded version
make build-ui

# Run the updated binary
./choreme
```

## 🎯 Benefits of Embedded UI

✅ **Single Binary**: Deploy just one file  
✅ **No Node.js Required**: At runtime, only Go needed  
✅ **Same UI Experience**: Full React PWA functionality  
✅ **Easy Deployment**: Copy single executable  
✅ **Offline Capable**: PWA features still work  

## 📱 Mobile Experience

The embedded UI maintains all PWA features:
- Install to home screen
- Offline functionality  
- Camera integration
- Push notifications
- Mobile-optimized interface

## 🔧 Customization

To modify the UI after embedding:
1. Edit files in `web/src/`
2. Run `make build-ui` to rebuild
3. Restart the Go binary

## 🚨 Troubleshooting

**"Web UI not available" message?**
- The build script didn't run successfully
- Run `make build-ui` to embed the UI
- Check that `internal/web/build/` directory exists

**Build script fails?**
- Install Node.js (needed for build only)
- Run `npm install` in the `web/` directory
- Try building manually: `cd web && npm run build`

## 🔍 File Structure After Build

```
choreme/
├── choreme             # Single executable with UI embedded
├── internal/web/
│   └── build/         # Embedded React build files
└── web/               # React source (for development)
```

The `choreme` binary contains everything - no external files needed!