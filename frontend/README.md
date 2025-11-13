# TrustPay Frontend

React-based frontend for TrustPay UPI Escrow Platform.

## Features

- **Modern UI/UX**: Built with React 18 and Tailwind CSS
- **Aurora Background**: WebGL-powered animated gradient effects
- **Pixel Cards**: Interactive canvas-based animations
- **Bubble Menu**: Animated navigation with glassmorphism
- **Logo Loop**: Infinite scrolling tech stack showcase
- **Dashboard**: Comprehensive escrow management interface
- **Responsive Design**: Mobile-first approach with dark theme

## Tech Stack

- **React 18** - UI framework with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **GSAP** - Professional animations
- **OGL** - WebGL library for Aurora effects
- **Montserrat** - Typography

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 3. Build for Production

```bash
npm run build
```

### 4. Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Aurora/          # WebGL background
│   │   ├── PixelCard/       # Interactive pixel animations
│   │   ├── BubbleMenu/      # Animated navigation
│   │   ├── LogoLoop/        # Tech stack showcase
│   │   ├── Dashboard/       # Dashboard components
│   │   ├── FuzzyText.jsx    # Glitch text effect
│   │   ├── SplitText.jsx    # Text animation
│   │   ├── Icons.jsx        # Icon components
│   │   └── TechLogos.jsx    # Tech logos
│   ├── pages/
│   │   ├── LandingPage.jsx  # Landing page
│   │   ├── AppDashboard.jsx # Dashboard page
│   │   └── NotFound.jsx     # 404 page
│   ├── data/
│   │   └── mockEscrows.js   # Mock data
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Components

### Aurora
WebGL-powered animated gradient background using OGL library.

### PixelCard
Interactive cards with canvas-based pixel animations for user personas.

### BubbleMenu
Animated navigation menu with GSAP animations and glassmorphism design.

### LogoLoop
Infinite scrolling showcase of tech stack logos.

### Dashboard
Comprehensive escrow management interface with:
- Escrow list view
- Create escrow form
- Escrow detail view
- Sidebar navigation

## Styling

The app uses:
- **Tailwind CSS** for utility-first styling
- **Montserrat** font family
- **Dark theme** with glassmorphism effects
- **Custom animations** with GSAP

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License
