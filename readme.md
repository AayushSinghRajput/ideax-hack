# Sahayatri - Intelligent Agricultural Platform

> **An intelligent agricultural platform designed to empower farmers with modern technology, real-time market insights, and AI-driven crop management solutions.**

## 📋 Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
  - [Client Setup](#client-setup)
  - [Server Setup](#server-setup)
  - [FastAPI Backend Setup](#fastapi-backend-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Key Components & Services](#key-components--services)
- [Environment Variables](#environment-variables)
- [Project Structure Details](#project-structure-details)
- [Contributing](#contributing)

---

## 📱 Overview

**Sahayatri** is a comprehensive agricultural platform that combines a mobile-first client, a Node.js REST API backend, and a FastAPI AI service to provide farmers with:

- 🌾 **Crop Management**: Monitor and manage crop health, get AI-powered crop disease recommendations
- 🤖 **AI Voice Interaction**: Conduct voice-based conversations with AI agents for guidance
- 💱 **Market Price Tracking**: Real-time agricultural commodity price updates
- 🛒 **Product Marketplace**: Buy and sell agricultural products and equipment
- 🚜 **Equipment Rental**: Rent farming machinery and tools
- 📰 **Agricultural News**: Stay updated with latest agricultural news and insights
- 🌤️ **Weather Forecasts**: Real-time weather data and agricultural forecasts
- 📊 **Crop Analysis**: AI-powered analysis of crop health and recommendations
- 🗣️ **Voice Search & Text-to-Speech**: Accessible interface for farmers

---

## 🗂️ Project Structure

```
ideax-hack/
├── Client/                          # React Native Expo Mobile App
│   ├── app/                         # App routing and screens
│   │   ├── (auth)/                 # Authentication screens
│   │   ├── (tabs)/                 # Tab navigation screens
│   │   ├── index.tsx               # Entry point
│   │   ├── billing.js              # Billing screen
│   │   ├── chat.js                 # Chat interface
│   │   ├── crop-details.js         # Crop details screen
│   │   ├── crop-health.js          # Crop health monitoring
│   │   ├── my-crops.js             # User's crops management
│   │   ├── RentMachine.js          # Equipment rental
│   │   ├── RentCrop.js             # Crop rental
│   │   └── News.js                 # News feed
│   ├── components/                  # Reusable React components
│   │   ├── WeatherCard.js          # Weather display
│   │   ├── CropForm.js             # Crop input form
│   │   ├── MachineForm.js          # Machine/equipment form
│   │   ├── VoiceSearchBar.js       # Voice search component
│   │   ├── HomeHeader.js           # Header component
│   │   └── [other components]      # Additional UI components
│   ├── services/                    # API & external service integrations
│   │   ├── authService.js          # Authentication
│   │   ├── weatherService.js       # Weather API
│   │   ├── marketPriceService.js   # Market price data
│   │   ├── newsService.js          # News fetching
│   │   ├── voiceRecordingService.js# Voice recording
│   │   ├── voiceTranscriptionService.js # Audio transcription
│   │   ├── ttsService.js           # Text-to-speech
│   │   └── [other services]        # Additional services
│   ├── constants/                   # App constants & data
│   │   ├── crop-data.js            # Crop information
│   │   ├── agriNewsData.js         # Agricultural news data
│   │   ├── i18n.js                 # Internationalization
│   │   ├── numberTranslator.js     # Language translations
│   │   └── weatherTranslations.js  # Weather translations
│   ├── context/                     # React Context (Auth state)
│   ├── hooks/                       # Custom React hooks
│   │   └── useLocation.js          # Location tracking
│   ├── store/                       # Redux store
│   │   ├── store.js                # Store configuration
│   │   ├── languageSlice.js        # Language state
│   │   └── locationSlice.js        # Location state
│   ├── assets/                      # Images, fonts, icons
│   │   ├── images/
│   │   ├── fonts/
│   │   ├── crops/
│   │   └── machine/
│   ├── package.json                 # Dependencies
│   ├── app.json                     # Expo configuration
│   ├── tsconfig.json                # TypeScript config
│   └── babel.config.js              # Babel configuration
│
├── Server/                          # Node.js Express Backend
│   ├── routes/                      # API route definitions
│   │   ├── authRoutes.js           # Auth endpoints
│   │   ├── productRoutes.js        # Product management
│   │   ├── machineRoutes.js        # Machine/equipment endpoints
│   │   ├── analysisRoutes.js       # Crop analysis endpoints
│   │   ├── newsRoutes.js           # News endpoints
│   │   ├── priceRoutes.js          # Market price endpoints
│   │   ├── prebookingRoutes.js     # Pre-booking endpoints
│   │   └── audioRoutes.js          # Audio processing
│   ├── controllers/                 # Route handlers
│   │   ├── authController.js       # Auth logic
│   │   ├── productController.js    # Product logic
│   │   ├── machineController.js    # Machine logic
│   │   ├── analysisController.js   # Analysis logic
│   │   ├── newsController.js       # News logic
│   │   ├── priceController.js      # Price logic
│   │   ├── prebookingController.js # Prebooking logic
│   │   └── audioController.js      # Audio processing logic
│   ├── models/                      # MongoDB schemas
│   │   ├── Machine.js              # Machine/equipment schema
│   │   ├── News.js                 # News schema
│   │   ├── Prebooking.js           # Prebooking schema
│   │   └── [other models]          # Additional schemas
│   ├── config/                      # Configuration files
│   │   ├── db.js                   # MongoDB connection
│   │   ├── cloudinary.js           # Cloudinary image storage
│   │   └── scheduler.js            # Job scheduling
│   ├── middleware/                  # Express middleware
│   │   ├── authMiddleware.js       # JWT verification
│   │   └── errorHandler.js         # Error handling
│   ├── services/                    # Business logic
│   │   └── [service files]         # Reusable business logic
│   ├── cron/                        # Scheduled tasks
│   │   └── dailyScraper.js         # Daily data scraping
│   ├── utils/                       # Utility functions
│   ├── uploads/                     # File upload storage
│   ├── server.js                    # Express app entry point
│   ├── package.json                 # Dependencies
│   └── groq.js                      # Groq AI integration
│
├── fastapi_backend/                 # Python FastAPI AI Service
│   ├── app/                         # Main application
│   │   ├── main.py                 # FastAPI app & endpoints
│   │   ├── agent.py                # AI agent logic
│   │   ├── llm.py                  # LLM integration (Groq/Google)
│   │   ├── prompts.py              # AI prompt templates
│   │   ├── whisper_stt.py          # Speech-to-text using Whisper
│   │   ├── schemas.py              # Pydantic data models
│   │   ├── config.py               # Configuration
│   │   └── utils.py                # Utility functions
│   ├── data/                        # Data storage
│   │   └── uploads/                # Temporary file uploads
│   ├── requirements.txt             # Python dependencies
│   └── README.md                    # Backend documentation
│
└── readme.md                        # This file
```

---

## 🛠️ Tech Stack

### **Frontend (Client)**
- **Framework**: React Native (Expo)
- **Language**: TypeScript/JavaScript
- **State Management**: Redux Toolkit
- **Navigation**: Expo Router
- **UI Components**: React Native Paper
- **HTTP Client**: Axios
- **Voice Features**: expo-speech, expo-audio
- **Location**: expo-location
- **Image Handling**: Cloudinary (via backend)
- **Storage**: AsyncStorage
- **Styling**: React Native StyleSheet

### **Backend (Node.js)**
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Image Storage**: Cloudinary
- **Job Scheduling**: node-cron
- **Web Scraping**: Cheerio, Puppeteer
- **PDF Processing**: pdf-parse
- **File Upload**: Multer
- **Translation**: Google Translate API
- **AI Integration**: Groq SDK

### **AI Backend (Python)**
- **Framework**: FastAPI
- **Language Model**: Groq API, Google GenAI, OpenAI
- **Speech-to-Text**: OpenAI Whisper
- **LLM Framework**: LangChain
- **Data Validation**: Pydantic
- **Server**: Uvicorn
- **Audio Processing**: ffmpeg-python

---

## ✨ Features

### **🔐 User Authentication**
- User registration and login
- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access (Farmer, User)

### **🌾 Crop Management**
- Create and manage crop information
- Track crop health status
- AI-powered crop recommendations
- Crop history and analytics
- Crop details with images

### **🤖 AI Voice Agent**
- Voice-based interaction with AI
- Speech-to-text using Whisper
- Natural language processing via Groq/Google AI
- Text-to-speech responses
- Context-aware conversations
- Multi-language support

### **💱 Market Intelligence**
- Real-time agricultural commodity pricing
- Market trend analysis
- Price history tracking
- Regional price comparisons

### **🛒 Product Marketplace**
- Buy and sell agricultural products
- Product listings with images
- Order management
- Product search and filtering
- Recent purchases tracking

### **🚜 Equipment Rental System**
- Browse available farming equipment
- Machine rental with flexible pricing
- Pre-booking system
- Rental terms and conditions
- Machine availability tracking
- Pickup/delivery options

### **📰 Agricultural News & Updates**
- Daily news scraping and aggregation
- Agricultural tips and recommendations
- Seasonal advice
- Multilingual support

### **🌤️ Weather Integration**
- Real-time weather data
- Agricultural weather forecasts
- Location-based forecasts
- Weather alerts
- Integration with multiple weather services

### **🗣️ Voice & Accessibility Features**
- Voice search functionality
- Text-to-speech narration
- Voice recording for orders
- Audio transcription
- Supports multiple languages

### **📊 Analytics & Insights**
- Crop health analysis
- Yield predictions
- Performance metrics
- Usage statistics

---

## 📋 Prerequisites

### **Global Requirements**
- **Node.js** v16 or higher
- **Python** v3.8 or higher
- **MongoDB** (local or cloud instance)
- **npm** or **yarn**
- **pip** (Python package manager)

### **API Keys & Credentials**
- **Groq API Key** (for AI)
- **Google GenAI API Key** (alternative AI provider)
- **MongoDB URI** (connection string)
- **Cloudinary Account** (for image storage)
- **Weather API Keys** (optional)
- **Google Translate API** (optional)

---

## 🚀 Installation & Setup

### **Clone the Repository**
```bash
git clone https://github.com/AayushSinghRajput/ideax-hack.git
cd ideax-hack
```

### **Client Setup**

#### 1. Install Dependencies
```bash
cd Client
npm install
# or
yarn install
```

#### 2. Configure Environment Variables
Create a `.env` file in the `Client/` directory:
```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:5000
EXPO_PUBLIC_FASTAPI_URL=http://localhost:8000
EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY=your_key_here
EXPO_PUBLIC_WEATHER_API_KEY=your_key_here
```

#### 3. Update `app.config.js`
```javascript
// Add your API endpoints
extra: {
  API_BASE_URL: "http://localhost:5000",
  FASTAPI_URL: "http://localhost:8000",
}
```

#### 4. Run the Client
```bash
# Start development server
npm start

# Run on specific platform
npm run android    # Android emulator/device
npm run ios        # iOS simulator
npm run web        # Web browser
```

---

### **Server Setup**

#### 1. Install Dependencies
```bash
cd Server
npm install
# or
yarn install
```

#### 2. Configure Environment Variables
Create a `.env` file in the `Server/` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-krishi
# or use cloud
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-krishi

# Authentication
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Cloudinary (Image Storage)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Groq AI
GROQ_API_KEY=your_groq_api_key

# Google Translate (optional)
GOOGLE_TRANSLATE_API_KEY=your_key

# Weather Service (optional)
WEATHER_API_KEY=your_weather_api_key

# Node Environment
NODE_ENV=development
```

#### 3. Install MongoDB (if using locally)
```bash
# macOS
brew install mongodb-community

# Ubuntu/Debian
sudo apt-get install -y mongodb

# Windows
# Download from: https://www.mongodb.com/try/download/community
```

#### 4. Start MongoDB (if local)
```bash
# macOS
brew services start mongodb-community

# Ubuntu/Debian
sudo systemctl start mongod

# Windows
# Use MongoDB Compass or command line
mongod
```

#### 5. Run the Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start at `http://localhost:5000`

---

### **FastAPI Backend Setup**

#### 1. Create Virtual Environment
```bash
cd fastapi_backend

# On Windows
python -m venv venv
venv\Scripts\activate

# On macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

#### 2. Install Python Dependencies
```bash
pip install -r requirements.txt
```

#### 3. Configure Environment Variables
Create a `.env` file in the `fastapi_backend/` directory:
```env
GROQ_API_KEY=your_groq_api_key
GOOGLE_API_KEY=your_google_genai_api_key
OPENAI_API_KEY=your_openai_api_key (optional)
```

#### 4. Run the FastAPI Server
```bash
# Development mode with auto-reload
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production mode
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

The FastAPI backend will start at `http://localhost:8000`

---

## 🎯 Running the Application

### **Complete Setup (All Services)**

#### Terminal 1: MongoDB (if local)
```bash
mongod
```

#### Terminal 2: Node.js Backend
```bash
cd Server
npm run dev
```

#### Terminal 3: FastAPI Backend
```bash
cd fastapi_backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Terminal 4: React Native Client
```bash
cd Client
npm start
```

Then:
- Press `a` for Android
- Press `i` for iOS
- Press `w` for Web

---

## 📡 API Documentation

### **Base URLs**
- **Node.js Backend**: `http://localhost:5000`
- **FastAPI Backend**: `http://localhost:8000`

### **Node.js Backend Endpoints**

#### Authentication (`/api/auth`)
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - User login
GET    /api/auth/logout            - User logout
POST   /api/auth/refresh-token     - Refresh JWT token
GET    /api/auth/profile           - Get user profile
```

#### Products (`/api/products`)
```
GET    /api/products               - Get all products
POST   /api/products               - Create product (requires auth)
GET    /api/products/:id           - Get product details
PUT    /api/products/:id           - Update product
DELETE /api/products/:id           - Delete product
GET    /api/products/search        - Search products
```

#### Machines/Equipment (`/api/machines`)
```
GET    /api/machines               - Get all machines
POST   /api/machines               - Create machine listing
GET    /api/machines/:id           - Get machine details
PUT    /api/machines/:id           - Update machine
DELETE /api/machines/:id           - Delete machine
GET    /api/machines/available     - Get available machines
```

#### Market Prices (`/api/prices`)
```
GET    /api/prices                 - Get current prices
GET    /api/prices/:commodity      - Get specific commodity prices
GET    /api/prices/history         - Get price history
GET    /api/prices/trend           - Get price trends
```

#### News (`/api/news`)
```
GET    /api/news                   - Get agricultural news
GET    /api/news/:id               - Get news article
GET    /api/news/category/:cat     - Get news by category
GET    /api/news/search            - Search news
```

#### Pre-booking (`/api/prebooking`)
```
POST   /api/prebooking             - Create prebooking
GET    /api/prebooking/:id         - Get prebooking details
PUT    /api/prebooking/:id         - Update prebooking
DELETE /api/prebooking/:id         - Cancel prebooking
GET    /api/prebooking/user/:uid   - Get user's prebookings
```

#### Analysis (`/api/analysis`)
```
POST   /api/analysis               - Analyze crop/product
GET    /api/analysis/history       - Get analysis history
```

#### Audio (`/api/audio`)
```
POST   /api/audio/transcribe       - Transcribe audio file
POST   /api/audio/tts              - Convert text to speech
```

### **FastAPI Backend Endpoints**

```
GET    /                           - Health check
POST   /start                      - Start new session
GET    /next?session_id=xxx        - Get next question
POST   /next                       - Submit answer (audio or text)
```

#### Parameters
```
POST /next
- session_id: str (required)
- audio: File (optional) - Audio file
- text: str (optional) - Text input
```

---

## 🔧 Key Components & Services

### **Client Components**

| Component | Purpose |
|-----------|---------|
| `WeatherCard` | Display weather information |
| `CropForm` | Input form for crop details |
| `MachineForm` | Input form for equipment/machines |
| `VoiceSearchBar` | Voice-based search interface |
| `HomeHeader` | Main app header |
| `OrderCrop` | Crop ordering interface |
| `RentMachineOrder` | Equipment rental ordering |
| `FeatureGrid` | Feature showcase grid |
| `GreetingCard` | User greeting display |

### **Client Services**

| Service | Functionality |
|---------|--------------|
| `authService` | User authentication |
| `weatherService` | Weather data fetching |
| `marketPriceService` | Market price updates |
| `newsService` | News aggregation |
| `voiceRecordingService` | Audio recording |
| `voiceTranscriptionService` | Audio-to-text conversion |
| `ttsService` | Text-to-speech conversion |
| `aiListingService` | AI-powered listings |
| `productServiceSearch` | Product search functionality |

### **Backend Services**

| Model/Service | Purpose |
|--------------|---------|
| `Machine` | Equipment/tool database model |
| `News` | News articles storage |
| `Prebooking` | Rental prebooking management |
| `authMiddleware` | JWT authentication |
| `dailyScraper` | Scheduled data collection |
| `cloudinary` | Image storage integration |
| `scheduler` | Job scheduling system |

### **Python AI Services**

| Module | Purpose |
|--------|---------|
| `agent.py` | AI conversation agent logic |
| `llm.py` | LLM provider integration |
| `whisper_stt.py` | Speech-to-text |
| `prompts.py` | AI prompt templates |
| `schemas.py` | Data validation models |
| `utils.py` | Helper functions |

---

## 🔐 Environment Variables

### **Client (.env)**
```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:5000
EXPO_PUBLIC_FASTAPI_URL=http://localhost:8000
EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY=your_key
EXPO_PUBLIC_WEATHER_API_KEY=your_key
```

### **Server (.env)**
```env
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/db
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
CLOUDINARY_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
GROQ_API_KEY=your_key
GOOGLE_TRANSLATE_API_KEY=your_key
WEATHER_API_KEY=your_key
NODE_ENV=development
```

### **FastAPI Backend (.env)**
```env
GROQ_API_KEY=your_key
GOOGLE_API_KEY=your_key
OPENAI_API_KEY=your_key
```

---

## 📁 Project Structure Details

### **App Screens (Client/app/)**
- **index.tsx** - Entry point, redirects to home
- **billing.js** - Billing and payment screen
- **chat.js** - Chat/messaging interface
- **crop-details.js** - Detailed crop information
- **crop-health.js** - Crop health monitoring
- **my-crops.js** - User's crops management
- **MyPurchases.js** - Purchase history
- **News.js** - News feed
- **prebooking.js** - Pre-booking reservations
- **RentCrop.js** - Crop rental interface
- **RentMachine.js** - Equipment rental interface
- **settings.js** - App settings
- **(auth)/** - Authentication screens (login, register)
- **(tabs)/** - Tabbed navigation screens

### **Database Models**
The application uses MongoDB with Mongoose for:
- User profiles and authentication
- Crop information and history
- Product listings
- Machine/equipment details
- News articles
- Pre-bookings and orders
- Market prices
- Analysis results

### **State Management**
- **Redux** for global state (language, location)
- **React Context** for authentication state
- **AsyncStorage** for local data persistence

---

## 🐛 Troubleshooting

### **MongoDB Connection Issues**
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network access in MongoDB Atlas (if cloud)

### **Port Conflicts**
```bash
# Find process using port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### **Expo App Not Connecting**
- Ensure all three services are running
- Check firewall settings
- Verify `.env` URLs point to correct IPs
- For physical devices, use machine IP instead of localhost

### **Python Module Not Found**
```bash
# Ensure virtual environment is activated
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

---

## 📝 Scripts & Commands

### **Client Scripts**
```bash
npm start          # Start development server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on Web
npm run lint       # Lint code
```

### **Server Scripts**
```bash
npm start          # Start production server
npm run dev        # Start with nodemon (auto-reload)
```

### **FastAPI Scripts**
```bash
# Development with auto-reload
python -m uvicorn app.main:app --reload

# Production
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# With specific workers
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app
```

---

## 🤝 Contributing

### **Development Workflow**
1. Create a new branch from `main`
2. Make your changes
3. Test thoroughly on all platforms
4. Submit a pull request

### **Code Standards**
- Use ESLint for JavaScript/TypeScript
- Follow PEP 8 for Python code
- Write meaningful commit messages
- Add comments for complex logic

### **Reporting Issues**
- Provide detailed description
- Include error messages
- Specify your OS and versions
- Include reproduction steps

---

## 📄 License

This project is licensed under the ISC License.

---

## 👥 Authors

- **Aayush Singh Rajput** - Project Lead & Developer
- **Bhanu Prasad Chaudhary** - Backend Developer
- **Bibisha Basnet** - Frontend Developer
- **Bishal Sharma** - Machine Learning Developer

---

## 🙏 Acknowledgments

- **Groq** - AI/LLM integration
- **Google GenAI** - Alternative AI provider
- **OpenAI Whisper** - Speech-to-text
- **MongoDB** - Database
- **Cloudinary** - Image storage
- **Expo** - Mobile development framework

---

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation
- Review error logs and traces

---

**Last Updated**: December 20, 2025

---

**Happy Farming with Sahayatri! 🌾**
