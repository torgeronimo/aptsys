# 🏢 AptSys - Apartment Management System

<div align="center">

**A modern, full-stack apartment management platform built with cutting-edge web technologies.**

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.2-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

[Live Demo](#) • [Report Bug](#) • [Request Feature](#)

</div>

---

## ✨ Features

- 🏠 **Building Management** - Create and manage multiple properties with detailed information
- 👥 **Tenant Management** - Track tenants, their documents, and rental history
- 🏘️ **Unit Management** - Organize units within buildings, manage unit types and statuses
- 💰 **Billing System** - Generate and track invoices, payment records, and financial reports
- 📊 **Analytics Dashboard** - Real-time insights and visual analytics with charts
- 🔐 **Secure Authentication** - OAuth 2.0 with Google and Facebook integration
- 🌓 **Dark Mode** - Beautiful dark and light theme support
- 📱 **Responsive Design** - Fully responsive UI that works on all devices
- 🔄 **Real-time Sync** - Backend data synchronization with React Query
- ⚡ **Lightning Fast** - Optimized performance with Vite and lazy loading
- 🎨 **Modern UI** - Built with Shadcn UI components and Tailwind CSS
- 📝 **Form Validation** - Robust form handling with React Hook Form and Zod

---

## 🚀 Getting Started

### Prerequisites

- 📦 **Node.js** (v18 or higher)
- 🧵 **npm** or **yarn** or **pnpm**
- 🔑 **Supabase Account** (for backend)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/aptsys.git
   cd aptsys
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   
   The application will be available at `http://localhost:5173`

---

## 🛠️ Tech Stack

### Frontend
- **⚛️ React 19** - Latest React with Concurrent Features
- **🎨 TypeScript** - Type-safe JavaScript development
- **⚡ Vite** - Next-generation frontend tooling
- **🎯 React Router v7** - Client-side routing
- **📦 TanStack Query** - Server state management and caching
- **📋 React Hook Form** - Efficient form handling
- **✅ Zod** - TypeScript-first schema validation

### UI & Styling
- **🎨 Tailwind CSS** - Utility-first CSS framework
- **🧩 Shadcn UI** - Beautifully designed components
- **🌈 Next Themes** - Seamless theme switching
- **📊 Recharts** - Composable charting library
- **🔔 Sonner** - Elegant toast notifications
- **✨ Lucide React** - Beautiful icon library

### Backend
- **🗄️ Supabase** - PostgreSQL + Auth + Real-time
- **🔐 Supabase Auth** - OAuth and email authentication

### Development Tools
- **📝 ESLint** - Code quality and consistency
- **📝 TypeScript** - Static type checking
- **🧪 Vite** - Development server with HMR

---

## 📁 Project Structure

```
aptsys/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── layout/         # Layout components
│   │   ├── ui/             # Shadcn UI components
│   │   └── ...             # Feature components
│   ├── contexts/           # React contexts (Auth, Theme)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and helpers
│   ├── pages/              # Page components
│   ├── types/              # TypeScript type definitions
│   ├── App.tsx             # Root component
│   ├── main.tsx            # Entry point
│   └── router.tsx          # Route configuration
├── supabase/
│   └── migrations/         # Database migrations
├── public/                 # Static assets
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

---

## 🎯 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

---

## 🔐 Authentication

AptSys supports multiple authentication methods:

- **Email/Password** - Traditional email authentication
- **Google OAuth** - Sign in with Google account
- **Facebook OAuth** - Sign in with Facebook account

All authentication is handled securely through Supabase.

---

## 📊 Key Pages

| Page | Purpose |
|------|---------|
| 🔑 **Login** | User authentication |
| ✍️ **Register** | New user account creation |
| 📊 **Dashboard** | Main hub with analytics and overview |
| 🏢 **Buildings** | Manage all properties |
| 👥 **Tenants** | Track all tenants |
| 🏘️ **Units** | Manage individual units |
| 💰 **Billing** | Invoice and payment management |

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Ensure code passes ESLint checks
- Test your changes thoroughly

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙋 Support

If you have any questions or need help:

- 💬 Open an [Issue](https://github.com/yourusername/aptsys/issues)
- 📧 Reach out via email
- 📚 Check the [Documentation](#)

---

## 🌟 Acknowledgments

- 🙏 Thanks to all contributors
- 🎨 UI inspired by modern design principles
- 📚 Built with the amazing React ecosystem

---

<div align="center">

**Made with ❤️ by Your Name**

⭐ If you find this project useful, please consider giving it a star! ⭐

</div>
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
