# Wealth - AI-Powered Personal Finance Manager 💰

[![Next.js](https://img.shields.io/badge/Next.js-14.0+-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3.0+-00ff88?logo=supabase&logoColor=white)](https://supabase.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0+-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<img width="1470" alt="Wealth Dashboard Preview" src="public\Home.jpeg" style="border-radius: 10px; margin: 20px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1)">

An intelligent personal finance management platform with AI-powered insights, real-time budgeting, and comprehensive financial tracking.

## 🌟 Key Features

- 🧠 **AI-Powered Analysis** - Gemini integration for smart spending insights
- 📊 **Real-Time Dashboard** - Visualize financial health with interactive charts
- 💳 **Multi-Account Management** - Track multiple bank accounts in one place
- 📸 **Receipt Scanning** - AI-powered transaction parsing from images
- 🔔 **Budget Alerts** - Real-time notifications for spending limits
- 📈 **Automated Reports** - Monthly PDF reports with expense breakdowns
- 🔒 **Bank-Level Security** - AES-256 encryption & role-based access
- 🌓 **Dark/Light Mode** - Beautiful UI with theme customization

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- PostgreSQL v15+
- Git

### Installation
```bash
# Clone repository
git clone https://github.com/nandkishor22/wealth.git
cd wealth

# Install dependencies
npm install

# Configure environment
cp .env.example .env
```

### Environment Setup (`.env`)
```env
# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/wealth?schema=public"
DIRECT_URL="postgresql://user:password@localhost:5432/wealth"

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_pub_key"
CLERK_SECRET_KEY="your_secret_key"

# AI Services (Google Gemini)
GEMINI_API_KEY="your_gemini_key"

# Email Service (Resend)
RESEND_API_KEY="your_resend_key"

# Security (ArcJet)
ARCJET_KEY="your_arcjet_key"
```

### Database Initialization
```bash
# Run migrations
npx prisma migrate dev

# Seed sample data (optional)
npm run seed
```

### Running the Application
```bash
npm run dev
```
Visit `http://localhost:3000` in your browser

## 🛠 Technology Stack

| Component              | Technology Stack                                                                 |
|------------------------|----------------------------------------------------------------------------------|
| **Frontend**           | Next.js 14, Shadcn UI, Tailwind CSS, Recharts                                    |
| **Backend**            | Next.js API Routes, Zod Validation                                               |
| **Database**           | PostgreSQL, Prisma ORM, Supabase Realtime                                       |
| **Authentication**     | Clerk with JWT tokens                                                           |
| **AI Integration**     | Google Gemini API for NLP and receipt parsing                                   |
| **Email Service**      | Resend with React Email templates                                               |
| **Security**           | ArcJet for rate limiting, AES-256 encryption                                   |
| **Infrastructure**     | Vercel Deployment, GitHub Actions CI/CD                                        |

## 📘 Detailed Documentation

### Core Functionality
1. **Transaction Management**
   - Add manual transactions or scan receipts
   - Categorize expenses with AI suggestions
   - Multi-currency support (USD, INR, EUR)

2. **Budget System**
   - Create monthly budgets per category
   - Visual progress indicators
   - Threshold-based notifications

3. **Reporting Engine**
   - Automated monthly PDF generation
   - Expense category breakdowns
   - Year-over-year comparisons

4. **Security Features**
   - End-to-end encryption
   - 2FA support
   - Session management

### Service Configuration Guides
1. [Clerk Authentication Setup](docs/CLERK_SETUP.md)
2. [Gemini API Integration](docs/GEMINI_INTEGRATION.md)
3. [Resend Email Configuration](docs/EMAIL_SETUP.md)
4. [Supabase Realtime Setup](docs/SUPABASE_CONFIG.md)

## 📜 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

## ✨ Acknowledgments

- Inspired by modern fintech applications
- UI components powered by [Shadcn UI](https://ui.shadcn.com/)
- Security implementation guidance from [ArcJet Docs](https://arcjet.com/docs)

