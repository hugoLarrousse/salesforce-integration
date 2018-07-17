const express = require('express');
const request = require('../services/request');
const check = require('../utils/check');
const syncData = require('../services/syncData');
const middleware = require('../utils/middleware');

const router = express.Router();

const TEMP_BEARER = process.env.tempBearer;
const TEMP_INSTANCE_URL = 'https://eu10.salesforce.com/';
const TEMP_ROUTE = 'services/data/v43.0/query/';

router.all('*', middleware.refreshToken);

router.get('/events', async (req, res) => {
  const query = 'SELECT+id,Subject +from+Event';
  try {
    const result = await request.salesforce(TEMP_INSTANCE_URL, TEMP_ROUTE, query, 'GET', {
      Authorization: `Bearer ${TEMP_BEARER}`,
    }, null, true);
    res.status(200).json(result);
  } catch (e) {
    res.status(200).json(e.message);
  }
});

router.get('/opportunities', async (req, res) => {
  const query = 'SELECT+id,Name+from+Opportunity';
  try {
    const result = await request.salesforce(TEMP_INSTANCE_URL, TEMP_ROUTE, query, 'GET', {
      Authorization: `Bearer ${TEMP_BEARER}`,
    }, null, true);
    res.status(200).json(result);
  } catch (e) {
    console.log('e.message :', e.message);
    res.status(200).json(e.message);
  }
});

router.post('/', async (req, res) => {
  console.log('AAAA 1');
  const { integrationInfo, user, allIntegrations } = req.body;
  console.log('integrationInfo :', integrationInfo);
  console.log('user :', user);
  try {
    check.integrationInfo(integrationInfo);
    if (user && allIntegrations.length > 0) {
      res.status(200).send('ok');
      await syncData.everything(integrationInfo, user, allIntegrations);
      console.log('AAA 6 :');
    } else {
      console.log('ERROR USER OR ALL INTEGRATIONS :');
      res.status(400).send('ERROR USER OR ALL INTEGRATIONS');
    }
  } catch (e) {
    console.log('e.message :', e.message);
  }
});

module.exports = router;
