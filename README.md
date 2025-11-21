# 🐾 Focus Pet - Virtual Pet Browser Companion

A virtual pet that lives in your browser and reacts to your browsing habits!

## Features

### Website Dashboard
- **Pet Selection**: Choose from Cat, Dog, or Dragon (premium)
- **Custom Avatars**: Upload your own image to create a custom pet
- **Site Reactions**: Configure how your pet reacts to different websites
- **Real-time Preview**: See your pet's animations before installing

### Chrome Extension
- **Always Visible**: Pet sits in the corner of every website
- **Smart Reactions**: Responds to your browsing behavior
  - 🎧 Headphones on YouTube
  - 😄 Excited on social media
  - 😴 Sleepy when inactive
  - 😊 Happy on productive sites
- **Behavior Tracking**: Monitors time spent and generates mood insights
- **Customizable**: Syncs with your website configuration

## Quick Start

### 1. Run the Website
```bash
node server.js
```
Visit `http://localhost:3000` to configure your pet.

### 2. Install Chrome Extension
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `extension` folder
5. The Focus Pet extension is now installed!

### 3. Configure Your Pet
1. On the website, choose your pet type
2. Set up site-specific reactions
3. Upload a custom avatar (optional)
4. Your settings are automatically synced to the extension

### 4. Browse and Watch Your Pet!
- Visit any website to see your pet in action
- Click the extension icon to see your browsing stats
- Your pet's mood changes based on your habits

## Pet Reactions

### Default Behaviors
- **YouTube**: Pet puts on headphones 🎧
- **Social Media**: Pet gets excited 😄
- **Productive Sites**: Pet looks happy 😊
- **Long Sessions**: Pet gets sleepy 😴
- **Inactive**: Pet falls asleep 💤

### Custom Reactions
Add your own site-specific reactions:
1. Enter website URL (e.g., "github.com")
2. Choose reaction (headphones, excited, sleepy, happy)
3. Pet will react when you visit that site

## Monetization Features (Planned)

### Free Tier
- Basic cat pet
- Simple reactions
- Basic mood tracking

### Premium Tier ($3.99/mo)
- Dragon and other premium pets
- Custom avatar uploads with AI animation
- Advanced mood analytics
- Daily pet stories
- Productivity insights
- Custom reaction library

## Technical Details

### Architecture
- **Website**: HTML/CSS/JS dashboard for configuration
- **Extension**: Chrome Extension (Manifest V3)
- **Storage**: Chrome Storage API for syncing
- **Tracking**: Background script monitors browsing behavior

### Files Structure
```
virtual-pet/
├── index.html          # Main dashboard
├── styles.css          # Dashboard styling
├── script.js           # Dashboard functionality
├── server.js           # Local development server
├── extension/
│   ├── manifest.json   # Extension configuration
│   ├── content.js      # Pet display logic
│   ├── background.js   # Behavior tracking
│   ├── pet.css         # Pet animations
│   ├── popup.html      # Extension popup
│   └── popup.js        # Popup functionality
└── README.md
```

## Development Roadmap

### Phase 1 (Current)
- ✅ Basic pet display and animations
- ✅ Site-specific reactions
- ✅ Custom avatar upload
- ✅ Chrome extension integration

### Phase 2 (Next)
- [ ] AI-powered avatar animation
- [ ] Advanced mood tracking
- [ ] Daily summaries and insights
- [ ] User accounts and cloud sync

### Phase 3 (Future)
- [ ] Premium pet types and skins
- [ ] Social features (pet sharing)
- [ ] Productivity gamification
- [ ] Mobile app companion

## API Integration (Future)

The system is designed to support:
- User authentication
- Cloud storage for pet configurations
- AI image processing for custom avatars
- Analytics and mood tracking APIs
- Subscription management

## Contributing

This is a prototype for a commercial product. The code demonstrates:
- Modern Chrome Extension development
- Real-time browser behavior tracking
- CSS animation techniques
- Local storage and data sync
- Monetization-ready architecture

## License

Proprietary - Focus Pet Concept Demo
