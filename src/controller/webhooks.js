const express = require('express');
const logger = require('../utils/logger');
const manageWebhooks = require('../services/webhooks/manage');
const middleware = require('../utils/middleware');

const router = express.Router();

router.all('*', middleware.checkWebhook, middleware.refreshToken);

router.post('/opportunity', async (req) => {
  try {
    await manageWebhooks.opportunity(req.body);
  } catch (e) {
    logger.error(__filename, '/opportunity', e.message);
  }
});

router.post('/task', async (req) => {
  console.log('DANS LA MONEY 4');
  try {
    console.log('req.body :', req.body);
    await manageWebhooks.task(req.body);
    console.log('DANS LA MONEY 5');
  } catch (e) {
    logger.error(__filename, '/task', e.message);
  }
});

router.post('/event', async (req) => {
  try {
    await manageWebhooks.event(req.body);
  } catch (e) {
    logger.error(__filename, '/event', e.message);
  }
});

router.post('/account', async (req) => {
  try {
    await manageWebhooks.account(req.body);
  } catch (e) {
    logger.error(__filename, '/account', e.message);
  }
});

router.post('/user', async (req) => {
  try {
    await manageWebhooks.user(req.body);
  } catch (e) {
    logger.error(__filename, '/user', e.message);
  }
});

module.exports = router;
