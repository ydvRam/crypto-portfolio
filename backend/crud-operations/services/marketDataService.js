const axios = require('axios');
require('dotenv').config();

class MarketDataService {
  constructor() {
    this.alphaVantageKey = process.env.ALPHA_VANTAGE_KEY;
    this.coinGeckoBaseUrl = 'https://api.coingecko.com/api/v3';
  }

  // Fetch stock price from Alpha Vantage
  async getStockPrice(symbol) {
    try {
      console.log(`📈 Fetching stock price for: ${symbol}`);
      
      if (!this.alphaVantageKey) {
        console.warn('⚠️ Alpha Vantage API key not configured');
        return null;
      }

      const response = await axios.get(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.alphaVantageKey}`
      );

      // Log the full response to debug
      console.log(`🔍 Alpha Vantage response for ${symbol}:`, JSON.stringify(response.data, null, 2));

      if (response.data['Global Quote'] && response.data['Global Quote']['05. price']) {
        const price = parseFloat(response.data['Global Quote']['05. price']);
        const change = parseFloat(response.data['Global Quote']['09. change']);
        const changePercent = response.data['Global Quote']['10. change percent'];
        
        console.log(`✅ Stock price for ${symbol}: $${price}`);
        
        return {
          price,
          change,
          changePercent: changePercent ? parseFloat(changePercent.replace('%', '')) : 0,
          lastUpdated: new Date()
        };
      }
      
      // Check if there's an error message
      if (response.data['Error Message']) {
        console.error(`❌ Alpha Vantage error for ${symbol}:`, response.data['Error Message']);
      } else if (response.data['Note']) {
        console.warn(`⚠️ Alpha Vantage note for ${symbol}:`, response.data['Note']);
        // Check if it's a rate limit message
        if (response.data['Note'].includes('API call frequency')) {
          console.warn(`🚫 Rate limit hit for Alpha Vantage API`);
        }
      } else if (response.data['Information']) {
        console.warn(`ℹ️ Alpha Vantage info for ${symbol}:`, response.data['Information']);
        // If it's a rate limit, try Yahoo Finance as fallback
        if (response.data['Information'].includes('rate limit')) {
          console.log(`🔄 Alpha Vantage rate limited, trying Yahoo Finance fallback...`);
          return await this.getStockPriceYahoo(symbol);
        }
      } else {
        console.log(`❌ No price data found for ${symbol}`);
        console.log(`🔍 Response keys:`, Object.keys(response.data));
      }
      
      return null;
    } catch (error) {
      console.error(`❌ Error fetching stock price for ${symbol}:`, error.message);
      // Try Yahoo Finance as fallback on any error
      console.log(`🔄 Alpha Vantage failed, trying Yahoo Finance fallback...`);
      return await this.getStockPriceYahoo(symbol);
    }
  }

  // Yahoo Finance fallback for stock prices (no rate limits)
  async getStockPriceYahoo(symbol) {
    try {
      console.log(`📈 Fetching stock price from Yahoo Finance for: ${symbol}`);
      
      const response = await axios.get(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }
      );

      if (response.data.chart && response.data.chart.result && response.data.chart.result[0]) {
        const result = response.data.chart.result[0];
        const price = result.meta.regularMarketPrice;
        const previousClose = result.meta.chartPreviousClose; // Use chartPreviousClose instead of previousClose
        
        // Debug: Log the meta data structure
        console.log(`🔍 Yahoo Finance meta data for ${symbol}:`, {
          price,
          previousClose,
          regularMarketTime: new Date(result.meta.regularMarketTime * 1000).toLocaleString(),
          chartPreviousClose: result.meta.chartPreviousClose
        });
        
        // Calculate change and change percent with safety checks
        let change = 0;
        let changePercent = 0;
        
        if (previousClose && previousClose > 0) {
          change = price - previousClose;
          changePercent = ((change / previousClose) * 100);
          console.log(`📊 Change calculation: $${price} - $${previousClose} = $${change.toFixed(2)} (${changePercent.toFixed(2)}%)`);
        } else {
          // If no previous close, try to get it from other sources or set to 0
          console.log(`⚠️ No previous close available for ${symbol}, setting change to 0`);
        }
        
        console.log(`✅ Yahoo Finance price for ${symbol}: $${price} (change: $${change.toFixed(2)}, ${changePercent.toFixed(2)}%)`);
        
        return {
          price,
          change,
          changePercent,
          lastUpdated: new Date()
        };
      }
      
      console.log(`❌ No Yahoo Finance data found for ${symbol}`);
      return null;
    } catch (error) {
      console.error(`❌ Error fetching Yahoo Finance price for ${symbol}:`, error.message);
      return null;
    }
  }

  // Fetch cryptocurrency price from CoinGecko
  async getCryptoPrice(symbol) {
    try {
      console.log(`🪙 Fetching crypto price for: ${symbol}`);
      
      // Convert common symbols to CoinGecko IDs
      const symbolMap = {
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'USDT': 'tether',
        'BNB': 'binancecoin',
        'ADA': 'cardano',
        'SOL': 'solana',
        'DOT': 'polkadot',
        'DOGE': 'dogecoin',
        'AVAX': 'avalanche-2',
        'MATIC': 'matic-network'
      };

      const coinId = symbolMap[symbol.toUpperCase()] || symbol.toLowerCase();
      
      const response = await axios.get(
        `${this.coinGeckoBaseUrl}/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`
      );

      if (response.data[coinId]) {
        const data = response.data[coinId];
        console.log(`✅ Crypto price for ${symbol}: $${data.usd}`);
        
        return {
          price: data.usd,
          change: 0, // CoinGecko doesn't provide absolute change in this endpoint
          changePercent: data.usd_24h_change || 0,
          lastUpdated: new Date()
        };
      }
      
      console.log(`❌ No price data found for ${symbol}`);
      return null;
    } catch (error) {
      console.error(`❌ Error fetching crypto price for ${symbol}:`, error.message);
      return null;
    }
  }

  // Fetch ETF price (using Alpha Vantage with Yahoo Finance fallback)
  async getETFPrice(symbol) {
    return this.getStockPrice(symbol); // ETFs are traded like stocks, will use fallback automatically
  }

  // Fetch mutual fund price (placeholder - would need specific API)
  async getMutualFundPrice(symbol) {
    // Most mutual funds update prices once per day after market close
    // This is a placeholder - you'd need a specific mutual fund API
    console.log(`Mutual fund pricing not implemented for ${symbol}`);
    return null;
  }

  // Get current price for any asset type
  async getCurrentPrice(asset) {
    try {
      console.log(`🔍 Getting current price for ${asset.type}: ${asset.symbol}`);
      
      let priceData = null;

      switch (asset.type) {
        case 'stock':
        case 'etf':
          priceData = await this.getStockPrice(asset.symbol);
          break;
        case 'crypto':
          priceData = await this.getCryptoPrice(asset.symbol);
          break;
        case 'mutual-fund':
          priceData = await this.getMutualFundPrice(asset.symbol);
          break;
        case 'bond':
        case 'real-estate':
        case 'commodity':
        case 'other':
          // These asset types don't have real-time pricing
          console.log(`ℹ️ Real-time pricing not available for ${asset.type}: ${asset.symbol}`);
          return null;
        default:
          console.log(`❓ Unknown asset type: ${asset.type}`);
          return null;
      }

      if (priceData) {
        console.log(`✅ Price updated for ${asset.symbol}: $${priceData.price}`);
        return {
          currentPrice: priceData.price,
          priceChange: priceData.change,
          priceChangePercent: priceData.changePercent,
          lastUpdated: priceData.lastUpdated
        };
      }

      return null;
    } catch (error) {
      console.error(`❌ Error getting current price for ${asset.symbol}:`, error.message);
      return null;
    }
  }

  // Update prices for multiple assets
  async updateAssetPrices(assets) {
    console.log(`🔄 Updating prices for ${assets.length} assets...`);
    const updatedAssets = [];
    
    for (const asset of assets) {
      try {
        console.log(`📊 Processing asset: ${asset.symbol} (${asset.type})`);
        const priceData = await this.getCurrentPrice(asset);
        
        if (priceData) {
          updatedAssets.push({
            ...asset,
            currentPrice: priceData.currentPrice,
            lastUpdated: priceData.lastUpdated
          });
          console.log(`✅ Updated ${asset.symbol}: $${asset.purchasePrice} → $${priceData.currentPrice}`);
        } else {
          // Keep existing data if price update fails
          updatedAssets.push(asset);
          console.log(`⚠️ Could not update price for ${asset.symbol}, keeping existing data`);
        }
        
        // Add delay to avoid API rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`❌ Error updating price for ${asset.symbol}:`, error.message);
        updatedAssets.push(asset);
      }
    }
    
    console.log(`✅ Finished updating prices for ${updatedAssets.length} assets`);
    return updatedAssets;
  }

  // Get market overview data
  async getMarketOverview() {
    try {
      const [sp500, nasdaq, bitcoin] = await Promise.all([
        this.getStockPrice('SPY'), // S&P 500 ETF
        this.getStockPrice('QQQ'), // NASDAQ ETF
        this.getCryptoPrice('BTC') // Bitcoin
      ]);

      return {
        sp500: sp500?.price || null,
        nasdaq: nasdaq?.price || null,
        bitcoin: bitcoin?.price || null,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error fetching market overview:', error.message);
      return null;
    }
  }

  // Search for stocks
  async searchStocks(query) {
    try {
      console.log(`🔍 Searching for stocks with query: ${query}`);
      
      // For now, return mock data since we don't have a stock search API
      // In production, you would integrate with Alpha Vantage, Yahoo Finance, or similar
      const mockStocks = [
        { symbol: 'AAPL', name: 'Apple Inc.', price: 150.25, type: 'stock' },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2750.80, type: 'stock' },
        { symbol: 'MSFT', name: 'Microsoft Corporation', price: 310.45, type: 'stock' },
        { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 3200.00, type: 'stock' },
        { symbol: 'TSLA', name: 'Tesla Inc.', price: 850.30, type: 'stock' },
        { symbol: 'META', name: 'Meta Platforms Inc.', price: 180.50, type: 'stock' },
        { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 450.75, type: 'stock' },
        { symbol: 'NFLX', name: 'Netflix Inc.', price: 420.10, type: 'stock' }
      ];

      // Filter stocks based on query (case-insensitive)
      const filteredStocks = mockStocks.filter(stock => 
        stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
        stock.name.toLowerCase().includes(query.toLowerCase())
      );

      console.log(`✅ Found ${filteredStocks.length} stocks matching "${query}"`);
      return filteredStocks;

    } catch (error) {
      console.error(`❌ Error searching stocks for "${query}":`, error.message);
      return [];
    }
  }

  // Search for cryptocurrencies
  async searchCrypto(query) {
    try {
      console.log(`🔍 Searching for crypto with query: ${query}`);
      
      // For now, return mock data since we don't have a crypto search API
      // In production, you would integrate with CoinGecko, CoinMarketCap, or similar
      const mockCrypto = [
        { symbol: 'BTC', name: 'Bitcoin', price: 45000.00, type: 'crypto' },
        { symbol: 'ETH', name: 'Ethereum', price: 3200.00, type: 'crypto' },
        { symbol: 'ADA', name: 'Cardano', price: 1.25, type: 'crypto' },
        { symbol: 'SOL', name: 'Solana', price: 95.50, type: 'crypto' },
        { symbol: 'DOT', name: 'Polkadot', price: 18.75, type: 'crypto' },
        { symbol: 'LINK', name: 'Chainlink', price: 22.40, type: 'crypto' },
        { symbol: 'UNI', name: 'Uniswap', price: 15.80, type: 'crypto' },
        { symbol: 'MATIC', name: 'Polygon', price: 1.45, type: 'crypto' }
      ];

      // Filter crypto based on query (case-insensitive)
      const filteredCrypto = mockCrypto.filter(crypto => 
        crypto.symbol.toLowerCase().includes(query.toLowerCase()) ||
        crypto.name.toLowerCase().includes(query.toLowerCase())
      );

      console.log(`✅ Found ${filteredCrypto.length} cryptocurrencies matching "${query}"`);
      return filteredCrypto;

    } catch (error) {
      console.error(`❌ Error searching crypto for "${query}":`, error.message);
      return [];
    }
  }
}

module.exports = new MarketDataService();
