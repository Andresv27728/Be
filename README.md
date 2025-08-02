# 🦈 Gawr Gura Bot Dashboard

A comprehensive WhatsApp bot application with a modern React frontend and Express backend, featuring real-time synchronization between the bot and web interface.

## 🌟 Features

### WhatsApp Bot
- **15+ Interactive Commands**: Including entertainment, utility, and games
- **Multi-prefix Support**: Use /, !, ., #, or $ prefixes for commands
- **Dual Connection Methods**: QR code scanning or PIN-based authentication
- **Auto-reconnection**: Intelligent reconnection system with exponential backoff
- **Real-time Messaging**: Live message processing and response

### Web Dashboard
- **Modern UI**: Clean, responsive design with Gawr Gura shark theme
- **Real-time Updates**: Live message feed and bot status monitoring
- **Connection Management**: Easy QR/PIN connection interface
- **Analytics**: Bot usage statistics and performance metrics
- **Admin Authentication**: Secure admin access (password: gawr2024)

### Technical Features
- **WebSocket Integration**: Real-time bidirectional communication
- **Professional Logging**: Organized, decorated console output with emoji indicators
- **Database Support**: PostgreSQL with Drizzle ORM
- **Modern Stack**: React + TypeScript + Express + Tailwind CSS

## 🎮 Bot Commands

### Entertainment & Fun
- `!meme` - Random jokes and memes
- `!cita` - Inspirational quotes
- `!trivia` - Random trivia questions
- `!adivinanza` - Spanish riddles
- `!8ball [pregunta]` - Magic 8-ball responses

### Utilities
- `!calc [operación]` - Mathematical calculator
- `!clima [ciudad]` - Weather information
- `!traducir [idioma] [texto]` - Text translation
- `!horario` - Current time and date

### Games & Random
- `!dados [cantidad]` - Dice rolling (1-6 dice)
- `!moneda` - Coin flip
- `!gato` / `!perro` - Random pet images
- `!musica [canción]` - Music search

### User System
- `!registro [nombre].[edad]` - User registration
- `!perfil` - View user profile
- `!top` - User rankings

### System
- `!ping` - Bot response test
- `!info` - Bot information
- `!help` / `!menu` - Command list

