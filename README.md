# وثقني - Wathiqni Document Vault






<div align="center">

![وثقني](https://img.shields.io/badge/وثقني-Document%20Vault-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![NestJS](https://img.shields.io/badge/NestJS-10-red?style=flat-square&logo=nestjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=flat-square&logo=postgresql)

**AI-Powered Personal Document Vault | خزنة الوثائق الذكية**

[🚀 **Live Demo**](https://wathiqni-vault-husam05.web.app)

</div>

---

## ✨ Features

- 📄 **Document Management** - Upload, organize, and manage your documents
- 🔍 **Smart Scanner** - AI-powered auto-capture with edge detection
- 🤖 **OCR Processing** - Arabic & English text extraction
- 🔗 **Secure Sharing** - Timed links with WhatsApp/Telegram integration
- 🔔 **Notifications** - Expiry alerts and document tracking
- ⚙️ **User Settings** - Profile, security, and preferences
- 🔐 **Authentication** - JWT-based secure login
- 📊 **Dashboard** - Beautiful UI with document stats

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React, Tailwind CSS, Framer Motion |
| Backend | NestJS, Prisma ORM |
| Database | PostgreSQL |
| AI/OCR | Tesseract.js, Sharp |
| Auth | JWT, bcrypt |

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Local Deployment with Docker

1. **Clone the repository**
```bash
git clone https://github.com/alkinani05/ID-storage.git
cd ID-storage
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your settings (see LOCAL_SETUP.md for details)
```

3. **Start all services**
```bash
chmod +x test-local.sh
./test-local.sh
```

Or manually:
```bash
docker compose up --build -d
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

### Development Mode (Without Docker)

1. **Start PostgreSQL**
```bash
docker compose up postgres -d
```

2. **Setup Backend**
```bash
cd server
npm install
cp .env.example .env
# Edit DATABASE_URL in .env
npx prisma migrate dev
npm run start:dev
```

3. **Setup Frontend**
```bash
cd client
npm install
cp env.example .env.local
# Edit NEXT_PUBLIC_API_URL in .env.local
npm run dev
```

## 📖 Documentation

- **[LOCAL_SETUP.md](LOCAL_SETUP.md)** - Comprehensive local setup guide
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick command reference
- **[PROJECT_PLAN.md](PROJECT_PLAN.md)** - Project architecture and planning

## 📁 Project Structure

```
ID-storage/
├── client/                 # Next.js Frontend
│   ├── app/
│   │   ├── dashboard/     # Main dashboard
│   │   ├── login/         # Auth pages
│   │   ├── register/
│   │   └── share/         # Public share view
│   └── Dockerfile
├── server/                 # NestJS Backend
│   ├── src/
│   │   ├── auth/          # Authentication
│   │   └── documents/     # Document & OCR
│   ├── prisma/            # Database schema
│   └── Dockerfile
└── docker-compose.yml
```

## 📜 License

MIT License - Feel free to use for personal or commercial projects.

---

<div align="center">

**Made with ❤️ for secure document management**

</div>
