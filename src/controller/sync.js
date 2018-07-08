const express = require('express');
const request = require('../services/request');
const check = require('../utils/check');

const router = express.Router();

const TEMP_BEARER = process.env.tempBearer;
const TEMP_INSTANCE_URL = 'https://eu10.salesforce.com/';
const TEMP_ROUTE = 'services/data/v43.0/query/';

router.get('/events', async (req, res) => {
  console.log('in');
  const query = 'SELECT+id,Subject +from+Event';
  try {
    const result = await request.salesforce(TEMP_INSTANCE_URL, TEMP_ROUTE, query, 'GET', {
      Authorization: `Bearer ${TEMP_BEARER}`,
    });
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
    });
    res.status(200).json(result);
  } catch (e) {
    console.log('e.message :', e.message);
    res.status(200).json(e.message);
  }
});

router.post('/', async (req, res) => {
  const { integrationInfo } = req.body
  try {
    check.integrationInfo(integrationInfo);
    res.status(200).json(result);
  } catch (e) {
    console.log('e.message :', e.message);
    res.status(200).json(e.message);
  }
});

module.exports = router;
