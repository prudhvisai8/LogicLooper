const express = require('express');
const prisma = require('db.js');
const { authenticate } = require('./users'); // Reuse auth

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  const { timeframe } = req.query; // 'all', 'week', 'today'
  let where = {};
  if (timeframe === 'today') where = { updatedAt: { gte: new Date(new Date().setHours(0,0,0,0)) } };
  // Similar for 'week'

  try {
    const users = await prisma.user.findMany({
      where,
      orderBy: { totalScore: 'desc' }, // Assume user model has totalScore
      select: { id: true, displayName: true, totalScore: true, puzzlesSolved: true },
    });
    const ranked = users.map((u, i) => ({ ...u, rank: i + 1 }));
    res.json(ranked);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;s