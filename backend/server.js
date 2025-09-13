const app = require("./app");
const dotenv = require('dotenv');
const notificationScheduler = require('./crud-operations/services/notificationScheduler');

dotenv.config({ path: './.env' });

const PORT = process.env.PORT || 8001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  
  // Start notification scheduler in production or when explicitly enabled
  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_NOTIFICATIONS === 'true') {
    notificationScheduler.start();
  } else {
    console.log('📧 Notification scheduler disabled in development mode');
    console.log('💡 Set ENABLE_NOTIFICATIONS=true in .env to enable notifications');
  }
});
