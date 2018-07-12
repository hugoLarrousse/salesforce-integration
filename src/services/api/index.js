const config = require('config');

const request = require('../request');
const query = require('./query');

const grantType = config.get('grantType');

const PATH_FOR_QUERY = '/services/data/v43.0/query/';

const {
  urlLogin,
  clientId,
  clientSecret,
  redirectUri,
} = process.env;

exports.getCredentials = (code) => {
  console.log('AAAAAA 2 :');
  const queryCredentials = `grant_type=${grantType.credentials}&code=${code}&client_secret=${clientSecret}&client_id=${clientId}&redirect_uri=${redirectUri}`; // eslint-disable-line
  console.log('queryCredentials :', queryCredentials);
  return request.salesforce(urlLogin, null, queryCredentials, 'POST', null, null, true);
};

exports.refreshToken = (refreshToken) => {
  const queryRefreshToken = `grant_type=${grantType.refreshToken}&refresh_token=${refreshToken}&client_secret=${clientSecret}&client_id=${clientId}`; // eslint-disable-line
  return request.salesforce(urlLogin, null, queryRefreshToken, 'POST', null, null, true);
};

exports.getInfoUser = (url, accessToken) => {
  console.log('AAAAAA 7 :');
  console.log('accessToken :', accessToken);
  return request.salesforce(url, null, null, 'GET', { Authorization: `Bearer ${accessToken}` }, null, true);
};

exports.getAllUsers = (baseUrl, accessToken, dataType, removeUserId) => {
  const fullQuery = removeUserId ? `${query[dataType]}+where+Id!='${removeUserId}'` : query[dataType];
  return request.salesforce(baseUrl, PATH_FOR_QUERY, fullQuery, 'GET', { Authorization: `Bearer ${accessToken}` }, null, true);
};

exports.getData = (baseUrl, accessToken, dataType) => {
  return request.salesforce(baseUrl, PATH_FOR_QUERY, query[dataType], 'GET', { Authorization: `Bearer ${accessToken}` }, null, true);
};
