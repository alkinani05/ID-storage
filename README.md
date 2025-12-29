# وثقني - Wathiqni Document Vault




<div align="center">

![وثقني](https://img.shields.io/badge/وثقني-Document%20Vault-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![NestJS](https://img.shields.io/badge/NestJS-10-red?style=flat-square&logo=nestjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=flat-square&logo=postgresql)

**AI-Powered Personal Document Vault | خزنة الوثائق الذكية**

[🚀 **Live Demo**](https://athletic-communication-production.up.railway.app) | [⚙️ **Backend API**](https://id-storage-production-39bf.up.railway.app/health)

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
- Node.js 20+
- PostgreSQL 16+
- Docker (optional)

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/alkinani05/ID-storage.git
cd ID-storage
```

2. **Start PostgreSQL with Docker**
```bash
docker-compose up -d postgres
```

3. **Setup Backend**
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your database URL
npx prisma migrate dev
npm run start:dev
```

4. **Setup Frontend**
```bash
cd client
npm install
npm run dev
```

5. **Open in browser**
- Frontend: http://localhost:3002
- Backend: http://localhost:3001

## 🌐 Deploy to Railway

1. Create account at [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Add PostgreSQL service
4. Deploy backend service (from `/server`)
5. Deploy frontend service (from `/client`)
6. Configure environment variables

### Environment Variables

**Backend (server)**
```
DATABASE_URL=<railway-postgres-url>
JWT_SECRET=<your-secret-key>
PORT=3001
CORS_ORIGIN=<frontend-url>
```

**Frontend (client)**
```
NEXT_PUBLIC_API_URL=<backend-url>
```

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
