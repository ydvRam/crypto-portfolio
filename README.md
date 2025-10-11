# 📊 Investment Portfolio Tracker

> A comprehensive full-stack web application for managing and tracking investment portfolios with real-time market data and automated notifications.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://crypto-portfolio-frontend-52gk.onrender.com)
[![Backend API](https://img.shields.io/badge/API-active-blue)](https://portfolio-1md9.onrender.com)

![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express)

---

## ✨ Features

- 🔐 **Secure Authentication** - JWT-based user authentication with password encryption
- 📈 **Portfolio Management** - Create, track, and manage multiple investment portfolios
- 💰 **Asset Tracking** - Monitor stocks, cryptocurrencies, and bonds with real-time data
- 📧 **Email Notifications** - Automated alerts for price changes and portfolio updates
- 📊 **Analytics Dashboard** - Visual insights into portfolio performance and ROI
- 🎨 **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- ⚡ **Real-time Updates** - Live market data integration with caching for performance

---

## 🛠️ Tech Stack

### Frontend
- **React.js** - Modern UI framework
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client
- **React Router** - Navigation

### Backend
- **Node.js & Express.js** - Server framework
- **MongoDB & Mongoose** - Database
- **JWT** - Authentication
- **Nodemailer** - Email service
- **Zod** - Input validation
- **Node-cron** - Task scheduling

### Deployment
- **Render** - Frontend & Backend hosting
- **MongoDB Atlas** - Cloud database

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- Gmail account (for email notifications)
   ```

**Access Application**
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:8001`

---

## 📁 Project Structure

```
crypto-portfolio/
├── backend/
│   ├── auth/                    # Authentication module
│   ├── crud-operations/         # Core business logic
│   │   ├── controllers/        # Request handlers
│   │   ├── models/             # Database schemas
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business services
│   │   └── validations/        # Input validation
│   ├── config/                 # Database config
│   ├── app.js                  # Express setup
│   └── server.js               # Entry point
│
└── frontend/portfolio/
    ├── src/
    │   ├── components/         # Reusable components
    │   ├── pages/              # Page components
    │   ├── services/           # API services
    │   └── App.jsx             # Main app component
    └── public/                 # Static assets
```

---

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Portfolios
- `GET /api/portfolios` - Get all portfolios
- `POST /api/portfolios` - Create portfolio
- `PUT /api/portfolios/:id` - Update portfolio
- `DELETE /api/portfolios/:id` - Delete portfolio

### Assets
- `GET /api/assets/:portfolioId` - Get portfolio assets
- `POST /api/assets` - Add asset
- `PUT /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Remove asset

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark as read

---

## 🌐 Live Demo

- **Frontend:** [https://crypto-portfolio-frontend-52gk.onrender.com](https://crypto-portfolio-frontend-52gk.onrender.com)
---


## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation with Zod
- Rate limiting on API endpoints
- CORS protection
- Helmet security headers

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📝 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

**Ram Pratap**  
[GitHub](https://github.com/ydvRam) | [LinkedIn](https://linkedin.com/in/your-profile)

---

## 🙏 Acknowledgments

- Alpha Vantage API for stock market data
- CoinGecko API for cryptocurrency prices
- MongoDB Atlas for database hosting
- Render for deployment platform

---

<div align="center">
  <p>Built with ❤️ using React, Node.js, and MongoDB</p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>

