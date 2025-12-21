# 🌍 Nomad

**Nomad** is a microservices-based social discovery platform that enables real-time messaging, location-based feeds, and user connections.

## 🛠️ Tech Stack

| Domain | Technologies |
| --- | --- |
| **Frontend** | React, Vite, Tailwind CSS, Axios |
| **Auth Service** | Java, Spring Boot, Spring Security, JWT, PostgreSQL |
| **Content Service** | Node.js, Express, MongoDB, Cloudinary |
| **Chat Service** | Node.js, Express, Socket.IO, MongoDB |
| **Infrastructure** | Docker, Docker Compose |

---

## 🧩 Architecture & Ports

The system is composed of three backend microservices and one frontend application.

| Service | Port | Description |
| --- | --- | --- |
| **Frontend** | `5173` | The React client application. |
| **Auth Service** | `8080` | Handles registration, login, and friend requests. |
| **Content Service** | `8081` | Manages user posts, feeds, and image uploads. |
| **Chat Service** | `8082` | Real-time WebSocket messaging and chat history. |

---

## 🚀 Getting Started

### 1. Prerequisites

* Node.js (v18+) & npm
* Java JDK 17+ & Maven
* Docker & Docker Compose
* MongoDB & PostgreSQL (Local or Cloud)
* Cloudinary Account

### 2. Environment Setup

Create a `.env` file in the respective directories based on the templates below:

**Content Service** (`content-service/.env`)

```env
PORT=8081
MONGO_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

```

**Chat Service** (`chat-service/.env`)

```env
PORT=8082
MONGO_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:5173

```

**Auth Service** (`auth-service/src/main/resources/application.yml`)
*Ensure your Database credentials and JWT secret are configured in YAML format.*

### 3. Run with Docker (Recommended)

The easiest way to start the entire ecosystem.

```bash
# In the root directory
docker-compose up --build

```

### 4. Run Manually (Development)

**Backend Services:**

```bash
# Auth Service
cd auth-service && ./mvnw spring-boot:run

# Content Service
cd content-service && npm install && npm run dev

# Chat Service
cd chat-service && npm install && npm run dev

```

**Frontend:**

```bash
cd nomad-frontend
npm install
npm run dev

```

---

## ✨ Key Features

* **📍 Geo-Location Feed:** View posts from users within a specific radius of your location.
* **🔐 Secure Auth:** JWT-based authentication with Role-Based Access Control (RBAC).
* **💬 Real-Time Chat:** Instant messaging with online status indicators and typing awareness.
* **☁️ Cloud Media:** Seamless image uploads and hosting via Cloudinary.
* **🤝 Friend System:** Send, accept, and manage friend requests.

---

## 📂 Project Structure

```bash
nomad-backend/
├── auth-service/       # Spring Boot Authentication
├── chat-service/       # Node.js Socket.IO Messaging
├── content-service/    # Node.js Post & Feed Management
├── nomad-frontend/     # React Client
└── docker-compose.yml  # Container Orchestration

```

---

*Built with ❤️ by Uttkarsh Kumar*
