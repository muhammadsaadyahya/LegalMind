# LegalMind Backend

A comprehensive backend service for the LegalMind application - a legal tech platform designed to assist with case management, document handling, AI-powered legal research, and real-time communication.

## 📋 Overview

LegalMind Backend is an Express.js-based REST API with real-time WebSocket support (Socket.IO) that provides:

- **User Authentication & Authorization** - Secure user registration and login using JWT tokens
- **Case Management** - Create and manage legal cases
- **Document Processing** - Upload, parse, and manage legal documents with PDF support
- **AI-Powered Legal Search** - Semantic search with Pinecone vector database
- **Real-time Chat** - WebSocket-based chat with Google Generative AI integration
- **Cash Flow Tracking** - Financial tracking for legal matters
- **Notifications** - Real-time notification system
- **Email Notifications** - Nodemailer integration for notifications

## 🚀 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js 5.x
- **Database:** MongoDB (Mongoose)
- **Real-time Communication:** Socket.IO
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **AI Integration:** Google Generative AI
- **Vector Database:** Pinecone
- **Document Processing:** pdf-parse, pdfreader
- **File Upload:** Multer
- **Email Service:** Nodemailer
- **Environment Variables:** dotenv
- **HTTP Client:** Axios
- **Development:** Nodemon

## 📁 Project Structure

```
src/
├── config/          # Configuration files (database, environment)
├── controllers/     # Request handlers and business logic
├── middlewares/     # Express middlewares (auth, validation, etc.)
├── models/          # MongoDB Mongoose models
├── routes/          # API route definitions
├── service/         # Business logic and external service integrations
├── socket/          # WebSocket event handlers
├── utils/           # Utility functions
└── uploads/         # File upload directory

Root Files:
├── app.js           # Main Express application setup
├── index.js         # Entry point
├── createIndex.js   # Database/vector index initialization
└── testChatClient.js # Chat client test utility
```

## 🔌 API Routes

- `/api/auth` - Authentication (login, register, token refresh)
- `/api/users` - User profile management
- `/api/cases` - Case management
- `/api/documents` - Document upload and management
- `/api/ai` - AI-powered features
- `/api/chats` - Chat messages
- `/api/notifications` - Notifications
- `/api/search` - Semantic search
- `/api/cashFlow` - Cash flow tracking

## 🔧 Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB instance
- Pinecone account (for vector search)
- Google Generative AI API key
- SMTP credentials (for email notifications)

### Setup Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory with the following:

   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PINECONE_API_KEY=your_pinecone_api_key
   PINECONE_ENVIRONMENT=your_pinecone_environment
   GOOGLE_API_KEY=your_google_genai_api_key
   SMTP_EMAIL=your_email@gmail.com
   SMTP_PASSWORD=your_app_password
   NODE_ENV=development
   ```

4. **Initialize database indices** (optional)

   ```bash
   node createIndex.js
   ```

5. **Start the server**

   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   node app.js
   ```

The server will run on `http://localhost:5000`

## 🔐 Authentication

- User registration and login endpoints
- JWT token-based authentication
- Password hashing with bcryptjs
- Token refresh mechanism

## 🤖 AI Features

- **Google Generative AI Integration** - Powered by Google's Generative AI for legal research
- **Semantic Search** - Pinecone-based vector search for document similarity
- **Real-time AI Chat** - WebSocket-based chat with AI responses

## 💬 Real-time Communication

- Socket.IO integration for real-time features
- Chat message broadcasting
- Live notifications
- Automatic connection handling

## 📄 Document Processing

- PDF file upload and parsing
- Document metadata extraction
- Vector embedding for semantic search
- Multi-format document support

## 🧪 Testing

```bash
# Run tests
npm test

# Test chat client
node testChatClient.js
```

## 📜 CORS Configuration

The backend accepts requests from:

- `http://localhost:5173` (Vite dev server - Frontend)
- `http://localhost:5174` (Alternative frontend)

## 🚨 Error Handling

The API implements standardized error responses with appropriate HTTP status codes and descriptive error messages.

## 📝 Environment Setup

Key environment configurations are loaded from `.env` file. See `.env.example` or setup instructions above.

## 🔄 Development Workflow

1. Make changes to source files in `src/`
2. Nodemon automatically reloads the server
3. WebSocket connections are maintained during hot reload
4. Test endpoints using Postman or similar tools

## 📦 Dependencies Overview

| Package                     | Purpose                 |
| --------------------------- | ----------------------- |
| express                     | Web framework           |
| mongoose                    | MongoDB ORM             |
| socket.io                   | Real-time communication |
| jsonwebtoken                | JWT authentication      |
| bcryptjs                    | Password hashing        |
| @google/genai               | AI integration          |
| @pinecone-database/pinecone | Vector search           |
| pdf-parse                   | PDF parsing             |
| nodemailer                  | Email service           |
| multer                      | File uploads            |

## 🤝 Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the repository
4. Create a pull request

## 📄 License

ISC License

## 📞 Support

For issues or questions, please create an issue in the repository.

---

**Note:** This is a backend service for the LegalMind project. Ensure MongoDB and external services (Pinecone, Google GenAI) are properly configured before deployment.
