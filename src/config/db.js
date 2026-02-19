// src/config/db.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['error'],
  // Optional: better for serverless/Neon pooling
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Graceful shutdown (important for containers, Vercel, etc.)
if (process.env.NODE_ENV !== 'production') {
  process.on('SIGINT', async () => {
    console.log('Shutting down Prisma...');
    await prisma.$disconnect();
    process.exit(0);
  });
}

module.exports = prisma;