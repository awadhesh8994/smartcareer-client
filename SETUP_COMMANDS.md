# ╔══════════════════════════════════════════════════════════════════╗
# ║        SMART CAREER PLATFORM — FRONTEND SETUP COMMANDS          ║
# ╚══════════════════════════════════════════════════════════════════╝


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 1 — Navigate to client folder
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

cd smart-career-platform/client


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 2 — Install all dependencies
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

npm install


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 3 — Start development server
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

npm run dev

# App runs at: http://localhost:5173
# Backend must also be running at: http://localhost:5000


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 4 — Run both frontend and backend together (recommended)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Open TWO terminals:

# Terminal 1 (Backend):
cd smart-career-platform/server
npm run dev

# Terminal 2 (Frontend):
cd smart-career-platform/client
npm run dev


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# COMPLETE DEPENDENCY LIST (reference)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# PRODUCTION:
# react + react-dom          → UI framework
# react-router-dom           → Client-side routing
# axios                      → HTTP requests to backend
# zustand                    → State management
# recharts                   → Charts and analytics
# react-hot-toast            → Toast notifications
# lucide-react               → Icon library
# framer-motion              → Animations
# @radix-ui/*                → Accessible UI primitives
# react-hook-form            → Form handling
# date-fns                   → Date utilities
# clsx + tailwind-merge      → Conditional className merging

# DEV:
# vite                       → Build tool and dev server
# @vitejs/plugin-react        → React fast refresh
# tailwindcss                → Utility CSS framework
# autoprefixer + postcss     → CSS processing


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FOLDER STRUCTURE (reference)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# client/
# ├── public/
# │   └── favicon.svg
# ├── src/
# │   ├── components/
# │   │   └── common/          Navbar, Footer, AppLayout, PublicLayout
# │   ├── pages/
# │   │   ├── Auth/            Login, Register, OAuthSuccess, ForgotPassword
# │   │   ├── LandingPage.jsx
# │   │   ├── Dashboard.jsx
# │   │   ├── Assessment.jsx
# │   │   ├── Roadmap.jsx
# │   │   ├── Learning.jsx
# │   │   ├── ResumeBuilder.jsx
# │   │   ├── Analytics.jsx
# │   │   ├── Chatbot.jsx
# │   │   ├── Network.jsx
# │   │   ├── Admin.jsx
# │   │   └── NotFound.jsx
# │   ├── store/               authStore, themeStore, index (notif, assessment, resume)
# │   ├── services/            axiosInstance, index (all API services)
# │   ├── hooks/               useAsync, useDebounce, useLocalStorage, etc.
# │   ├── utils/               cn helper
# │   ├── App.jsx              All routes
# │   ├── main.jsx             Entry point
# │   └── index.css            Global styles + Tailwind
# ├── index.html
# ├── vite.config.js
# ├── tailwind.config.js
# └── postcss.config.js


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# COLOR THEME (reference)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Primary (Navy Blue)   #0F4C81   →  bg-navy-600
# Accent  (Teal)        #00C9A7   →  bg-teal-600
# AI      (Violet)      #7C3AED   →  bg-violet-600
# Success (Emerald)     #10B981
# Warning (Amber)       #F59E0B
# Danger  (Red)         #EF4444
# Light bg              #F8FAFC   →  bg-surface-50
# Dark  bg              #0F172A   →  bg-surface-900


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FONTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Body:     Plus Jakarta Sans  →  font-sans
# Headings: Syne               →  font-display
# Code:     JetBrains Mono     →  font-mono
