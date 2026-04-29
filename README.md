# 📈 Play Trade Shine — Paper Trading Platform (MERN + TypeScript)

A full-stack **paper trading simulation platform** where users can trade virtual assets, track portfolio performance, and view transaction history — while admins manage market assets and monitor system activity.

---

# 🚀 Features

## 👤 User Features

* 🔐 Authentication (JWT-based)
* 📊 View market assets (stocks)
* 💰 Buy / Sell assets
* 📁 Portfolio tracking (holdings, P&L, equity)
* 📜 Transaction history (ledger)
* 💵 Real-time balance updates (polling-based)

---

## 👑 Admin Features

* ➕ Add new assets (stocks)
* 🔒 Role-based access control

---

# 🏗️ Tech Stack

## Frontend

* React (TypeScript)
* Vite
* Axios
* Tailwind CSS
* Radix UI

## Backend

* Node.js
* Express (TypeScript)
* MongoDB (Mongoose)
* JWT Authentication
* bcrypt (password hashing)

---

# 📂 Project Structure

```
play-trade-shine/
│
├── client/                  # Frontend (React)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Auth.tsx
│   │   │   ├── Markets.tsx
│   │   │   ├── Portfolio.tsx
│   │   │   ├── Transactions.tsx
│   │   │   ├── Admin.tsx
│   │   │
│   │   ├── components/
│   │   │   ├── TerminalShell.tsx
│   │   │   ├── TradeDialog.tsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.tsx
│   │
│   │   ├── lib/
│   │   │   ├── format.ts
│
├── server/                  # Backend (Node + Express)
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── trade.controller.ts
│   │   │   ├── portfolio.controller.ts
│   │   │   ├── transaction.controller.ts
│   │   │   ├── admin.controller.ts
│   │   │
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── asset.model.ts
│   │   │   ├── holding.model.ts
│   │   │   ├── transaction.model.ts
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── trade.routes.ts
│   │   │   ├── portfolio.routes.ts
│   │   │   ├── transaction.routes.ts
│   │   │   ├── admin.routes.ts
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── admin.middleware.ts
│
│   │   ├── app.ts
│   │   ├── server.ts
│
│   ├── .env
│
└── README.md
```

---

# ⚙️ Setup Instructions

## 1️⃣ Clone the repository

```
git clone <your-repo-url>
cd play-trade-shine
```

---

## 2️⃣ Backend Setup

```
cd server
npm install
```

### Create `.env`

```
MONGO_URI=mongodb://127.0.0.1:27017/trading-app
JWT_SECRET=your_secret_key
PORT=5000
```

### Run backend

```
npm run dev
```

---

## 3️⃣ Frontend Setup

```
cd client
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:8080
```

---

# 🔐 Authentication Flow

1. User registers / logs in
2. Backend returns JWT token
3. Token stored in `localStorage`
4. Token sent in headers:

```
Authorization: Bearer <token>
```

---

# 🔄 API Endpoints

## Auth

* `POST /api/auth/register`
* `POST /api/auth/login`
* `GET /api/auth/me`

---

## Assets

* `GET /api/assets`

---

## Trading

* `POST /api/trade/buy`
* `POST /api/trade/sell`

---

## Portfolio

* `GET /api/portfolio`

---

## Transactions

* `GET /api/transactions`

---

## Admin

* `POST /api/admin/asset`
* `GET /api/admin/users`
* `GET /api/admin/transactions`

---

# 🧠 Key Concepts

* Paper trading (no real money)
* Role-based access control (admin vs user)
* JWT authentication
* MongoDB relationships (User → Holdings → Transactions)
* Portfolio calculations (P&L, equity)

---

# ⚠️ Important Notes

* This is a **simulation platform**, not real trading
* No real money involved
* Prices are manually controlled by admin
* Balance updates via polling (not websockets)

---

# 🚀 Future Improvements

* 📈 Real-time price simulation
* 📊 Charts (candlestick)
* 🔔 Notifications
* 🧠 AI trading insights
* 📉 Market volatility simulation

---

