# Quantum-Resistant Cryptographic Analyzer - Frontend

Modern React-based frontend for the Quantum-Resistant Cryptographic Analyzer application.

## 🚀 Features

- **Dashboard**: Real-time overview of security scans and risk metrics
- **Scan Management**: Upload ZIP files or scan GitHub repositories
- **Risk Analysis**: Detailed risk assessment with SHAP explainability
- **AI Insights**: Groq AI-powered analysis and explanations
- **Reports**: Generate comprehensive reports in multiple formats (PDF, CSV, JSON)
- **Interactive UI**: Modern, responsive design with dark theme

## 🛠️ Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **Zustand** - State management
- **React Hook Form + Zod** - Form validation
- **Lucide React** - Icon library

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm (or yarn/pnpm)
- Backend server running on http://localhost:8000

### Steps

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=30000
VITE_APP_NAME=Quantum-Resistant Analyzer
```

5. Start the development server:
```bash
npm run dev
```

6. Open your browser to http://localhost:3000

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── common/      # Buttons, Cards, Loading, etc.
│   │   ├── layout/      # Header, Sidebar, Layout
│   │   ├── scan/        # Scan-related components
│   │   ├── dashboard/   # Dashboard charts and stats
│   │   ├── reports/     # Report generation
│   │   └── ai/          # AI features (chat, summary)
│   ├── pages/           # Page components
│   ├── services/        # API service layer
│   ├── hooks/           # Custom React hooks
│   ├── context/         # React context providers
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript type definitions
│   ├── App.jsx          # Main app component
│   └── main.jsx         # Entry point
├── public/              # Static assets
├── .env.example         # Environment variables template
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── package.json         # Dependencies and scripts
```

## 🎯 Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🔧 Configuration

### API Configuration

The frontend communicates with the backend API. Configure the base URL in `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### Proxy Setup

For development, Vite is configured to proxy `/api` requests to the backend:

```javascript
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    },
  },
}
```

## 📡 API Integration

The frontend integrates with the following backend endpoints:

- `/scan/*` - Scan operations (upload, GitHub scan, results)
- `/risk/*` - Risk analysis and dashboard data
- `/groq/*` - AI-powered insights and explanations
- `/report/*` - Report generation and export

## 🎨 Styling

The application uses Tailwind CSS with a custom dark theme:

- **Primary Color**: Blue (#3b82f6)
- **Background**: Slate (#0f172a, #1e293b, #334155)
- **Text**: White/Slate variations

Customize colors in `tailwind.config.js`.

## 🔒 Security Features

- JWT token authentication (stored in localStorage)
- Request/response interceptors for auth
- Input validation with Zod schemas
- File upload validation (size, type)
- XSS protection through React

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🐛 Troubleshooting

### Port Already in Use

If port 3000 is in use, Vite will automatically try the next available port or you can specify:

```bash
npm run dev -- --port 3001
```

### API Connection Issues

1. Ensure backend server is running on http://localhost:8000
2. Check CORS settings in backend
3. Verify `.env` configuration

### Build Errors

Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📝 Development Guidelines

### Component Guidelines

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use TypeScript interfaces for props

### State Management

- Use React Context for global state (notifications, user)
- Use local state for component-specific data
- Use custom hooks for data fetching

### Code Style

- Use meaningful variable names
- Add JSDoc comments for complex functions
- Follow React best practices
- Use Tailwind utility classes

## 🚀 Deployment

### Production Build

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy
```

## 📄 License

This project is part of the Quantum-Resistant Cryptographic Analyzer system.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📞 Support

For issues or questions, please open an issue on the GitHub repository.