# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0] - 2025-01-XX

### 🎉 Major Release - Custom Dashboard System

This is a major update that introduces a complete custom dashboard builder with real-time data visualization.

### ✨ Added

#### Custom Dashboard System
- **Dashboard Builder** - Visual drag-and-drop editor for creating custom dashboards
- **Widget Library** - 6 types of customizable widgets:
  - Speedometer - Circular gauge for speed display
  - Tachometer - RPM gauge with warning zones
  - Circular Gauge - Universal circular indicator
  - Linear Gauge - Horizontal/vertical bar gauges
  - Temperature Gauge - Vertical thermometer display
  - Digital Display - Large digital readout with glow effect

#### Real-time Features
- **WebSocket Integration** - Socket.IO for real-time data streaming
- **Live Preview** - Test dashboards with active sessions in real-time
- **Auto-update** - Widgets automatically update when new sensor data arrives

#### Sharing & Integration
- **Browser Source View** - Clean view for OBS/streaming (no UI, transparent background)
- **Public Sharing** - Generate public URLs for dashboards
- **Session Binding** - Link dashboards to specific active sessions

#### Widget Customization
- **Sensor Mapping** - Bind widgets to specific OBD2 PIDs
- **Color Customization** - Customize colors for each widget
- **Range Configuration** - Set min/max values, warning/danger thresholds
- **Label & Units** - Configure labels and units of measurement
- **Size & Position** - Drag, drop, and resize widgets
- **Grid Snapping** - Snap to grid for precise alignment

#### Database
- **Dashboard Model** - New database table for storing dashboard configurations
- **Session Enhancement** - Added `latestData` field to Sessions for caching

#### API Endpoints
- `GET /api/dashboards` - Get all dashboards for user
- `GET /api/dashboards/:id` - Get single dashboard
- `POST /api/dashboards` - Create new dashboard
- `PUT /api/dashboards/:id` - Update dashboard
- `DELETE /api/dashboards/:id` - Delete dashboard
- `PATCH /api/dashboards/:id/share` - Toggle public sharing
- `POST /api/dashboards/:id/duplicate` - Duplicate dashboard
- `GET /api/dashboards/shared/:shareId` - Get public dashboard

#### Web Routes
- `/dashboards` - Dashboard management page
- `/dashboard/editor/:id` - Visual dashboard editor
- `/dashboard/view/:id` - Dashboard preview with controls
- `/dashboard/live/:shareId` - Browser source view (public)

#### Controllers
- **DashboardController** - Complete CRUD operations for dashboards
- **Enhanced UploadController** - Now emits real-time data via WebSocket

#### Frontend Libraries
- **widgets.js** - Canvas-based widget rendering library
- **dashboard-editor.js** - Interactive dashboard editor
- **dashboard-live.js** - Real-time dashboard viewer

#### Views
- **dashboards.hbs** - Dashboard list and management
- **dashboard-editor.hbs** - Full-featured editor interface
- **dashboard-view.hbs** - Dashboard preview with session control
- **dashboard-live.hbs** - Standalone browser source view

#### Documentation
- **DASHBOARD_GUIDE.md** - Complete guide for using dashboards (EN/RU)
- **UPGRADE_INSTRUCTIONS.md** - Step-by-step upgrade guide (EN/RU)
- **EXAMPLES.md** - Dashboard configuration examples
- **CHANGELOG.md** - This file

### 📦 Updated

#### Dependencies
Major version updates for all dependencies:

**Core:**
- `express` 4.16.4 → 4.19.2
- `sequelize` 5.4.0 → 6.37.3
- `pg` 7.9.0 → 8.12.0
- `bcrypt` 3.0.4 → 5.1.1

**Template Engine:**
- `express-handlebars` 3.0.2 → 7.1.3

**Session & Auth:**
- `cookie-session` 1.3.3 → 2.1.0
- `express-session` 1.15.6 → 1.18.0
- `passport` 0.4.0 → 0.7.0

**Utilities:**
- `joi` 14.3.1 → 17.13.3
- `lodash` 4.17.13 → 4.17.21
- `moment` 2.24.0 → 2.30.1

