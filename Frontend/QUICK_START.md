# LegalMind - Quick Start Guide

## 🎯 Quick Reference

### Running the Project
```bash
npm install        # First time only
npm run dev        # Start dev server (localhost:5174)
npm run build      # Production build
```

### Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| Lawyer | jane.doe@legalmind.com | password123 |
| Client | john.smith@acmecorp.com | password123 |
| Admin | admin@legalmind.com | admin123 |

---

## 📖 User Guides

### For Lawyers
1. **Login** with `jane.doe@legalmind.com`
2. **Dashboard** shows:
   - 8 active cases (filtered for your view)
   - Statistics cards (cases, revenue, deadlines)
   - Upcoming reminders
   - Recent activity
3. **Cases** tab: View case details, update status, track progress
4. **Documents** tab: Access all case documents, filter by type
5. **RAG Search** tab: Ask questions about your documents
6. **Chat** tab: Message your clients

### For Clients
1. **Login** with `john.smith@acmecorp.com`
2. **Dashboard** shows your cases
3. **My Cases** tab: View your case details
4. **Messages** tab: Chat with your lawyer

### For Admins
1. **Login** with `admin@legalmind.com`
2. **Dashboard** shows:
   - 5 users (2 lawyers, 2 clients)
   - 4 cases with detailed overview
   - User management table
   - Case analytics
3. **Users** tab: Manage all users
4. **Cases** tab: View all cases in the system

---

## 🗂️ File Organization

### Key Directories
```
src/
├── mockData.js          ← All fake data (users, cases, documents, messages)
├── store.js             ← Redux setup
├── pages/               ← Full page components (dashboards, case manager, etc.)
├── features/            ← Redux slices (auth, cases, documents, chat)
└── components/          ← Reusable components (navbar, boards, panels)
```

### Important Files
| File | Purpose |
|------|---------|
| `mockData.js` | All mock data arrays |
| `store.js` | Redux store config |
| `App.jsx` | Main routing logic |
| `AuthPage.jsx` | Login/Register |
| `LawyerDashboard.jsx` | Lawyer home page |
| `CaseManager.jsx` | Case details |
| `DocumentsPage.jsx` | Document management |
| `RAGSearch.jsx` | Legal research |
| `ChatPage.jsx` | Messaging |
| `AdminDashboard.jsx` | Admin panel |

---

## 🎨 UI Features

### Colors Used
- **Primary**: #667eea (purple) - buttons, links
- **Dark**: #0f172a (dark slate) - headers, text
- **Light**: #f1f5f9 (light slate) - backgrounds
- **Status**: 
  - Green (#22c55e) - Closed
  - Blue (#60a5fa) - In Progress
  - Yellow (#facc15) - Discovery
  - Orange (#f97316) - On Hold

### Common Components
- **Stat Cards**: Show key metrics
- **Case Cards**: Display case information
- **Status Badges**: Color-coded status
- **Progress Bars**: Visual progress tracking
- **Alert Boxes**: Highlighted information
- **Action Buttons**: Interactive elements

---

## 💾 Mock Data Structure

### Case Object
```javascript
{
  id: 'case-1',
  title: 'Contract Dispute - ACME vs. Smith',
  client: 'ACME Corp',
  clientId: 'user-2',
  lawyerId: 'user-1',
  status: 'In Progress',
  priority: 'High',
  nextHearing: '2025-01-15',
  amount: '$150,000',
  progress: 65,
  description: '...',
  tags: ['contract', 'civil']
}
```

### User Object
```javascript
{
  id: 'user-1',
  name: 'Atty. Jane Doe',
  email: 'jane.doe@legalmind.com',
  role: 'lawyer',
  specialization: 'Corporate Law'
}
```

### Message Object
```javascript
{
  id: 'msg-1',
  caseId: 'case-1',
  from: 'Lawyer',
  to: 'Client',
  text: 'Message content...',
  timestamp: '2024-12-28T10:00:00Z'
}
```

---

## 🔄 State Management Flow

### Redux Stores
```
Store
├── auth
│   ├── currentUser
│   ├── isAuthenticated
│   └── users
├── cases
│   ├── items
│   └── selectedCase
├── documents
│   └── items
└── chat
    └── messages
```

### Common Actions
```javascript
// Auth
dispatch(login({ email, password }))
dispatch(logout())
dispatch(register({ name, email, password, role }))

// Cases
dispatch(updateStatus({ id, status }))
dispatch(selectCase(caseId))

// Chat
dispatch(sendMessage({ caseId, from, to, text }))
```

---

## 🎯 Page Navigation

### Lawyer Routes
- `/` - Login
- `dashboard` - Dashboard with cases
- `cases` - Case manager
- `documents` - Document manager
- `rag` - Legal research
- `chat` - Messaging

### Admin Routes
- `dashboard` - Admin dashboard
- `users` - User management
- `cases` - All cases
- `analytics` - Analytics page

---

## 📊 Sample Data Available

### 4 Cases
- Contract Dispute ($150K)
- IP Infringement ($500K)
- Employment Dispute ($75K)
- Real Estate ($2.5M)

### 5 Documents
- PDFs, DOCX files
- Ranging from 0.7 MB to 3.2 MB
- With notes and descriptions

### 5+ Messages
- Between lawyers and clients
- With timestamps
- Case-specific threads

### 4 Reminders
- Different types (hearing, deadline, meeting, mediation)
- Various priority levels
- Upcoming dates

---

## ⚡ Quick Tips

1. **Login Faster**: Click demo account buttons on login page
2. **Filter Documents**: Use the type filter on Documents page
3. **Search Cases**: Click cases in the left panel to view details
4. **Send Messages**: Press Enter or click Send button
5. **View Summaries**: RAG page shows document summaries on the left
6. **Sort by Status**: Admin dashboard shows case breakdown by status

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# If 5173/5174 is busy, it will auto-use the next available port
# Check terminal output for the actual URL
```

### Modules Not Found
```bash
npm install  # Reinstall dependencies
```

### Not Working After Changes
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
npm run dev
```

---

## 📚 Further Development

### To Add More Cases
Edit `src/mockData.js` - `mockCases` array

### To Add More Users
Edit `src/mockData.js` - `mockUsers` array

### To Add More Documents
Edit `src/mockData.js` - `mockDocuments` array

### To Connect Backend
- Replace API calls in slices
- Update mockData with real endpoints
- Add error handling

---

## 📞 Support

**Current Status**: Complete frontend with mock data
**Next Phase**: Backend integration with Node.js/MongoDB
**Timeline**: Ready for immediate backend development

---

## ✅ Checklist

Before committing to backend work:
- [x] Frontend UI complete
- [x] All pages built
- [x] Mock data comprehensive
- [x] Redux state management working
- [x] Role-based access implemented
- [x] No backend dependencies
- [x] Ready for API integration

**You can now start backend development!** 🚀
