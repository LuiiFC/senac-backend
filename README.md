# SENAC Integrated Projects System

The team:
Sillvoney,
Pedro Ruan,
Debora Rafaelle,
Half Ukan,
Cristiano,
Luis Felipe.

## About the Project

The SENAC Integrated Projects System is a full-stack web application developed to digitalize and centralize the academic project management workflow at SENAC (National Commercial Apprenticeship Service) institutions. The platform was conceived to replace manual and fragmented processes, offering a unified digital environment where every stakeholder in the academic ecosystem — students, professors, coordinators, and partner companies — can interact with academic projects in a structured, traceable, and efficient manner.

The system was built with a clear separation of responsibilities: a React-based single-page application handles all user interactions on the client side, while a Node.js REST API manages business logic, authentication, and data persistence through Supabase, a cloud PostgreSQL database with integrated file storage.

Every feature of this platform was designed with real institutional needs in mind. Students can submit their projects digitally and track evaluations in real time. Professors and coordinators can assess work, assign grades, and manage their academic classes. Partner companies — external organizations associated with SENAC — can browse projects and formally endorse those they consider outstanding, creating a bridge between academia and the professional world.

---

## How Authentication Works

Authentication is handled entirely through JSON Web Tokens (JWT). When a user submits their credentials on the login screen, the backend validates the email and password against the database, where passwords are stored exclusively as bcrypt hashes — never in plain text. Upon successful validation, the server issues a signed JWT token containing the user's ID, name, role, and course association. This token is stored in the browser's local storage and attached to every subsequent API request via an Authorization header.

The token has an 8-hour expiration window, after which the user must log in again. This design ensures that sessions are stateless on the server side, reducing infrastructure complexity while maintaining security.

For users who forget their password, the system provides an automated recovery flow. When a recovery request is submitted, the backend generates a new random temporary password, hashes it, updates the database, and sends the plain-text temporary password to the user's registered email address via the Resend transactional email service.

---

## Role-Based Access Control

One of the foundational design decisions of this system is its role-based access control model. Every user belongs to exactly one of five roles, and the entire application — both the frontend interface and the backend API — enforces permissions based on that role.

The **Administrator** (admin) has unrestricted access to the entire system. They can create and manage users of any type, oversee all projects regardless of course, and access every feature the platform offers.

The **Coordinator** (coordenador) operates within the scope of their assigned course. They can register professors, approve student enrollments, manage academic classes, evaluate projects, and organize them into categories. Their visibility is limited to the projects and classes associated with their own course.

The **Professor** can create projects, associate students to them, upload project files, and submit evaluations with numerical grades. Like the coordinator, their access is scoped to the classes and projects within their assigned course.

The **Student** (aluno) can submit their own academic projects, view their project status and evaluations, and leave comments. They cannot assign grades or access other students' projects.

The **Partner Company** (empresa_parceira) represents an external organization affiliated with SENAC. Their role is read-oriented: they can browse all projects, submit comments and qualitative evaluations, and — exclusively — endorse projects through the system's like mechanism.

---

## Project Management Module

Projects are the central entity of the entire platform. A project represents a body of academic work submitted by one or more students, associated with a specific academic class and, optionally, guided by a professor.

Professors and coordinators can create projects directly and assign students to them. Students can also independently submit projects through a dedicated registration flow, provided they are enrolled in the relevant class. Each project stores a title, description, associated class, responsible professor, and a list of participating students.

Projects support file attachments. When a file is uploaded — such as a PDF report, presentation, or code archive — it is sent to the backend, which forwards it to Supabase's object storage. The resulting public URL is then saved in the project record, making the file permanently accessible to authorized users through a download link.

Projects can also be assigned to categories, which function as organizational folders. Coordinators can create categories and assign projects to them, enabling structured navigation of large project repositories.

---

## Evaluation System

The evaluation module allows authorized users to submit assessments for any given project. The system distinguishes between two types of contributions: graded evaluations and qualitative comments.

Professors and coordinators can submit a numerical grade between 0 and 10, accompanied by an optional comment. Partner companies can submit comments without a numerical grade. Students may also leave comments on projects.

For each project, the system automatically calculates the average grade based solely on evaluations that contain a numerical score and were submitted by professors, coordinators, or partner companies. This average is prominently displayed on the project detail page, providing immediate feedback on academic performance.

The dashboard aggregates this data system-wide, identifying and displaying the top five highest-rated projects in an animated bar chart. This visualization uses the HTML5 Canvas API and features smooth entry animations, gradient-filled bars, and a dark professional theme, providing a visually compelling overview of outstanding academic work.

---

## Partner Company Endorsement System

Beyond qualitative evaluations, partner companies have access to an exclusive endorsement feature — commonly referred to as the "like" system. This feature allows a company to formally signal interest in a project, indicating that the work is considered relevant, innovative, or aligned with industry needs.

When a partner company endorses a project, their company badge is displayed directly on the project's detail page, visible to all users including the students who authored the work. This creates a meaningful and motivating feedback loop: students receive direct recognition from real-world organizations, and companies can identify talent and promising projects for potential collaboration.

The endorsement is toggle-based — a company can remove their endorsement at any time. The system enforces uniqueness, ensuring that each company can only endorse a given project once. The total number of endorsements and the list of endorsing companies are always displayed in real time.

---

## Partner Company Directory

