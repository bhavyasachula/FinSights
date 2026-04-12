# FinSights 📊
## Bank Statement Analyzer with AI & RBAC

FinSights is a professional, full-stack financial intelligence platform that transforms static, complex bank statements (PDFs) into interactive, actionable visual insights. Using **Google Gemini AI**, it automatically extracts transaction ledgers, daily burn rates, and financial runway predictions through a privacy-first architecture.

![FinSights UI](https://img.shields.io/badge/Tech-React%20%7C%20Node.js%20%7C%20MongoDB%20-blueviolet)
![Status](https://img.shields.io/badge/Status-Beta-orange)

---

## ✨ Key Features

- **🧠 AI-Driven Extraction**: Leverages Google Gemini to parse complex PDF bank statements with high accuracy.
- **🔐 Secure Authentication**: Full user authentication system powered by **JWT** and **Bcrypt** for password hashing.
- **🛡️ Role-Based Access Control (RBAC)**: Distinct permissions for `Users` and `Admins`.
- **🛠️ Admin Dashboard**: Dedicated dashboard for administrators to manage users and monitor system status.
- **🗺️ Interactive Spending Treemap**: Visualize your transaction ledger using a D3.js-powered treemap, grouped by categories and merchants.
- **⚡ Real-time Analysis**: Watch the progress in real-time as the AI processes your data.
- **⛽ Burn Rate Gauge**: Track your monthly spending versus credits with a sleek, interactive gauge.
- **🛫 Financial Runway**: Get an automatic estimate of how many months your current balance will last.
- **🚀 Ultra-Modern UI**: Built with Framer Motion for smooth transitions and a premium glassmorphism aesthetic.

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & Vanilla CSS
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Visualizations**: [D3.js](https://d3js.org/) & Recharts

### **Backend**
- **Runtime**: [Node.js](https://nodejs.org/)
- **Server**: [Express](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose ODM)
- **Auth**: [JSON Web Token (JWT)](https://jwt.io/) & [Bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **AI Engine**: [Google Generative AI (Gemini SDK)](https://ai.google.dev/)
- **File Handling**: [Multer](https://github.com/expressjs/multer)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB instance (local or Atlas)
- [Google Gemini API Key](https://aistudio.google.com/)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/FinSights.git
   cd FinSights
   ```

2. **Setup Backend**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=3001
   ```

3. **Setup Frontend**
   ```bash
   cd ../client
   npm install
   ```

### Running the Application

1. **Start the Server** (from `/server`):
   ```bash
   npm run dev
   ```

2. **Start the Frontend** (from `/client`):
   ```bash
   npm run dev
   ```

3. **Access the App**:
   Open `http://localhost:5173` in your browser.

---

## 👤 Roles & Administration

FinSights implements a dual-role system:

- **User**: Can register, log in, and analyze their own bank statements.
- **Admin**: Has access to the **Admin Dashboard** (`/admin`), where they can:
    - View a list of all registered users.
    - Delete user accounts.
    - Issue a "Clear Data" signal (though financial data is never persisted).

> [!TIP]
> **Admin Secret**: Registering with the email `admin@finsights.com` automatically grants the `admin` role.

---

## 🛡️ Privacy-First Architecture

FinSights is designed with a strict **Privacy-First** approach:
- **No Persistence of Financial Data**: Your uploaded PDFs and extracted transaction data are processed in-memory and are **never stored** in the database.
- **Automated Cleanup**: Temporary file uploads are immediately deleted after the AI analysis is complete.
- **Database Scope**: MongoDB is used *exclusively* for user account management (names, emails, and hashed passwords).

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
