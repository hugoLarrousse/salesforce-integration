const api = require('../services/api');
const sendData = require('../services/sendData');
const config = require('config');
const request = require('../services/request');
const logger = require('./logger');

const H7_URL = config.get('h7Url');

const { fixedToken } = process.env;

const pickToken = headers => headers.authorization || null;

const compareToken = token => token === fixedToken;

exports.verifyToken = (req, res, next) => {
  if (compareToken(pickToken(req.headers))) {
    next();
  } else {
    res.status(401).send({ error: true, message: 'Error Token' });
  }
};

const checkTokenValid = (expirationDate) => Date.now() + 300000 < Number(expirationDate);

exports.refreshToken = async (req, res, next) => {
  console.log('AAAAA inside 3');
  const { integrationInfo } = req.body;
  if (integrationInfo && checkTokenValid(integrationInfo.tokenExpiresAt)) {
    next();
  } else {
    const result = await api.refreshToken(integrationInfo.refreshToken);
    if (result && result.access_token) {
      Object.assign(integrationInfo, { token: result.access_token, tokenExpiresAt: Date.now() + 7200000 });
      sendData.integration({ integration: { _id: integrationInfo._id, token: result.access_token, tokenExpiresAt: Date.now() + 7200000 } });
      req.body.integrationInfo = integrationInfo;
    }
    next();
  }
};

exports.checkWebhook = async (req, res, next) => {
  console.log('AAAAA inside');

  res.status(200).send('ok');
  try {
    if (!req.body) {
      throw new Error('no body');
    }
    if (!req.body.userId) {
      throw new Error('no UserId');
    }
    const result = await request.salesforce(H7_URL, 'crm/integration', `integrationId=${req.body.userId}`, 'GET', {
      Authorization: fixedToken,
    });
    console.log('AAAAA inside 2');
    if (!result.integrationInfo || !result.allIntegrations || !result.user) {
      throw new Error(result);
    }
    Object.assign(req.body, result);
    next();
  } catch (e) {
    logger.error(__filename, '/checkWebhook', e.message);
  }
};

