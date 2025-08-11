# ChoreMe Web App

A mobile-first Progressive Web Application for managing household chores and tracking family earnings.

## Features

- 📱 **Mobile-First Design** - Optimized for smartphones and tablets
- 🔄 **Offline Support** - Works without internet, syncs when reconnected
- 🏠 **PWA Ready** - Can be installed on home screen like a native app
- 🎯 **Real-time Updates** - Live chore status and earnings tracking
- 📸 **Photo Proof** - Camera integration for chore completion verification
- 🔔 **Push Notifications** - Reminders for due chores and earnings updates
- 💰 **Earnings Tracking** - Complete ledger of all transactions
- 🛍️ **Reward Store** - Redeem earnings for family rewards

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- ChoreMe API server running (see main project README)

### Installation

1. Clone the repository and navigate to the web directory:
   ```bash
   cd choreme/web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment file and configure:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your API server URL:
   ```
   REACT_APP_API_URL=http://localhost:8080/api/v1
   ```

5. Start the development server:
   ```bash
   npm start
   ```

The app will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `build/` directory.

## PWA Features

### Installation
- The app can be installed on mobile devices and desktops
- Look for the "Add to Home Screen" prompt on mobile browsers
- On desktop, look for the install icon in the address bar

### Offline Support
- Core functionality works offline
- Changes are queued and synced when connection is restored
- Cached data is available for up to 24 hours offline

### Push Notifications
- Chore reminders and deadline notifications
- Earnings updates when chores are approved
- Reward redemption status updates

## Mobile Optimization

### Touch-Friendly Design
- Large tap targets (minimum 44px)
- Intuitive gestures and interactions
- Optimized for one-handed use

### Performance
- Images automatically compressed to max 500px
- Lazy loading for better performance
- Service worker caching for instant loading

### Responsive Design
- Adapts to all screen sizes
- Safe area handling for notched devices
- Portrait orientation optimized

## Development

### Project Structure
```
src/
├── components/     # Reusable UI components
├── pages/         # Page components (screens)
├── hooks/         # Custom React hooks
├── services/      # API and utility services
├── types/         # TypeScript type definitions
└── utils/         # Helper functions
```

### Key Technologies
- **React 18** - Modern React with concurrent features
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **IndexedDB** - Offline data storage
- **Service Workers** - Background sync and caching

### Testing the PWA

1. **Mobile Testing:**
   - Use Chrome DevTools device emulation
   - Test on actual mobile devices
   - Verify touch interactions and gestures

2. **Offline Testing:**
   - Disable network in DevTools
   - Verify offline functionality
   - Test sync when reconnected

3. **PWA Audit:**
   - Use Lighthouse PWA audit
   - Verify manifest and service worker
   - Check installability criteria

## Deployment

### Static Hosting (Recommended)
The built app is a static site that can be hosted on:
- Netlify (with redirect rules for SPA)
- Vercel
- GitHub Pages
- Any static web server

### Environment Variables
Set these in your deployment environment:
- `REACT_APP_API_URL` - Your production API URL
- `REACT_APP_VAPID_PUBLIC_KEY` - For push notifications (optional)

### HTTPS Required
PWA features require HTTPS in production:
- Service workers require secure origin
- Camera API needs HTTPS
- Push notifications need secure context

## Browser Support

### Minimum Requirements
- Chrome/Edge 80+
- Firefox 75+
- Safari 13.1+
- iOS Safari 13.4+
- Android WebView 80+

### PWA Features Support
- Service Workers: All modern browsers
- Push Notifications: Chrome, Firefox, Edge (not iOS Safari)
- Install Prompt: Chrome, Edge, Samsung Internet
- Camera API: All modern browsers with HTTPS

## Troubleshooting

### Common Issues

1. **Camera not working:**
   - Ensure HTTPS is enabled
   - Check camera permissions
   - Try different browsers

2. **PWA not installable:**
   - Verify manifest.json is served correctly
   - Check service worker registration
   - Ensure HTTPS (except localhost)

3. **Offline sync not working:**
   - Check IndexedDB support
   - Verify service worker is registered
   - Check browser dev tools for errors

4. **API connection issues:**
   - Verify REACT_APP_API_URL is correct
   - Check CORS settings on API server
   - Ensure API server is running

## Contributing

1. Follow React and TypeScript best practices
2. Maintain mobile-first responsive design
3. Test on actual mobile devices when possible
4. Ensure accessibility guidelines are followed
5. Update this README when adding new features

## License

This project is part of the ChoreMe family chore management system.