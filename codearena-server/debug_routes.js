const express = require('express');
const app = express();
try {
  console.log('Loading authRoutes...');
  require('./routes/authRoutes');
  console.log('Loading codeRoutes...');
  require('./routes/codeRoutes');
  console.log('Loading leaderboardRoutes...');
  require('./routes/leaderboardRoutes');
  console.log('Loading userRoutes...');
  require('./routes/userRoutes');
  console.log('Loading battleRoutes...');
  require('./routes/battleRoutes');
  console.log('Loading eventRoutes...');
  require('./routes/eventRoutes');
  console.log('Loading problemRoutes...');
  require('./routes/problemRoutes');
  console.log('Loading chatRoutes...');
  require('./routes/chatRoutes');
  console.log('All routes loaded successfully.');
} catch (e) {
  console.error('Error loading routes:', e);
}
process.exit(0);
