const express = require('express');

const router = express.Router();

router.get('/', async (req, res) => {
  res.send('ok user');
});

// router.post('/pair', verifyToken, verifyParams, async (req, res) => {

// });

module.exports = router;
