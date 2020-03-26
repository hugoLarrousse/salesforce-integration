const express = require('express');
const check = require('../utils/check');
const syncData = require('../services/syncData');
const middleware = require('../utils/middleware');
const logger = require('../utils/logger');

const router = express.Router();

router.all('*', middleware.refreshToken);

const ONE_DAY_MILLISECONDS = 86400000;
const THREE_HOURS_MILLISECONDS = 3600000 * 3;

router.post('/', async (req, res) => {
  const { integrationInfo, user, allIntegrations } = req.body;
  try {
    check.integrationInfo(integrationInfo);
    if (user && allIntegrations.length > 0) {
      res.status(200).send('ok');
      console.log(new Date(), 'start syncData', user.email);
      await syncData.everything(integrationInfo, user, allIntegrations);
      console.log(new Date(), 'end syncData', user.email);
    } else {
      console.log('ERROR USER OR ALL INTEGRATIONS :');
      res.status(400).send('ERROR USER OR ALL INTEGRATIONS');
    }
  } catch (e) {
    logger.error(__filename, 'post /sync', `user: ${req.body.user.email}, ${e.message}`);
  }
});


router.post('/auto', async (req, res) => {
  const { integrationInfo, user, allIntegrations } = req.body;
  try {
    check.integrationInfo(integrationInfo);
    if (user && allIntegrations.length > 0) {
      res.status(200).send('ok');
      const date = new Date(Date.now() - (ONE_DAY_MILLISECONDS + THREE_HOURS_MILLISECONDS));
      const dateTZ = `${date.toISOString().split('.')[0]}Z`;
      await syncData.everything(integrationInfo, user, allIntegrations, dateTZ, true);
    } else {
      console.log('ERROR USER OR ALL INTEGRATIONS :');
      res.status(400).send('ERROR USER OR ALL INTEGRATIONS');
    }
  } catch (e) {
    logger.error(__filename, 'post /syncAuto', `user: ${req.body.user.email}, ${e.message}`);
  }
});

module.exports = router;