## 🚀 Installation

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gawr-gura-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   Create a `.env` file:
   ```env
   DATABASE_URL=your_postgresql_url
   NODE_ENV=development
   PORT=5000
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the dashboard**
   Open http://localhost:5000 in your browser

### WhatsApp Connection

#### Method 1: QR Code
1. Go to Connect tab in the dashboard
2. Click "Generar QR"
3. Scan with WhatsApp > Linked Devices > Link Device

#### Method 2: PIN Code
1. Go to Connect tab in the dashboard
2. Switch to "PIN Code" tab
3. Enter your phone number
4. Enter the 8-digit code in WhatsApp

## 🌐 Deployment

### Vercel Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect repository to Vercel
   - Add environment variables
   - Deploy automatically

3. **Environment Variables**
   ```
   DATABASE_URL=your_postgresql_url
   NODE_ENV=production
   ```

### Render Deployment

1. **Connect Repository**
   - Link GitHub repository to Render
   - Use the included `render.yaml` configuration

2. **Environment Variables**
   ```
   DATABASE_URL=your_postgresql_url
   NODE_ENV=production
   PORT=10000
   ```

3. **Deploy**
   - Automatic deployment on git push
   - Health check endpoint: `/api/health`

### Docker Deployment

1. **Build Image**
   ```bash
   docker build -t gawr-gura-bot .
   ```

2. **Run Container**
   ```bash
   docker run -p 5000:5000 \
     -e DATABASE_URL=your_postgresql_url \
     -e NODE_ENV=production \
     gawr-gura-bot
   ```

## 🏗️ Architecture

### Frontend (React)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **WebSocket**: Native WebSocket API for real-time updates

### Backend (Express)
- **Framework**: Express.js with TypeScript
- **WhatsApp Integration**: @whiskeysockets/baileys
- **Database**: PostgreSQL with Drizzle ORM
- **Logging**: Custom logger with pino
- **WebSocket**: ws library for real-time communication

### Database Schema
- **Users**: User profiles, levels, experience
- **Groups**: WhatsApp group settings
- **Messages**: Message history and metadata
- **Commands**: Usage statistics and tracking
- **Bot Status**: Connection and performance metrics

## ⚙️ Configuration

### Bot Configuration
Edit `server/bot-config.ts` to customize:
- Command prefixes
- Bot information
- Command aliases
- Pairing timeout settings

### UI Theming
Modify `client/src/index.css` for:
- Color schemes
- Custom gradients
- Component styling
- Dark/light mode variables

## 🔄 Auto-Reconnection System

The bot includes an intelligent auto-reconnection system:

- **Auto-Start**: Bot starts automatically when server launches
- **Exponential Backoff**: Delays increase with each failed attempt (5s, 10s, 15s, 20s, 25s)
- **Maximum Attempts**: 5 retry attempts before giving up
- **Connection Monitoring**: Real-time status updates in dashboard
- **Manual Reconnection**: Force reconnect via dashboard
- **Persistent Sessions**: WhatsApp auth stored in `auth_info/` directory

### How Auto-Reconnection Works

1. **Server Startup**: Bot automatically attempts to connect
2. **Connection Lost**: Detects disconnection and starts reconnection process
3. **Exponential Backoff**: Each retry waits longer (5s → 10s → 15s → 20s → 25s)
4. **Success Reset**: Successful connection resets retry counter
5. **Manual Override**: Dashboard allows forcing immediate reconnection

## 📡 API Endpoints

### Bot Management
- `GET /api/bot/status` - Bot connection status
- `POST /api/bot/connect` - Connect via QR
- `POST /api/bot/pair` - Connect via PIN
- `POST /api/bot/disconnect` - Disconnect bot

### Statistics
- `GET /api/statistics/today` - Daily usage stats
- `GET /api/statistics/commands` - Command usage data
- `GET /api/activity/recent` - Recent bot activity

### Health Check
- `GET /api/health` - Service health status

## 🔌 WebSocket Events

### Client → Server
- `message` - Send message through bot
- `command` - Execute bot command

### Server → Client
- `bot_connected` - Bot connection established
- `qr_ready` - QR code generated
- `pairing_code_ready` - PIN code generated
- `new_message` - New WhatsApp message received
- `command_executed` - Command successfully executed
- `stats_update` - Statistics updated

## 🔐 Security Features

- **Admin Authentication**: Password-protected admin areas
- **Input Validation**: Zod schemas for all API inputs
- **Rate Limiting**: Protection against spam and abuse
- **CORS Configuration**: Secure cross-origin requests
- **Session Management**: Secure session handling

## 📊 Monitoring & Logging

### Console Output
- **Startup Banner**: Beautiful ASCII art banner
- **Colored Logs**: Different colors for different log levels
- **Emoji Indicators**: Visual indicators for different events
- **Timestamps**: Precise timing for all events
- **Structured Logging**: JSON logging for production

### Dashboard Monitoring
- **Real-time Status**: Live connection monitoring
- **Message Feed**: Live message stream with WebSocket
- **Performance Metrics**: Response times and uptime
- **Error Tracking**: Error logs and debugging info

## 🛠️ Development

### Project Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/         # Route pages
│   │   ├── hooks/         # React hooks
│   │   └── lib/           # Utilities
├── server/                # Express backend
│   ├── routes.ts          # API routes
│   ├── whatsapp-working.ts # WhatsApp bot logic
│   ├── bot-config.ts      # Bot configuration
│   └── logger.ts          # Logging system
├── shared/                # Shared types/schemas
├── auth_info/             # WhatsApp auth data
└── deployment files       # Docker, Vercel, Render configs
```

### Adding New Commands

1. **Update bot-config.ts**
   ```typescript
   newcommand: {
     aliases: ['alias1', 'alias2'],
     description: 'Command description',
     category: 'category',
   }
   ```

2. **Add handler in whatsapp-working.ts**
   ```typescript
   case 'newcommand':
     response = 'Command response';
     break;
   ```

### Environment Variables

#### Required
- `DATABASE_URL` - PostgreSQL connection string

#### Optional
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)

## 📋 Production Deployment Checklist

### Pre-Deployment
- [ ] Set `NODE_ENV=production`
- [ ] Configure production database URL
- [ ] Test all commands work correctly
- [ ] Verify WebSocket connections
- [ ] Check auto-reconnection system

### Platform-Specific Notes

#### Vercel
- Uses `vercel.json` configuration
- Serverless functions for API routes
- Static hosting for frontend
- WebSocket support limited

#### Render
- Uses `render.yaml` configuration
- Full server environment
- Better for WebSocket connections
- Auto-deploy from GitHub

#### Docker
- Includes `Dockerfile` for containerization
- Works with any Docker-compatible platform
- Volume mounting for persistent auth

## 🆘 Support

### Common Issues

1. **Bot not connecting**
   - Check WhatsApp account status
   - Verify phone number format
   - Clear `auth_info/` directory and reconnect

2. **Commands not working**
   - Verify correct prefix usage (!command)
   - Check bot is connected in dashboard
   - Review console logs for errors

3. **Database errors**
   - Check PostgreSQL connection string
   - Verify database exists and is accessible
   - Run migrations if needed

4. **WebSocket issues**
   - Ensure port 5000 is accessible
   - Check firewall settings
   - Verify CORS configuration

### Logs Location
- **Development**: Console output with colors and emojis
- **Production**: Structured JSON logs
- **WhatsApp Auth**: `auth_info/` directory (keep secure!)

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Create Pull Request

---

**🦈 Gawr Gura Bot v2.1** - A modern WhatsApp bot with real-time dashboard

Developed with ❤️ using React, Express, and WhatsApp Web API

**Key Features**: Auto-reconnection, Real-time messaging, Modern UI, 15+ commands, Multi-platform deployment