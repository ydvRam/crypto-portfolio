const axios = require('axios');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // 5-minute cache

exports.getMarketData = async (req, res) => {
  const { type, symbol } = req.params;
  const cacheKey = `${type}_${symbol}`;
  let data = cache.get(cacheKey);

  if (data) return res.json(data);

  try {
    if (type === 'stock') {
      const response = await axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_KEY}`);
      const quote = response.data['Global Quote'];
      if (!quote) throw new Error('No data found');
      data = { price: parseFloat(quote['05. price']), change: parseFloat(quote['10. change percent']) };
    } else if (type === 'crypto') {
      const response = await axios.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${symbol.toLowerCase()}`);
      const coinData = response.data[0];
      if (!coinData) throw new Error('No data found');
      data = { price: coinData.current_price, change: coinData.price_change_percentage_24h };
    } else {
      return res.status(400).json({ error: 'Invalid asset type' });
    }
    cache.set(cacheKey, data);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
};

exports.getBatchMarketData = async (req, res) => {
  const { symbols } = req.body; // Array: [{ type: 'stock', symbol: 'AAPL' }, ...]
  const results = {};
  try {
    for (const item of symbols) {
      const { type, symbol } = item;
      // Reuse getMarketData logic (call internally)
      let data;
      const cacheKey = `${type}_${symbol}`;
      data = cache.get(cacheKey);
      if (!data) {
        // Fetch if not cached
        if (type === 'stock') {
          const response = await axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_KEY}`);
          const quote = response.data['Global Quote'];
          data = { price: parseFloat(quote['05. price']), change: parseFloat(quote['10. change percent']) };
        } else if (type === 'crypto') {
          const response = await axios.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${symbol.toLowerCase()}`);
          const coinData = response.data[0];
          data = { price: coinData.current_price, change: coinData.price_change_percentage_24h };
        }
        cache.set(cacheKey, data);
      }
      results[symbol] = data;
    }
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch batch market data' });
  }
};