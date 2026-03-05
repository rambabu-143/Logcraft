# Changelogfy 🚀

Changelogfy is an automated, AI-powered changelog generator designed to streamline your release process by turning GitHub commits into polished release notes.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Framer Motion](https://www.framer.com/motion/) for animations, Lucide React icons

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+)
- **Package Manager**: [uv](https://github.com/astral-sh/uv)
- **Database ORM**: [SQLModel](https://sqlmodel.tiangolo.com/) (SQLAlchemy + Pydantic)
- **Validation**: [Pydantic v2](https://docs.pydantic.dev/)

### Infrastructure & Services
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **AI Engine**: [OpenAI GPT-4o](https://openai.com/) / [Claude API](https://www.anthropic.com/api)
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

# Start the dev server
npm run dev
```

#### Backend
```bash
cd backend
uv run uvicorn app.main:app --reload
```

---

## 📂 Project Structure
```text
.
├── app/              # Next.js Frontend pages
├── components/       # Frontend UI components
├── backend/          # FastAPI Backend (uv managed)
│   ├── app/
│   │   ├── api/      # API Route handlers
│   │   ├── utils/    # Python utilities
│   │   ├── auth.py   # Auth bridge
│   │   ├── main.py   # App entry point
│   │   └── models.py # Database schema
│   └── pyproject.toml
└── README.md
```

---

*Built with ❤️ by Ramrac*
