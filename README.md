# Tic Tac Toe - Online Multiplayer Game

A full-featured, real-time multiplayer Tic Tac Toe game with chat, matchmaking, leaderboard, and more!

## Features

### ✨ Core Features
- ✅ **Real-time Multiplayer Gameplay** - Play against friends or random opponents
- ✅ **Live Chat** - Chat with your opponent during the game
- ✅ **Matchmaking System** - Find random opponents automatically
- ✅ **Private Games** - Create and share game links with friends
- ✅ **Leaderboard** - Track wins, losses, draws, and win rates
- ✅ **Anonymous Play** - Play without creating an account
- ✅ **Username Authentication** - Create a persistent profile to track stats
- ✅ **Reconnection Support** - Rejoin games if disconnected
- ✅ **Game Statistics** - Track your performance over time
- ✅ **Responsive Design** - Works on desktop and mobile devices

### 🎮 Game Features
- Turn-based gameplay with visual indicators
- Win/Draw detection with highlighted winning combinations
- Rematch requests
- Player status indicators (connected/disconnected)
- Game history stored in database

### 🛠️ Technical Features
- **Backend**: .NET 9 with SignalR for real-time communication
- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Database**: PostgreSQL for persistent data
- **Caching**: Redis for sessions and real-time data
- **Authentication**: Custom username-based auth with anonymous support
- **WebSockets**: SignalR for bi-directional real-time communication
- **Docker**: Full containerization support

## Tech Stack

### Backend (.NET 9)
- **Framework**: ASP.NET Core 9.0
- **Real-time**: SignalR
- **Database**: Entity Framework Core with PostgreSQL
- **Caching**: StackExchange.Redis
- **API**: RESTful + SignalR Hubs

### Frontend (Next.js)
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Real-time Client**: Microsoft SignalR Client
- **Authentication**: Custom implementation with localStorage

### Infrastructure
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Containerization**: Docker & Docker Compose

## Project Structure

```
tick_tack_toe/
├── backend-dotnet/              # .NET 9 Backend
│   ├── TicTacToe.Api/
│   │   ├── Controllers/         # REST API controllers
│   │   ├── Data/                # Database context
│   │   ├── DTOs/                # Data transfer objects
│   │   ├── Hubs/                # SignalR hubs
│   │   ├── Models/              # Domain models
│   │   └── Services/            # Business logic
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── frontend-nextjs/             # Next.js Frontend
│   ├── app/                     # App router pages
│   │   ├── game/[id]/          # Game page
│   │   ├── leaderboard/        # Leaderboard page
│   │   └── lobby/              # Matchmaking/lobby page
│   ├── components/              # React components
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utilities and services
│   └── types/                   # TypeScript types
│
└── README.md
```

## Getting Started

### Prerequisites

- **.NET 9 SDK** - [Download](https://dotnet.microsoft.com/download/dotnet/9.0)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Docker & Docker Compose** - [Download](https://www.docker.com/get-started)

### Quick Start with Docker (Recommended)

1. **Clone the repository**
```bash
git clone <repository-url>
cd tick_tack_toe
```

2. **Start the backend services**
```bash
cd backend-dotnet
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379
- .NET API on port 8080

3. **Start the frontend**
```bash
cd ../frontend-nextjs
npm install
npm run dev
```

The app will be available at `http://localhost:3000`

### Manual Setup

#### Backend Setup

1. **Install dependencies**
```bash
cd backend-dotnet/TicTacToe.Api
dotnet restore
```

2. **Start PostgreSQL and Redis**

Using Docker:
```bash
docker run -d --name tictactoe-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16
docker run -d --name tictactoe-redis -p 6379:6379 redis:7-alpine
```

Or install them locally.

3. **Configure connection strings**

Edit `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=tictactoe;Username=postgres;Password=postgres",
    "Redis": "localhost:6379"
  }
}
```

4. **Run migrations**
```bash
dotnet ef database update
```

5. **Start the API**
```bash
dotnet run
```

API will be available at `http://localhost:8080`

#### Frontend Setup

1. **Install dependencies**
```bash
cd frontend-nextjs
npm install
```

2. **Configure environment**

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

3. **Start the development server**
```bash
npm run dev
```

Frontend will be available at `http://localhost:3000`

## API Endpoints

### REST API

- `POST /api/auth/login` - Login with username or as guest
- `GET /api/auth/me` - Get current user info
- `GET /api/leaderboard` - Get top players and current user stats
- `GET /health` - Health check

### SignalR Hubs

#### Game Hub (`/hubs/game`)
- `CreateGame(token)` - Create a new game
- `JoinGame(token, gameId)` - Join an existing game
- `MakeMove(token, gameId, position)` - Make a move
- `RequestRestart(token, gameId)` - Request a rematch
- `ConfirmRestart(token, gameId, accepted)` - Accept/decline rematch
- `Reconnect(token, gameId)` - Reconnect to a game

#### Chat Hub (`/hubs/chat`)
- `JoinChat(gameId)` - Join game chat
- `SendMessage(token, gameId, message)` - Send a message
- `LeaveChat(gameId)` - Leave chat

#### Matchmaking Hub (`/hubs/matchmaking`)
- `JoinQueue(token)` - Join matchmaking queue
- `LeaveQueue(token)` - Leave matchmaking queue

## Environment Variables

### Backend (.NET)

```env
ASPNETCORE_ENVIRONMENT=Development
ASPNETCORE_URLS=http://+:8080
ConnectionStrings__DefaultConnection=Host=postgres;Port=5432;Database=tictactoe;Username=postgres;Password=postgres
ConnectionStrings__Redis=redis:6379
Cors__AllowedOrigins=http://localhost:3000,http://localhost:5173
```

### Frontend (Next.js)

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Development

### Running Tests

Backend:
```bash
cd backend-dotnet/TicTacToe.Api
dotnet test
```

Frontend:
```bash
cd frontend-nextjs
npm test
```

### Building for Production

Backend:
```bash
cd backend-dotnet/TicTacToe.Api
dotnet publish -c Release -o out
```

Frontend:
```bash
cd frontend-nextjs
npm run build
npm run start
```

## Database Schema

### Tables

- **Users** - User accounts (both registered and anonymous)
- **PlayerStatistics** - Win/loss/draw statistics
- **Games** - Game instances
- **GameMoves** - Individual moves in games
- **ChatMessages** - Chat messages

## Features Roadmap

### Current Features ✅
- [x] Real-time multiplayer gameplay
- [x] Chat system
- [x] Matchmaking
- [x] Leaderboard
- [x] Anonymous authentication
- [x] Username-based authentication
- [x] Reconnection handling
- [x] Private games with link sharing
- [x] Game statistics tracking

### Future Enhancements 🚀
- [ ] OAuth authentication (Google, GitHub)
- [ ] Game history viewer
- [ ] Spectator mode
- [ ] Tournament system
- [ ] ELO rating system
- [ ] Friend system
- [ ] Mobile app (React Native)
- [ ] Sound effects and animations
- [ ] Custom board themes
- [ ] Time controls

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with ❤️ using .NET 9 and Next.js
- SignalR for real-time communication
- Tailwind CSS for styling

## Support

For issues and questions, please open an issue on GitHub.