# Changelogfy 🚀

Changelogfy is an automated, AI-powered changelog generator that helps you turn your GitHub commits into polished, customer-facing release notes.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Framer Motion](https://www.framer.com/motion/) for animations, Lucide React icons
- **State Management**: [React Hooks](https://react.dev/)

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+)
- **Package Manager**: [uv](https://github.com/astral-sh/uv) (Extremely fast Python package installer and resolver)
- **Database ORM**: [SQLModel](https://sqlmodel.tiangolo.com/) (SQLAlchemy + Pydantic)
- **Validation**: [Pydantic v2](https://docs.pydantic.dev/)
- **Async HTTP**: [httpx](https://www.python-httpx.org/)

### Infrastructure & Services
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) (Bridged to FastAPI via shared sessions)
- **AI Engine**: [ZhipuAI](https://open.bigmodel.cn/) / [Claude API](https://www.anthropic.com/api)
- **Payments**: [Stripe](https://stripe.com/)
- **Email**: [Resend](https://resend.com/)

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18+)
- **Python** (v3.10+)
- **uv** (Install via `curl -LsSf https://astral.sh/uv/install.sh | sh`)

### 2. Setup

#### Frontend
```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Fill in your variables (Supabase, GitHub OAuth, NextAuth Secret, etc.)

# Start the dev server
npm run dev
```

#### Backend
```bash
cd backend
# uv automatically handles project initialization and venv
uv run uvicorn app.main:app --reload
```

---

## 💡 Key Features
- **Auto-Sync**: Connect your GitHub repositories. Every push triggers a new changelog draft.
- **AI-Powered**: Technical commit messages are automatically translated into user-friendly narratives.
- **Shared Session**: Seamless login experience across Next.js and FastAPI.
- **Multiple Plans**: Tiered subscription management via Stripe.
- **Webhooks**: Built-in GitHub webhook handlers for real-time updates.

---

## 📂 Project Structure
```text
.
├── app/              # Next.js Frontend pages & layouts
├── components/       # Frontend UI components
├── lib/              # Frontend utilities and shared types
├── prisma/           # Prisma schema (used for sharing DB schema)
├── backend/          # FastAPI Backend (uv managed)
│   ├── app/
│   │   ├── api/      # API Route handlers
│   │   ├── utils/    # Python utilities (GitHub / AI logic)
│   │   ├── auth.py   # NextAuth session bridge
│   │   ├── main.py   # Application entry point
│   │   └── models.py # Pydantic/SQLModel table definitions
│   └── pyproject.toml
└── README.md
```

---

*Built with ❤️ by Ramrac*
