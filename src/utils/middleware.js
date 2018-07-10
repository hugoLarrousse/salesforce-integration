const api = require('../services/api');
const sendData = require('../services/sendData');

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

const checkTokenValid = (expirationDate) => Date.now() + 300000 > Number(expirationDate);

exports.refreshToken = async (req, res, next) => {
  const { integrationInfo } = req.body;
  if (checkTokenValid(integrationInfo.tokenExpiresAt)) {
    next();
  } else {
    const result = await api.refreshToken(integrationInfo.refreshToken);
    if (result && result.access_token) {
      Object.assign(integrationInfo, { token: result.access_token, tokenExpiresAt: Date.now() + 86400000 });
      sendData.integration(integrationInfo);
      req.body.integrationInfo = integrationInfo;
    }
    next();
  }
};
