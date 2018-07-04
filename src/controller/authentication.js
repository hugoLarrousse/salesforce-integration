const express = require('express');
const { ObjectID } = require('mongodb');
const config = require('config');
const request = require('request-promise');

const logger = require('../utils/logger');
const middleware = require('../utils/middleware');
const authenticationController = require('./authentication');
const usersController = require('./users');
const syncController = require('./sync');

const router = express.Router();

const TEMP_BEARER = process.env.tempBearer
const TEMP_INSTANCE_URL = 'https://eu10.salesforce.com/';
const TEMP_ROUTE = 'services/data/v43.0/query/';

router.get('/access', async (req, res) => {
  const code = req.query.code;
  if(!code) {
    return res.send('code missing');
  }
  const { urlToken, clientId, clientSecret,  redirectUri} = process.env
  const options = {
    method: 'POST',
    url: `${urlToken}?grant_type=${grantType}&code=${code}&client_secret=${clientSecret}&client_id=${clientId}&redirect_uri=${redirectUri}`,
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

// router.post('/pair', verifyToken, verifyParams, async (req, res) => {

// });

module.exports = router;
