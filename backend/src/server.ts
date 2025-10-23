import app from './app.js';
import { prisma } from './config/db.js';

prisma.$connect()
  .then(() => console.log('✅ Connected to PostgreSQL via Prisma'))
  .catch((err) => console.error('❌ DB connection failed:', err));


const PORT = 4000;

const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
