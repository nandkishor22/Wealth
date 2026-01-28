# 💰 Wealth - Smart Personal Finance Manager

![Wealth Banner](client/public/home.png)

> **Experience the future of personal finance management. Track, Analyze, and Grow your wealth with AI-driven insights.**

---

## 🌟 Overview

**Wealth** is a comprehensive, modern personal finance application designed to help you take control of your financial life. Built with a robust **MERN stack** and powered by **AI**, it offers seamless tracking of expenses, budgeting, and account management, all wrapped in a stunning, responsive interface.

Whether you are budgeting for the month, tracking your daily expenses, or analyzing your spending habits, Wealth provides the tools you need with a premium user experience.

---

## 📸 Screenshots

### 📊 Dashboard & Analytics
Get a bird's-eye view of your financial health with interactive charts and summaries.

<p align="center">
  <img src="client/public/dashboard.png" width="45%" alt="Dashboard" />
  <img src="client/public/acountanalysis.png" width="45%" alt="Account Analysis" />
</p>

### 💸 Transactions & Budgeting
Easily add transactions and set budgets to keep your spending in check.

<p align="center">
  <img src="client/public/transaction.png" width="45%" alt="Transactions" />
  <img src="client/public/budget.png" width="45%" alt="Budget" />
</p>

### 🔐 User Experience
Secure authentication and sleek profile management.

<p align="center">
  <img src="client/public/registration.png" width="45%" alt="Register" />
  <img src="client/public/profile.png" width="45%" alt="Profile" />
</p>

---

## ✨ Key Features

-   **🤖 AI Finance Advisor**: Integrated ChatBot to answer your financial queries and provide insights (powered by Groq SDK).
-   **📱 WhatsApp Integration**: Receive updates and interact with your finance data via WhatsApp.
-   **💹 Comprehensive Dashboard**: Visual breakdown of income, expenses, and savings using `Recharts`.
-   **💳 Multi-Account Management**: Track various bank accounts and wallets in one place.
-   **📅 Budget Planner**: Set monthly budgets and track your progress in real-time.
-   **🔄 Recurring Transactions**: (Supported by backend cron scheduler).
-   **🎨 Premium UI/UX**: Built with **Tailwind CSS** and **Framer Motion** for smooth animations and a glassmorphism aesthetic.
-   **🔐 Secure**: JWT-based authentication and BCrypt password hashing.

---

## 🛠️ Technology Stack

### **Frontend (Client)**
*   **Framework**: React 19
*   **Styling**: Tailwind CSS
*   **Animations**: Framer Motion
*   **Routing**: React Router Dom 7
*   **Charts**: Recharts
*   **State/Data**: Axios, React Hook Form, Zod

### **Backend (Server)**
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: MongoDB (Mongoose)
*   **Authentication**: JWT, BCrypt.js
*   **Services**: Cron Jobs, Nodemailer, Twilio, Groq AI SDK

---

## 🚀 Getting Started

Follow these steps to run the project locally.

### Prerequisites
-   Node.js installed
-   MongoDB installed locally or a MongoDB Atlas connection string

### 1. Clone the Repository
```bash
git clone <repository_url>
cd Wealth
```

### 2. Setup Server
```bash
cd server
npm install
```
**Create a `.env` file in the `server` directory:**
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
# Add other keys for Twilio/Email as needed
```
**Run the Server:**
```bash
npm start
```

### 3. Setup Client
Open a new terminal:
```bash
cd client
npm install
```
**Run the Client:**
```bash
npm start
```

The application should now be running at `http://localhost:3000`!

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License
This project is licensed under the ISC License.
