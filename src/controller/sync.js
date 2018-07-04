const express = require('express');
const request = require('request-promise');

const router = express.Router();

const TEMP_BEARER = process.env.tempBearer
const TEMP_INSTANCE_URL = 'https://eu10.salesforce.com/';
const TEMP_ROUTE = 'services/data/v43.0/query/';

router.get('/events', async (req, res) => {
  const query = 'SELECT+id+from+Event';
  const options = {
    method: 'GET',
    url: `${TEMP_INSTANCE_URL}${TEMP_ROUTE}?q=${query}`,
    headers: {
      Authorization: `Bearer ${TEMP_BEARER}`,
    },
    json: true,
  };
    try {
      const result = await request(options);
      res.status(200).json(result);
    } catch (e) {
      res.status(200).json(e.message);
    }
});

router.get('/opportunities', async (req, res) => {
  const query = 'SELECT+id,Name+from+Opportunity';
  const options = {
    method: 'GET',
    url: `${TEMP_INSTANCE_URL}${TEMP_ROUTE}?q=${query}`,
    headers: {
      Authorization: `Bearer ${TEMP_BEARER}`,
    },
    json: true,
  };
    try {
      const result = await request(options);
      res.status(200).json(result);
    } catch (e) {
      console.log('e.message :', e.message);
      res.status(200).json(e.message);
    }
});

module.exports = router;
