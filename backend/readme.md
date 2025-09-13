# Crypto Portfolio Backend

A robust backend API for the Investment Portfolio Tracker application, built with Node.js, Express, and MongoDB.

## Features

### Authentication
- User registration and login with JWT
- Password encryption using bcrypt
- Protected routes with middleware
- Input validation using Zod

### Portfolio Management
- Create, read, update, and delete portfolios
- Portfolio customization (risk tolerance, investment goals)
- Portfolio sharing and privacy settings
- Performance tracking and analytics

### Asset Management
- Add, update, and remove assets (stocks, crypto, bonds)
- Real-time price tracking
- Performance calculations (ROI, gain/loss)
- Asset filtering and search
- Bulk operations support

### Market Data Integration
- Real-time stock prices via Alpha Vantage API
- Cryptocurrency data via CoinGecko API
- Caching for improved performance
- Batch market data requests

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcrypt
- **Validation**: Zod
- **Security**: Helmet, CORS, Rate Limiting
- **Caching**: Node-cache
- **HTTP Client**: Axios

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Alpha Vantage API key (free tier available)
- CoinGecko API (free tier available)

## Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file with the following variables:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database Configuration
   MONGO_URI=mongodb://localhost:27017/crypto_portfolio

   # JWT Configuration
   JWT_SECRET=crypto_portfolio_jwt_secret_key_2024_ram_pratap_fs41_458067

   # External API Keys
   ALPHA_VANTAGE_KEY=your_alpha_vantage_api_key_here
   COINGECKO_API_KEY=your_coingecko_api_key_here

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100

   # Cache Configuration
   CACHE_TTL=300
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get user profile

### Portfolios
- `POST /api/portfolios` - Create portfolio
- `GET /api/portfolios` - Get user portfolios
- `PUT /api/portfolios/:id` - Update portfolio
- `DELETE /api/portfolios/:id` - Delete portfolio

### Assets
- `POST /api/assets` - Add asset to portfolio
- `GET /api/assets/:portfolioId` - Get portfolio assets
- `PUT /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Delete asset

### Market Data
- `GET /api/market/:type/:symbol` - Get asset price
- `POST /api/market/batch` - Get batch market data

## Project Structure

```
backend/
├── auth/                    # Authentication module
│   ├── src/
│   │   ├── controllers/    # Auth controllers
│   │   ├── middleware/     # Auth & error middleware
│   │   ├── models/         # User model
│   │   ├── routes/         # Auth routes
│   │   ├── utils/          # JWT utilities
│   │   └── validations/    # Input validation schemas
├── crud-operations/         # Core business logic
│   ├── controllers/        # Portfolio & asset controllers
│   ├── middleware/         # Validation middleware
│   ├── models/             # Portfolio & asset models
│   ├── routes/             # API routes
│   └── validations/        # Input validation schemas
├── config/                 # Database configuration
├── app.js                  # Express app setup
├── server.js               # Server entry point
└── package.json            # Dependencies & scripts
```

## Getting API Keys

### Alpha Vantage (Stocks)
1. Visit [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Sign up for a free API key
3. Free tier: 500 requests per day

### CoinGecko (Cryptocurrencies)
- **Free tier**: No API key required
- **Pro tier**: Visit [CoinGecko Pro](https://www.coingecko.com/en/api/pricing)

## Development

### Running in Development Mode
```bash
npm run dev
```

### Running in Production
```bash
npm start
```

### Environment Variables
- `NODE_ENV`: Set to 'production' for production deployment
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `ALPHA_VANTAGE_KEY`: API key for stock data
- `COINGECKO_API_KEY`: API key for crypto data (optional for free tier)

## Security Features

- **Password Encryption**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Zod schema validation
- **Rate Limiting**: Prevent API abuse
- **CORS Protection**: Configured for security
- **Helmet**: Security headers
- **Request Size Limits**: Prevent large payload attacks

## Error Handling

- Comprehensive error middleware
- Consistent error response format
- Input validation errors
- Database error handling
- JWT error handling

## Performance Features

- **Caching**: Market data caching (5 minutes)
- **Database Indexing**: Optimized queries
- **Rate Limiting**: API request throttling
- **Response Compression**: Efficient data transfer

## Testing the API

### Health Check
```bash
curl http://localhost:5000/api/health
```

### User Registration
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

## Contributing

1. Follow the existing code style
2. Add proper error handling
3. Include input validation
4. Update documentation
5. Test thoroughly

## License

ISC License

## Author

Ram Pratap - FS41 458067
