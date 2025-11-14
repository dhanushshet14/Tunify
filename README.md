# 🎵 Tunify - Music Streaming Platform

<div align="center">

![Tunify](https://img.shields.io/badge/Tunify-Music%20Streaming-1db954?style=for-the-badge&logo=spotify)
![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

**Your Personal Music Streaming Platform**

[Features](#features) • [Demo](#demo) • [Installation](#installation) • [Usage](#usage) • [API](#api-documentation) • [Contributing](#contributing)

</div>

---

## 📖 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Screenshots](#screenshots)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Development](#development)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## 🎯 About

**Tunify** is a full-stack music streaming web application built with AngularJS and Node.js. It provides a complete Spotify-like experience with features including music streaming, playlist management, search functionality, and real-time collaboration.

The platform integrates with the **Audius API** to provide access to 50+ trending tracks, while also allowing users to upload and manage their own music library.

### How It Works

**Frontend (AngularJS):**
- Single Page Application (SPA) with client-side routing
- Communicates with backend via REST API
- Real-time updates using Socket.IO
- Responsive design that works on all devices

**Backend (Node.js + Express):**
- RESTful API for all operations
- JWT-based authentication for secure access
- File upload handling for music and cover images
- Audio streaming with range request support

**Database (MongoDB Atlas):**
- Cloud-hosted NoSQL database
- Stores user accounts, songs, and playlists
- No local database installation required

**External API (Audius):**
- Provides 50+ trending tracks for streaming
- High-quality audio without preview limitations

### Why Tunify?

- 🎵 **Stream Real Music**: Access 50+ trending tracks from Audius
- 🎨 **Beautiful UI**: Spotify-inspired card design with smooth animations
- 📱 **Fully Responsive**: Works seamlessly on desktop, tablet, and mobile
- ☁️ **Cloud-Based**: MongoDB Atlas for reliable data storage (no local DB needed)
- 🔐 **Secure**: JWT authentication with bcrypt password hashing
- 🎧 **Feature-Rich**: Playlists, queue management, search, and more
- 🚀 **Easy Setup**: No complex configuration, just clone and run

---

## ✨ Features

### 🎵 Music Streaming
- Stream 50+ trending tracks from Audius API
- Full song playback (not just previews)
- High-quality audio streaming
- HTML5 audio player with range request support

### 🎨 User Interface
- Beautiful Spotify-style card grid
- Hover effects and smooth animations
- Responsive design (mobile, tablet, desktop)
- Dark theme with Spotify green accents
- Loading states and empty state designs

### 🎧 Player Controls
- Play, pause, seek functionality
- Next/previous track navigation
- Shuffle mode
- Repeat modes (off, all, one)
- Volume control and mute
- Progress bar with time display
- Queue management (add, remove, reorder)

### 📝 Playlist Management
- Create custom playlists
- Add/remove songs from playlists
- Edit playlist details
- Delete playlists
- Real-time collaborative playlists
- Public/private playlist options

### 🔍 Search & Discovery
- Real-time search with debouncing
- Search by song title, artist, album, or tags
- Instant results display
- Browse trending tracks

### 📤 Upload System
- Upload MP3, WAV, OGG, M4A files
- Upload custom cover images
- Automatic metadata extraction
- Manual metadata editing
- Tag system for categorization

### 🔐 Authentication
- User signup with validation
- Secure login with JWT tokens
- Password hashing with bcrypt
- Protected routes
- Persistent sessions
- Auto-redirect logic

### 🌐 Additional Features
- Progressive Web App (PWA) support
- Service worker for offline caching
- Real-time updates via Socket.IO
- State persistence (queue, settings)
- Cloud database (MongoDB Atlas)
- CORS-enabled API

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: AngularJS 1.8.3
- **Routing**: Angular Route
- **Real-time**: Socket.IO Client 4.7.2
- **Audio**: HTML5 Audio API
- **Styling**: CSS3 (Custom responsive design)
- **PWA**: Service Worker, Manifest.json
- **Storage**: LocalStorage for state persistence

### Backend
- **Runtime**: Node.js
- **Framework**: Express 4.18
- **Database**: MongoDB with Mongoose 7.6
- **Authentication**: JWT (jsonwebtoken)
- **Password**: bcryptjs
- **File Upload**: Multer
- **Real-time**: Socket.IO 4.7
- **Metadata**: music-metadata
- **CORS**: cors middleware

### External APIs
- **Audius API**: Music streaming and trending tracks

### Database
- **MongoDB Atlas**: Cloud database
- **Collections**: Users, Songs, Playlists

---

## 📸 Screenshots

### Landing Page
Beautiful hero section with call-to-action buttons and feature showcase.

### Home Page - Trending Tracks
Spotify-style card grid displaying 50 trending tracks from Audius with hover effects.

### Music Player
Full-featured player with controls, progress bar, and queue management.

### Playlist Management
Create, edit, and manage playlists with real-time collaboration support.

---

## 🚀 Installation & Setup

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download](https://git-scm.com/)
- **MongoDB Atlas Account** (Free) - [Sign Up](https://www.mongodb.com/cloud/atlas)

### Step-by-Step Installation Guide

#### 1. Clone the Repository

```bash
git clone https://github.com/dhanushshet14/Tunify.git
cd Tunify
```

#### 2. Set Up MongoDB Atlas (Cloud Database)

**Why MongoDB Atlas?** This project uses MongoDB Atlas as a cloud database, so you don't need to install MongoDB locally.

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account
2. Create a new cluster (choose the free M0 tier)
3. Wait for the cluster to be created (takes 3-5 minutes)
4. Click "Database Access" in the left sidebar:
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Set a username and password (remember these!)
   - Set "Database User Privileges" to "Read and write to any database"
   - Click "Add User"
5. Click "Network Access" in the left sidebar:
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (adds 0.0.0.0/0)
   - Click "Confirm"
6. Click "Database" in the left sidebar:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/`)
   - Replace `<password>` with your actual password
   - Add `tunify` as the database name before the `?` in the URL

Your final connection string should look like:
```
mongodb+srv://username:yourpassword@cluster0.xxxxx.mongodb.net/tunify?retryWrites=true&w=majority
```

#### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/tunify?retryWrites=true&w=majority
JWT_SECRET=your_secure_random_secret_key_change_this_in_production
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
```

**Important:** Replace the `MONGODB_URI` with your actual MongoDB Atlas connection string from Step 2.

#### 4. Install Dependencies

Install backend dependencies:
```bash
npm install
```

Install frontend dependencies:
```bash
cd frontend
npm install
cd ..
```

#### 5. Run the Application

You need to run both the backend and frontend servers.

**Option A: Using Two Terminals (Recommended)**

Terminal 1 - Backend Server:
```bash
npm run dev
```

Terminal 2 - Frontend Server:
```bash
cd frontend
npm start
```

**Option B: Using Windows Batch File**

```bash
START.bat
```

This will automatically open two command windows for backend and frontend.

#### 6. Access the Application

Open your browser and navigate to:
```
http://localhost:8080
```

**Important:** If you see `ERR_BLOCKED_BY_CLIENT` errors:
- Open the app in Incognito/Private mode (Ctrl+Shift+N in Chrome)
- OR disable browser extensions (ad blockers) temporarily

### Verify Installation

You should see:
- Backend running on `http://localhost:5000`
- Frontend running on `http://localhost:8080`
- MongoDB connection successful message in the backend terminal
- Landing page with "Sign Up" and "Login" buttons

### Quick Test

1. Click "Sign Up Free"
2. Create an account with username, email, and password
3. You'll be redirected to the home page
4. Browse trending tracks from Audius API
5. Click play on any track to start streaming

### Troubleshooting Installation

**Problem: `npm install` fails**
- Solution: Delete `node_modules` folder and `package-lock.json`, then run `npm install` again

**Problem: MongoDB connection error**
- Solution: Double-check your connection string in `.env` file
- Ensure your IP is whitelisted in MongoDB Atlas Network Access
- Verify database user credentials are correct

**Problem: Port already in use**
- Solution: Kill the process using the port:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <process_id> /F
  ```

**Problem: Frontend not loading**
- Solution: Make sure you're in the `frontend` directory when running `npm start`
- Check if port 8080 is available

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tunify?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_secure_random_secret_key_min_32_characters

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:8080
```

### MongoDB Atlas Setup

1. **Create Database User**
   - Go to Database Access
   - Add New Database User
   - Set username and password
   - Grant "Read and write to any database" role

2. **Whitelist IP Address**
   - Go to Network Access
   - Add IP Address
   - Use 0.0.0.0/0 for development (allow from anywhere)
   - Or add your specific IP address

3. **Get Connection String**
   - Go to Database → Connect
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Update database name to `tunify`

### Frontend Configuration

The frontend API URL is configured in `frontend/app/app.js`:

```javascript
.constant('API_URL', 'http://localhost:5000/api');
```

For production, update this to your deployed backend URL.

---

## 📖 Usage

### Creating an Account

1. Open http://localhost:8080
2. Click "Sign Up Free"
3. Enter username, email, and password
4. Click "Sign Up"
5. You'll be redirected to the home page

### Browsing Music

1. **Trending Tab**: View 50 trending tracks from Audius
2. **My Music Tab**: View your uploaded songs
3. Hover over any card to see the play button
4. Click play to start streaming

### Playing Music

1. Click the play button on any track
2. Use player controls at the bottom:
   - Play/Pause
   - Next/Previous
   - Shuffle
   - Repeat (off/all/one)
   - Volume control
   - Queue management

### Creating Playlists

1. Go to Library
2. Click "Create Playlist"
3. Enter playlist name
4. Add songs from search or browse pages
5. Manage playlist from Library page

### Uploading Music

1. Click "Upload" in navigation
2. Select audio file (MP3, WAV, OGG, M4A)
3. Optionally add cover image
4. Fill in metadata (title, artist, album, tags)
5. Click "Upload Song"

### Searching

1. Click "Search" in navigation
2. Type song name, artist, album, or tag
3. Results appear instantly
4. Click play or add to queue

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Signup
```http
POST /auth/signup
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string"
}

Response: 201 Created
{
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "username": "string",
    "email": "string"
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}

Response: 200 OK
{
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "username": "string",
    "email": "string"
  }
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer {token}

Response: 200 OK
{
  "id": "user_id",
  "username": "string",
  "email": "string",
  "playlists": []
}
```

### Song Endpoints

#### Upload Song
```http
POST /songs/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

Form Data:
- audio: File (required)
- cover: File (optional)
- title: string
- artist: string
- album: string
- tags: string (comma-separated)

Response: 201 Created
{
  "id": "song_id",
  "title": "string",
  "artist": "string",
  ...
}
```

#### Get All Songs
```http
GET /songs/all
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": "song_id",
    "title": "string",
    "artist": "string",
    "coverUrl": "string",
    "duration": number,
    ...
  }
]
```

#### Search Songs
```http
GET /songs/search?q={query}
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": "song_id",
    "title": "string",
    "artist": "string",
    ...
  }
]
```

### Playlist Endpoints

#### Create Playlist
```http
POST /playlists/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "string",
  "public": boolean
}

Response: 201 Created
{
  "id": "playlist_id",
  "title": "string",
  "owner": "user_id",
  "songs": [],
  ...
}
```

#### Get User Playlists
```http
GET /playlists/my
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": "playlist_id",
    "title": "string",
    "songs": [],
    ...
  }
]
```

#### Add Song to Playlist
```http
POST /playlists/{id}/addSong
Authorization: Bearer {token}
Content-Type: application/json

{
  "songId": "song_id"
}

Response: 200 OK
{
  "id": "playlist_id",
  "songs": [...],
  ...
}
```

### Streaming Endpoint

#### Stream Audio
```http
GET /stream/{filename}

Supports Range requests for seeking
Response: 206 Partial Content (with Range)
Response: 200 OK (without Range)
```

---

## 📁 Project Structure

```
tunify/
├── backend/                    # Node.js + Express backend
│   ├── middleware/
│   │   └── auth.js            # JWT authentication middleware
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── Song.js            # Song schema
│   │   └── Playlist.js        # Playlist schema
│   ├── routes/
│   │   ├── auth.js            # Authentication routes
│   │   ├── songs.js           # Song CRUD routes
│   │   ├── playlists.js       # Playlist routes
│   │   └── stream.js          # Audio streaming
│   └── server.js              # Express server setup
│
├── frontend/                   # AngularJS frontend
│   ├── app/
│   │   ├── controllers/       # AngularJS controllers
│   │   │   ├── MainController.js
│   │   │   ├── LandingController.js
│   │   │   ├── AuthController.js
│   │   │   ├── HomeController.js
│   │   │   ├── SearchController.js
│   │   │   ├── LibraryController.js
│   │   │   ├── UploadController.js
│   │   │   ├── PlayerController.js
│   │   │   └── PlaylistController.js
│   │   ├── services/          # AngularJS services
│   │   │   ├── AuthService.js
│   │   │   ├── SongService.js
│   │   │   ├── PlaylistService.js
│   │   │   ├── PlayerService.js
│   │   │   ├── SocketService.js
│   │   │   └── AudiusService.js
│   │   ├── views/             # HTML templates
│   │   │   ├── landing.html
│   │   │   ├── login.html
│   │   │   ├── signup.html
│   │   │   ├── home.html
│   │   │   ├── search.html
│   │   │   ├── library.html
│   │   │   ├── upload.html
│   │   │   └── playlist.html
│   │   └── app.js             # AngularJS app config
│   ├── styles/
│   │   └── main.css           # Complete styling
│   ├── index.html             # Main HTML file
│   ├── manifest.json          # PWA manifest
│   ├── service-worker.js      # Service worker
│   └── package.json           # Frontend dependencies
│
├── uploads/                    # Uploaded files storage
├── .env                        # Environment variables
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
├── package.json               # Backend dependencies
├── README.md                  # This file
├── INSTALL.bat                # Windows installer
└── START.bat                  # Windows starter
```

---

## 💻 Development

### Running in Development Mode

The backend uses `nodemon` for auto-reload on file changes:

```bash
# Backend with auto-reload (watches for file changes)
npm run dev

# Frontend (serves static files)
cd frontend
npm start
```

### Project Architecture

**Backend Structure:**
```
backend/
├── middleware/
│   └── auth.js          # JWT token verification
├── models/
│   ├── User.js          # User schema (username, email, password)
│   ├── Song.js          # Song schema (title, artist, file paths)
│   └── Playlist.js      # Playlist schema (title, songs array)
├── routes/
│   ├── auth.js          # POST /signup, /login, GET /me
│   ├── songs.js         # POST /upload, GET /all, /search
│   ├── playlists.js     # CRUD operations for playlists
│   └── stream.js        # GET /stream/:filename (audio streaming)
└── server.js            # Express app setup, MongoDB connection
```

**Frontend Structure:**
```
frontend/
├── app/
│   ├── controllers/     # Handle user interactions
│   ├── services/        # API calls and business logic
│   ├── views/           # HTML templates
│   └── app.js           # AngularJS config and routing
├── styles/
│   └── main.css         # All styling (Spotify-inspired)
└── index.html           # Main entry point
```

### Key Technologies Explained

**AngularJS (Frontend):**
- Two-way data binding for reactive UI
- Dependency injection for services
- Client-side routing with `ngRoute`
- Controllers handle view logic, Services handle data

**Express (Backend):**
- Middleware-based request handling
- RESTful API design
- JWT middleware protects routes
- Multer handles file uploads

**MongoDB + Mongoose:**
- Schema-based data modeling
- Async/await for database operations
- Automatic validation and type casting

**Socket.IO:**
- Real-time bidirectional communication
- Used for live playlist updates
- WebSocket with fallback to polling

### Code Style

- **Backend**: ES6+ JavaScript with async/await
- **Frontend**: AngularJS 1.x patterns
- **CSS**: BEM-like naming convention
- **Indentation**: 2 spaces

### Adding New Features

1. Create feature branch: `git checkout -b feature/your-feature`
2. Implement feature
3. Test thoroughly
4. Update documentation
5. Submit pull request

### API Testing

Test the API endpoints using curl or Postman:

```bash
# Health check
curl http://localhost:5000/api/health

# Test signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"password123"}'

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Environment Variables Explained

```env
PORT=5000                    # Backend server port
MONGODB_URI=mongodb+srv://... # MongoDB Atlas connection string
JWT_SECRET=random_string     # Secret key for JWT token signing
NODE_ENV=development         # Environment (development/production)
FRONTEND_URL=http://...      # Frontend URL for CORS
```

---

## 🚢 Deployment

### Backend Deployment (Heroku)

1. **Create Heroku app**
```bash
heroku create tunify-api
```

2. **Add MongoDB Atlas**
```bash
heroku config:set MONGODB_URI="your_mongodb_atlas_uri"
heroku config:set JWT_SECRET="your_secure_secret"
```

3. **Deploy**
```bash
git push heroku main
```

### Frontend Deployment (Netlify)

1. **Update API URL** in `frontend/app/app.js`
```javascript
.constant('API_URL', 'https://tunify-api.herokuapp.com/api');
```

2. **Deploy to Netlify**
```bash
cd frontend
netlify deploy --prod --dir=.
```

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=secure_random_string_min_32_chars
FRONTEND_URL=https://your-frontend-url.netlify.app
```

---

## 🔧 Troubleshooting

### Common Issues

#### MongoDB Connection Error
**Problem**: `MongoDB connection error: bad auth`

**Solution**:
1. Check MongoDB Atlas credentials
2. Verify IP whitelist (0.0.0.0/0 for development)
3. Ensure database user exists with correct password

#### Browser Extension Blocking
**Problem**: `ERR_BLOCKED_BY_CLIENT`

**Solution**:
- Use incognito mode (Ctrl+Shift+N)
- Or disable browser extensions (ad blockers)

#### Audio Not Playing
**Problem**: Songs don't play or only play previews

**Solution**:
- Check browser console for errors
- Verify Audius API is accessible
- Ensure audio format is supported

#### Port Already in Use
**Problem**: `Port 5000 already in use`

**Solution**:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <process_id> /F

# Linux/Mac
lsof -ti:5000 | xargs kill
```

### Debug Mode

Enable detailed logging:
```javascript
// In backend/server.js
console.log('Request:', req.method, req.path);

// In frontend controllers
console.log('Data:', data);
```

### Getting Help

- Check documentation files in the project
- Review `TESTING_GUIDE.md` for test procedures
- See `TROUBLESHOOTING.md` for detailed solutions

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
```bash
git checkout -b feature/amazing-feature
```

3. **Commit your changes**
```bash
git commit -m 'Add amazing feature'
```

4. **Push to the branch**
```bash
git push origin feature/amazing-feature
```

5. **Open a Pull Request**

### Contribution Guidelines

- Follow existing code style
- Add tests for new features
- Update documentation
- Keep commits atomic and well-described
- Ensure all tests pass

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Contact

**Project Maintainer**: Dhanush Shet

- GitHub: [@dhanushshet14](https://github.com/dhanushshet14)
- Project Link: [https://github.com/dhanushshet14/Tunify](https://github.com/dhanushshet14/Tunify)

---

## 🙏 Acknowledgments

- [Audius](https://audius.co/) - For providing the music streaming API
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - For cloud database hosting
- [AngularJS](https://angularjs.org/) - Frontend framework
- [Express](https://expressjs.com/) - Backend framework
- [Socket.IO](https://socket.io/) - Real-time communication

---

## 📊 Project Stats

- **Version**: 1.0.0
- **Status**: Production Ready
- **Last Updated**: November 2025
- **Total Files**: 50+
- **Lines of Code**: 5,600+
- **Documentation**: 2,500+ lines

---

<div align="center">

**Made with ❤️ and 🎵**

**Tunify - Your Personal Music Streaming Platform**

[⬆ Back to Top](#-tunify---music-streaming-platform)

</div>
