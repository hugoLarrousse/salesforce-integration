const express = require('express');
const users = require('../services/users');

const router = express.Router();

router.get('/', async (req, res) => {
  const { integration } = req.body;
  try {
    const coworkers = await users.getCoworkers(integration);
    res.status(200).send(coworkers);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

module.exports = router;
