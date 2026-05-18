# LegalMind ⚖️

> **Description:** LegalMind is a comprehensive legal practice management system designed to streamline the workflow of law firms, integrating advanced AI capabilities for document analysis and case prediction, real-time communication, and robust case management.

---

## 📖 Table of Contents
- [About the Project](#about-the-project)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [API Overview](#api-overview)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Contributing](#contributing)
- [License](#license)

---

## 🔍 About the Project

LegalMind is a full-stack JavaScript application split into a Frontend and Backend architecture. It provides a unified platform for legal professionals, leveraging modern web technologies and Artificial Intelligence to enhance productivity and decision-making. 

The application solves the problem of fragmented legal workflows by combining secure document ingestion with a Retrieval-Augmented Generation (RAG) system, automated case predictions, and role-based access for Admins, Lawyers, and Clients.

---

## ✨ Key Features

- **🔐 Authentication & Role-Based Access (RBAC):** Secure JWT-based login with distinct dashboards for Admins, Lawyers, and Clients.
- **📁 Case Management:** Complete CRUD operations for cases, an overview dashboard for active/pending/closed cases, and an AI-powered case outcome predictor based on historical data.
- **📄 Document Management (RAG System):** Upload legal PDFs, which are parsed, chunked, and embedded into a Pinecone vector database. Users can perform intelligent natural language searches across all documents.
- **💬 Real-Time Communication:** Instant messaging between lawyers and clients using Socket.io, plus a conversational AI assistant for drafting and quick legal queries.
- **💰 Financials:** Track legal fees, expenses, and cash flow payments.

---

## 🏗 System Architecture

The application follows a client-server architecture:
- **Frontend:** A Single Page Application (SPA) built with React and Vite, managing the user interface and state via Redux. It communicates with the backend via RESTful APIs and WebSockets.
- **Backend:** A Node.js/Express server handling business logic, database interactions, and AI integrations.
- **Database:** MongoDB for persistent storage of users, cases, documents, and chat history.
- **AI Services:** Integrates Google Gemini and Pinecone (Vector Database) for intelligent document search and case analysis.

---

## 📂 Project Structure

```text
LegalMind/
├── Backend/               # Node.js / Express backend API
│   ├── package.json
│   └── .env               # (Needs API keys for DB, Pinecone, Gemini)
├── Frontend/              # React (Vite) client application
│   ├── package.json
│   └── ...
├── .gitignore             
└── README.md              
```

---

## 💻 Tech Stack

### Frontend
- **Framework:** React (Vite)
- **State Management:** Redux Toolkit
- **Routing:** React Router DOM
- **UI/Styling:** Bootstrap, Framer Motion (Animations), Custom CSS
- **Visualization:** Chart.js

### Backend
- **Runtime & Framework:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Real-time:** Socket.io
- **Authentication:** JSON Web Tokens (JWT), bcryptjs
- **AI & Vector Search:** Google GenAI (Gemini), Pinecone, ChromaDB
- **File Handling:** Multer, PDF-Parse

---

## 🔌 API Overview
The frontend communicates with the backend (`http://localhost:5000/api`) via the following primary endpoints:
- **Auth:** `POST /auth/login`, `POST /auth/register`
- **Users:** `GET /users/profile`, `PUT /users/update`
- **Cases:** `GET /cases`, `POST /cases`, `GET /cases/:id`
- **Documents:** `POST /documents/upload`, `GET /documents`
- **AI/Search:** `POST /ai/predict`, `POST /search/query` (RAG Search)
- **Notifications:** `GET /notifications`

---

## 🛠 Prerequisites

- [Node.js](https://nodejs.org/) (v16.x or higher)
- MongoDB (Local or Atlas URI)
- Pinecone API Key
- Google Gemini API Key

---

## 🚀 Getting Started

### 1. Backend Setup
Navigate to the backend directory, install dependencies, and start the development server.

```bash
cd Backend
npm install
# Configure your .env file with MongoDB URI, Pinecone Key, and Gemini Key
npm run dev
```
*(The backend server will run on port 5000)*

### 2. Frontend Setup
Open a new terminal window, navigate to the frontend directory, install dependencies, and start the client application.

```bash
cd Frontend
npm install
npm run dev
```
*(The frontend application will run on port 5173 by default)*

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
