const express = require('express');
const users = require('../services/users');

const router = express.Router();

router.post('/', async (req, res) => {
  const { integrationInfo } = req.body;
  try {
    const coworkers = await users.getCoworkers(integrationInfo);
    res.status(200).send(coworkers);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

module.exports = router;
