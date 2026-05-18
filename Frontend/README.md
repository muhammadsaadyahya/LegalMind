# LegalMind - Intelligent Legal Case Management Platform

A comprehensive React + Redux Toolkit frontend for legal case management with role-based dashboards, AI-powered document research (RAG), and real-time communication.

## 🎯 Features

### ✅ Authentication & Role-Based Access
- User login/registration system
- Three roles: **Lawyer**, **Client**, **Admin**
- Demo accounts with pre-filled credentials
- Persistent authentication state with Redux

### 👨‍⚖️ Lawyer Dashboard
- Overview of active and closed cases
- Case statistics and performance metrics
- Upcoming reminders and deadlines
- Recent activity log
- Case progress tracking

### 👤 Client Dashboard
- My Cases overview
- Document access and management
- Direct messaging with lawyers
- Case status tracking

### 👤 Admin Dashboard
- Complete user management (view, edit, create users)
- Cases oversight and analytics
- User statistics (lawyers, clients, total users)
- Case status distribution
- System monitoring

### 📋 Case Management
- Full case details view
- Case status: In Progress, Discovery, On Hold, Closed
- Priority levels
- Case types and descriptions
- Progress tracking
- Next hearing schedules
- Tags and categorization

### 📄 Document Management
- Upload and manage case documents
- File type filtering (PDF, DOCX, TXT, DOC)
- Document details (size, upload date, uploader)
- Associated case tracking
- Download and delete functionality
- Document notes and summaries

### 🔍 RAG (Retrieval-Augmented Generation) Search
- AI-powered legal document search
- Natural language query support
- Relevance scoring
- Source citations
- Document summarization
- Quick reference summaries of key documents

### 💬 Real-Time Messaging
- Lawyer-Client communication
- Case-specific conversations
- Message history
- Timestamp tracking
- Conversation filtering

### 📊 Analytics & Reporting
- Case statistics
- User management metrics
- Status distribution charts
- Activity logs

## 🏗️ Project Structure

```
src/
├── mockData.js                 # All mock data (users, cases, documents, etc.)
├── store.js                    # Redux store configuration
├── App.jsx                     # Main app component with routing
├── features/
│   ├── authSlice.js           # Authentication state management
│   ├── casesSlice.js          # Cases state management
│   ├── documentsSlice.js      # Documents state management
│   └── chatSlice.js           # Messages state management
├── components/
│   ├── Navbar.jsx             # Main navigation (role-aware)
│   ├── CasesBoard.jsx         # Cases overview component
│   ├── DocumentsList.jsx      # Documents list component
│   └── ChatPanel.jsx          # Chat panel component
└── pages/
    ├── AuthPage.jsx           # Login/Register page
    ├── LawyerDashboard.jsx    # Lawyer dashboard
    ├── CaseManager.jsx        # Case details & management
    ├── DocumentsPage.jsx      # Documents management
    ├── RAGSearch.jsx          # AI legal research
    ├── ChatPage.jsx           # Messaging system
    └── AdminDashboard.jsx     # Admin panel
```

## 🔐 Demo Credentials

Three demo accounts are pre-configured:

| Role | Email | Password |
|------|-------|----------|
| **Lawyer** | jane.doe@legalmind.com | password123 |
| **Client** | john.smith@acmecorp.com | password123 |
| **Admin** | admin@legalmind.com | admin123 |

## 📊 Mock Data Included

- **2 Users (Lawyers)** + **2 Clients** + **1 Admin**
- **4 Active/Closed Cases** with full details
- **5 Documents** attached to cases
- **5+ Chat Messages** between parties
- **4 Reminders** with dates and priorities
- **Activity Logs** for audit trail
- **RAG Search Results** (sample queries)
- **Case Outcome Predictions** (ML simulation)
- **Document Summaries** (AI-generated samples)

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open browser to `http://localhost:5174`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🎨 UI/UX Highlights

- **Clean, modern design** with a professional dark header and light content areas
- **Responsive layout** that works on desktop and tablet
- **Color-coded status badges** for quick case status identification
- **Progress bars** for case completion tracking
- **Interactive components** with smooth transitions
- **Role-based navigation** that adapts to user type
- **Intuitive card-based layouts** for easy scanning

## 💾 State Management

Redux Toolkit manages:
- **auth**: Current user, authentication status, all users
- **cases**: All cases, selected case
- **documents**: All documents
- **chat**: All messages per case

## 🔄 Data Flow

1. User logs in → Redux stores currentUser + authenticated state
2. Navigation updates currentPage state
3. Pages fetch data from Redux slices
4. Actions (add case, send message, etc.) update state
5. Components re-render with new state

## 🎯 Key Pages & Routes

| Page | Path | Access | Features |
|------|------|--------|----------|
| Auth | `/` | Public | Login/Register |
| Dashboard | `/dashboard` | Authenticated | Role-specific overview |
| Cases | `/cases` | Authenticated | Case management |
| Documents | `/documents` | Authenticated | Document management |
| RAG Search | `/rag` | Lawyer | Legal research |
| Chat | `/chat` | Authenticated | Messaging |
| Admin | `/admin` | Admin | User & case management |

## 🔧 Technologies

- **React 18** - UI library
- **Redux Toolkit** - State management
- **React-Redux** - React bindings
- **Vite** - Build tool
- **CSS-in-JS** - Inline styling

## 📝 Mock Data Categories

### Users
- Lawyers (specializations, case counts)
- Clients (company associations)
- Admin users

### Cases
- Full case details (title, summary, description)
- Status tracking
- Priority levels
- Financial amounts
- Progress indicators
- Hearing dates

### Documents
- Multiple file types
- Upload tracking
- Associated cases
- Notes and summaries

### Messages
- Timestamped conversations
- Case-specific threads
- Sender/receiver tracking

### Alerts & Reminders
- Deadline tracking
- Hearing reminders
- Priority levels
- Completion status

## 🚧 Future Enhancements (Backend Integration)

When connecting to a backend, these features can be added:
- **Real-time sync** via WebSockets
- **File uploads** to AWS S3
- **MongoDB persistence**
- **Python microservices** for RAG/ML
- **JWT authentication**
- **Email notifications**
- **Calendar integration**

## 📄 License

This is a frontend prototype with mock data. All data is simulated for demonstration purposes.

## 👥 Team

**National University of Computer and Emerging Sciences (NUCES)**
- Project Advisor: Saifullah Tanvir
- Team Members:
  - Muhammad Talha Amin (22L-6737)
  - Muhammad Saad Yahya (22L-6774)
