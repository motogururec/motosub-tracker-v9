# Subscription Tracker

A modern web application for tracking and managing your subscriptions with multi-currency support. Built with React, TypeScript, and Supabase.

![Subscription Tracker](https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1200)

## Features

- 📊 Track monthly and annual subscriptions
- 💰 Multi-currency support (USD, EUR, HUF)
- 🌓 Dark/Light mode with system preference detection
- 📱 Responsive design for all devices
- 🔒 Secure user authentication with Supabase
- 📥 Export/Import subscription data
- 🔍 Advanced search and filtering
- 📊 Interactive dashboard with spending analytics
- 🎨 Smooth theme transitions
- 🌐 Cross-browser compatibility
- 🔐 Row Level Security with Supabase
- 📁 Custom category management
- 🔄 Real-time currency conversion
- 👤 User profile management

## Tech Stack

- **Frontend**: React 18, TypeScript 5, Vite 5
- **Styling**: Tailwind CSS 3
- **State Management**: React Hooks
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Charts**: Chart.js with React-Chartjs-2
- **Icons**: Lucide React
- **Deployment**: Docker, Nginx
- **Security**: Row Level Security, Non-root containers

## Prerequisites

- Node.js 20.11.0 or later
- npm 10.2.4 or later
- Docker 25.0.0 or later
- Docker Compose 2.24.0 or later
- Supabase account and project

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/subscription-tracker.git
   cd subscription-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Update .env with your Supabase credentials
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Production Deployment

### Using Docker Compose (Recommended)

1. Set up environment variables:
   ```bash
   cp .env.example .env
   # Update with production credentials
   ```

2. Build and deploy:
   ```bash
   docker compose up -d
   ```

3. Access at `http://localhost:8080`

### Manual Docker Deployment

```bash
# Build the image
docker build -t subscription-tracker .

# Run with security options
docker run -p 8080:8080 \
  --read-only \
  --security-opt=no-new-privileges:true \
  --cap-drop=ALL \
  --memory=1g \
  --cpus=1 \
  -e VITE_SUPABASE_URL=your-supabase-url \
  -e VITE_SUPABASE_ANON_KEY=your-supabase-anon-key \
  subscription-tracker
```

## Security Features

- Secure authentication with Supabase
- Row Level Security (RLS)
- Non-root Docker container
- Read-only container filesystem
- Memory and CPU limits
- Security headers in Nginx
- Regular security updates
- Environment variable protection
- HTTPS enforcement
- XSS protection
- CSRF protection
- Content Security Policy

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code

## Project Structure

```
subscription-tracker/
├── src/
│   ├── components/     # React components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions
│   ├── types/         # TypeScript types
│   └── main.tsx       # Entry point
├── supabase/
│   └── migrations/    # Database migrations
├── docker/           # Docker configuration
└── public/           # Static assets
```

## Recent Updates

### Version 1.1.0
- Added category management system
- Implemented user settings and preferences
- Enhanced currency conversion
- Improved dark mode support
- Added subscription analytics
- Updated Docker configuration
- Enhanced security features

### Breaking Changes
- Node.js 20.11.0 now required
- Updated Supabase client to 2.39.3
- New category management system requires database migration

## Monitoring

- Health checks every 30s
- JSON log format
- Log rotation enabled
- Resource monitoring
- Error tracking
- Performance metrics

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - see LICENSE file

## Support

For support:
- Open an issue
- Contact maintainers
- Check documentation