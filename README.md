# Craved Artisan - Artisan Marketplace

A modern marketplace connecting local artisans with customers, built with React, Node.js, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm
- PostgreSQL (or Neon DB)

### Development Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd craved-artisan

# Install all dependencies
npm run install:all

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and session secret

# Start development servers
npm run dev
```

### Build & Deploy
```bash
# Run deployment preparation script
.\deploy.ps1

# Or build manually
npm run build
```

## 📁 Project Structure

```
craved-artisan/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions
│   │   └── styles/        # CSS and styling
│   ├── public/            # Static assets
│   └── dist/              # Build output
├── server/                # Express.js backend
│   ├── src/
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   └── utils/         # Backend utilities
│   └── dist/              # Build output
├── prisma/                # Database schema and migrations
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Database migrations
└── public/                # Shared static assets
```

## 🛠 Tech Stack

### Frontend

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Wouter** - Routing
- **React Query** - Data fetching
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Radix UI** - Accessible components
- **Lucide React** - Icons

### Backend

- **Node.js** - Runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **Winston** - Logging
- **Zod** - Validation
- **Helmet** - Security headers
- **CORS** - Cross-origin requests

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Concurrently** - Run multiple commands
- **Docker Compose** - Local development

## 🔒 Security & Diagnostics

### CORS Configuration

The application includes comprehensive CORS logging and configuration:

- **Development**: Allows localhost origins (5173, 5174, 5175, 3000)
- **Production**: Requires explicit `CLIENT_URL` environment variable
- **Logging**: All CORS requests are logged to `logs/cors.log`
- **Vary Header**: Proper caching behavior with `Vary: Origin`

### Debug Endpoints (Development Only)

Available at `/api/_debug/`:

- `/cookies` - Echo request cookies and session data
- `/headers` - Echo request and response headers  
- `/cors-config` - Show current CORS configuration
- `/session-config` - Show session configuration

### Content Security Policy

Environment-specific CSP policies:

- **Development**: Allows Vite HMR and development features
- **Production**: Strict policies with Stripe integration
- **Report-only mode**: Available for testing violations

### Troubleshooting

See [DIAGNOSTICS_AND_GUARDRAILS.md](./DIAGNOSTICS_AND_GUARDRAILS.md) for detailed troubleshooting guide.

## 🚀 Deployment

### Render + Neon Setup

The application is configured for deployment on Render with Neon PostgreSQL:

#### Backend (Render Web Service)
- **Build Command**: `cd server && npm install && npm run build`
- **Start Command**: `cd server && npm start`
- **Health Check**: `/health`

#### Frontend (Render Static Site)
- **Build Command**: `cd client && npm install && npm run build`
- **Publish Directory**: `client/dist`

#### Environment Variables
```bash
# Backend
NODE_ENV=production
DATABASE_URL=your-neon-connection-string
SESSION_SECRET=your-session-secret
CLIENT_URL=https://your-frontend-url.onrender.com

# Frontend
VITE_API_URL=https://your-backend-url.onrender.com
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 🔧 Available Scripts

### Root Level
```bash
npm run dev          # Start both frontend and backend
npm run build        # Build both frontend and backend
npm run start        # Start production servers
npm run install:all  # Install dependencies for all packages
npm run lint         # Lint all packages
npm run test         # Run tests
```

### Frontend (client/)
```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Lint TypeScript/React
```

### Backend (server/)
```bash
npm run dev          # Start development server
npm run build        # Build TypeScript
npm run start        # Start production server
npm run lint         # Lint TypeScript
```

### Database (prisma/)
```bash
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
npm run db:reset     # Reset database
npm run db:studio    # Open Prisma Studio
```

## 🗄 Database Schema

The application uses PostgreSQL with the following main entities:

- **Users** - Customer and vendor accounts
- **Products** - Artisan products
- **Orders** - Customer purchases
- **Reviews** - Product reviews
- **Events** - Artisan events and markets
- **Profiles** - User profiles and addresses

See `prisma/schema.prisma` for the complete schema.

## 🔒 Security Features

- **Environment Validation** - Zod schema validation for all environment variables
- **Error Handling** - Centralized error handling with Winston logging
- **CORS Protection** - Configured for production domains
- **Helmet** - Security headers
- **Input Validation** - Zod schemas for all API inputs
- **Session Security** - Secure session management

## 🐛 Debugging & Safety Nets

- **Build Integrity** - TypeScript compilation and Vite build checks
- **Runtime Error Trapping** - Global error handlers and React Error Boundaries
- **Backend Logging** - Winston logging for all server errors
- **Environment Guards** - Validation blocks server startup if required env vars are missing
- **Route Trapping** - Catch-all routes for unhandled frontend routes

## 📱 Features

### Customer Features
- Browse artisan products
- Search and filter products
- View vendor profiles
- Place orders
- Leave reviews
- Discover local events

### Vendor Features
- Product management
- Order tracking
- Sales analytics
- Event creation
- Profile management

### Admin Features
- User management
- Content moderation
- Analytics dashboard
- System configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the [deployment guide](./DEPLOYMENT.md)
- Review the troubleshooting section
- Open an issue on GitHub