const express = require('express');
const check = require('../utils/check');
const syncData = require('../services/syncData');
const middleware = require('../utils/middleware');

const router = express.Router();

router.all('*', middleware.refreshToken);

router.post('/', async (req, res) => {
  const { integrationInfo, user, allIntegrations } = req.body;
  try {
    check.integrationInfo(integrationInfo);
    console.log('integrationInfo :', integrationInfo);
    if (user && allIntegrations.length > 0) {
      res.status(200).send('ok');
      await syncData.everything(integrationInfo, user, allIntegrations);
    } else {
      console.log('ERROR USER OR ALL INTEGRATIONS :');
      res.status(400).send('ERROR USER OR ALL INTEGRATIONS');
    }
  } catch (e) {
    console.log('e.message :', e.message);
  }
});

module.exports = router;
