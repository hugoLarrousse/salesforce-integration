const express = require('express');
const api = require('../services/api');
const formatData = require('../services/formatData');
const webhooks = require('../services/webhooks');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/', async (req, res) => {
  const { code } = req.query;
  console.log('code :', code);
  try {
    console.log('IN 1');
    
    if (!code) {
      throw new Error('code is missing');
    }
    console.log('IN 2');
    const credentials = await api.getCredentials(code);
    console.log('IN 3', credentials);
    if (!credentials && !credentials.id) {
      throw new Error('no credentials');
    }
    console.log('IN 4');
    const userInfo = await api.getInfoUser(credentials.id, credentials.access_token);
    console.log('IN 5', userInfo);
    await webhooks.set(credentials);
    console.log('IN 6');
    res.status(200).send(formatData.userInfo({ ...userInfo, credentials }));
  } catch (e) {
    logger.error(__filename, 'authentication', e.message);
    res.status(400).json(e.message);
  }
});

module.exports = router;
