const express = require('express');
const { ObjectID } = require('mongodb');
const config = require('config');
const request = require('request-promise');

const logger = require('../utils/logger');
const middleware = require('../utils/middleware');

const router = express.Router();

const TEMP_BEARER = process.env.tempBearer
const TEMP_INSTANCE_URL = 'https://eu10.salesforce.com/';
const TEMP_ROUTE = 'services/data/v43.0/query/';

router.all('*', middleware.verifyToken);

router.get('/getEvents', async (req, res) => {
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

// router.post('/pair', verifyToken, verifyParams, async (req, res) => {

// });

module.exports = router;
