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
  const queryCredentials = `grant_type=${grantType}&code=${code}&client_secret=${clientSecret}&client_id=${clientId}&redirect_uri=${redirectUri}`;
  return request.salesforce(urlLogin, null, queryCredentials, 'POST');
};

exports.getInfoUser = (url, accessToken) => {
  return request.salesforce(url, null, null, 'GET', { Authorization: `Bearer ${accessToken}` });
};

exports.getData = (baseUrl, accessToken, dataType) => {
  return request.salesforce(baseUrl, PATH_FOR_QUERY, query[dataType], 'GET', { Authorization: `Bearer ${accessToken}` });
};