**Development:**
- `eslint` 5.14.1 → 8.57.0
- `morgan` 1.9.1 → 1.10.0
- `nodemon` 1.18.10 → 3.1.4

**New Dependencies:**
- `socket.io` 4.7.5 - WebSocket server
- `axios` 1.7.4 - HTTP client (replaces deprecated `request`)
- `nanoid` 3.3.7 - ID generation
- `pg-hstore` 2.3.4 - Required for Sequelize 6

**Removed:**
- `request` 2.88.0 - Deprecated, replaced with axios
- `shortid` 2.2.14 - Replaced with nanoid

#### Core Files
- **app.js** - Added Socket.IO server, updated handlebars initialization
- **models/index.js** - Updated for Sequelize 6 compatibility
- **models/Session.js** - Added `latestData` field
- **controllers/UploadController.js** - Added WebSocket emission, replaced request with axios
- **controllers/PageController.js** - Added dashboard page renderers
- **routes/api.js** - Added dashboard API routes
- **routes/web.js** - Added dashboard web routes
- **views/partials/sidebar.hbs** - Added Dashboards link
- **package.json** - Version bumped to 2.0.0, updated all dependencies

### 🔧 Changed

#### Breaking Changes
- **Sequelize 6** - `sequelize.import()` replaced with `require()`
- **Express Handlebars 7** - API changed, now uses `engine()` function
- **HTTP Server** - Now uses `http.createServer()` for Socket.IO compatibility

#### Compatibility Updates
- All code updated to work with Node.js 14+
- Database queries updated for Sequelize 6
- Template rendering updated for Handlebars 7

### 🐛 Fixed
- Security vulnerabilities in old dependencies
- Deprecated API usage across codebase
- Compatibility issues with modern Node.js versions

### 🔒 Security
- Updated all dependencies to patch known vulnerabilities
- Replaced deprecated `request` library
- Updated bcrypt for better security

### 📚 Documentation
- Updated README.md with new features
- Added comprehensive dashboard guide
- Added upgrade instructions
- Added configuration examples
- Added changelog

### 🎯 Performance
- WebSocket for efficient real-time updates
- Canvas-based widgets for smooth rendering
- Optimized database queries
- Added data caching in Sessions

---

## [1.0.0] - 2019-XX-XX

### Initial Release

#### Features
- User authentication system
- Torque Pro data upload endpoint
- Session management (create, edit, delete)
- Session data editing (rename, locations, filter, cut, merge)
- Map view with GPS tracking
- Chart visualization
- Public sharing with unique IDs
- Request forwarding to other servers
- CSV export functionality

#### Tech Stack
- Node.js + Express
- PostgreSQL + Sequelize
- Handlebars templating
- Bootstrap frontend
- Leaflet maps
- Chart.js graphs
- Passport authentication

---

## Version History

- **2.0.0** - Custom Dashboard System (Current)
- **1.0.0** - Initial Release

---

## Upgrade Path

### From 1.0 to 2.0
See [UPGRADE_INSTRUCTIONS.md](UPGRADE_INSTRUCTIONS.md) for detailed upgrade guide.

**Quick steps:**
1. Backup database
2. Update code
3. Run `npm install`
4. Restart server
5. Database auto-migrates on first run

---

## Planned Features

### v2.1.0 (Future)
- [ ] Animated value transitions
- [ ] Custom background images
- [ ] Live chart widgets
- [ ] Theme templates library
- [ ] Mobile-optimized dashboards

### v2.2.0 (Future)
- [ ] Advanced widget customization
- [ ] Multi-language support
- [ ] Dashboard templates marketplace
- [ ] Export/import dashboard configs
- [ ] Widget grouping and layers

### v3.0.0 (Future)
- [ ] React-based editor
- [ ] 3D gauge widgets
- [ ] Video overlays
- [ ] AI-powered layouts
- [ ] Cloud sync

---

## Support

For issues, questions, or feature requests:
1. Check documentation files
2. Review UPGRADE_INSTRUCTIONS.md
3. Check console logs (F12)
4. Review server logs

---

**Contributors:** Original project + Dashboard system enhancement

**License:** MIT