The system includes a dedicated directory page for partner companies. Accessible exclusively to administrators, this page lists all registered partner company accounts, displaying their name, email, and a dynamically generated avatar based on the company's initials. Each entry is visually marked with a styled badge identifying the account as a partner company, reinforcing the distinction between institutional and commercial users within the platform.

---

## Dashboard and Analytics

The administrative dashboard provides a high-level overview of the system's current state. It displays the total count of registered users, active projects, and academic classes. Below these summary cards, the top five most evaluated projects are rendered in a custom animated bar chart built entirely with the Canvas API — no external charting library is required.

The chart features a dark background with gradient color bars, grid lines, value labels, and smooth growth animations triggered on page load. A legend below the chart maps each bar to its corresponding project, including the exact average score and evaluation count.

---

## 🌐 Live Demo

- **Frontend:** https://senac-frontend.vercel.app  
- **Backend API:** https://senac-backend-qxk7.onrender.com

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 | UI framework |
| Vite | Build tool and development server |
| React Router DOM | Client-side routing |
| Axios | HTTP client for API communication |
| Canvas API | Custom animated data visualization |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js v20 | Runtime environment |
| Express.js 4.18 | REST API framework |
| Supabase JS | PostgreSQL database and file storage client |
| JSON Web Token | Stateless authentication |
| bcryptjs | Password hashing |
| Multer | Multipart file upload handling |
| Resend | Transactional email delivery |
| dotenv | Environment variable management |

### Infrastructure
| Service | Purpose |
|---------|---------|
| Supabase | Managed PostgreSQL database and object storage |
| Vercel | Frontend hosting with automatic CI/CD |
| Render | Backend API hosting |
| GitHub | Version control and deployment trigger |

---

## 🏗 System Architecture

┌─────────────────────────────────────────────┐
│              Client (Browser)               │
│         React SPA — Vercel CDN              │
└───────────────────┬─────────────────────────┘
│ HTTPS / REST API
┌───────────────────▼─────────────────────────┐
│           Backend API — Render              │
│         Node.js + Express.js                │
│                                             │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐  │
│  │  Auth   │  │ Projects │  │   Users   │  │
│  │ Routes  │  │  Routes  │  │  Routes   │  │
│  └────┬────┘  └────┬─────┘  └─────┬─────┘  │
│       └────────────┼───────────────┘        │
└────────────────────┼────────────────────────┘
│ Supabase JS Client
┌────────────────────▼────────────────────────┐
│                 Supabase                    │
│     PostgreSQL Database + Object Storage    │
└─────────────────────────────────────────────┘

---

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| `admin` | Full system access and user management |
| `coordenador` | Manage professors, classes, and course-scoped projects |
| `professor` | Create and evaluate projects within assigned course |
| `aluno` | Submit projects and comment on evaluations |
| `empresa_parceira` | View, comment, and endorse projects |

---

## 📡 API Endpoints

### Authentication

POST   /api/auth/login
POST   /api/auth/cadastrar
POST   /api/auth/registrar
POST   /api/auth/esqueceu-senha
PUT    /api/auth/alterar-senha

### Projects

GET    /api/projetos
POST   /api/projetos
POST   /api/projetos/aluno
GET    /api/projetos/:id
POST   /api/projetos/:id/upload
DELETE /api/projetos/:id
PATCH  /api/projetos/:id/categoria
POST   /api/projetos/:id/curtir
GET    /api/projetos/:id/curtidas

### Evaluations

GET    /api/avaliacoes/:projeto_id
POST   /api/avaliacoes/:projeto_id

### Users

GET    /api/usuarios
GET    /api/usuarios/:id
PUT    /api/usuarios/:id
DELETE /api/usuarios/:id

### Classes

GET    /api/turmas
POST   /api/turmas
GET    /api/turmas/publicas
GET    /api/turmas/:id/matriculas
POST   /api/turmas/:id/matricular
PATCH  /api/turmas/:id/matriculas/:alunoId

---

## 🗄 Database Schema

| Table | Description |
|-------|-------------|
| `usuarios` | All system users with role and course fields |
| `turmas` | Academic classes linked to courses |
| `matriculas` | Student enrollment records with approval status |
| `projetos` | Projects with file URL and category references |
| `projeto_alunos` | Many-to-many relation between projects and students |
| `avaliacoes` | Grades and comments submitted per project |
| `categorias` | Organizational folders for project classification |
| `curtidas` | Partner company endorsements per project |

---

## 🔐 Environment Variables

```env
PORT=3001
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret_key
RESEND_API_KEY=your_resend_api_key
```

---

## 🚀 Local Installation

```bash
# Clone repositories
git clone https://github.com/LuiiFC/senac-backend.git
git clone https://github.com/LuiiFC/senac-frontend.git

# Backend
cd senac-backend
npm install
# Configure .env file
node server.js

# Frontend
cd senac-frontend
npm install
npm run dev
```

---

## ☁️ Deployment

### Backend — Render
- Runtime: Node.js 20.x  
- Build Command: `npm install`  
- Start Command: `node server.js`  
- Node version pinned via `engines` field in `package.json`

### Frontend — Vercel
- Framework: Vite  
- Build Command: `npm run build`  
- Output Directory: `dist`  
- Auto-deploy on push to `main`

---

## 👨‍💻 Authors

Developed by students of the **Análise e Desenvolvimento de Sistemas** program at **SENAC Pernambuco**.

---

## 📄 License

This project was developed for academic purposes at SENAC. All rights reserved.
