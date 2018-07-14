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
  const queryCredentials = `grant_type=${grantType.credentials}&code=${code}&client_secret=${clientSecret}&client_id=${clientId}&redirect_uri=${redirectUri}`; // eslint-disable-line
  return request.salesforce(urlLogin, null, queryCredentials, 'POST', null, null, true);
};

exports.refreshToken = (refreshToken) => {
  const queryRefreshToken = `grant_type=${grantType.refreshToken}&refresh_token=${refreshToken}&client_secret=${clientSecret}&client_id=${clientId}`; // eslint-disable-line
  return request.salesforce(urlLogin, null, queryRefreshToken, 'POST', null, null, true);
};

exports.getInfoUser = (url, accessToken) => {
  return request.salesforce(url, null, null, 'GET', { Authorization: `Bearer ${accessToken}` }, null, true);
};

exports.getOneUser = (baseUrl, accessToken, dataType, userId) => {
  const fullQuery = `${query[dataType]}+where+Id='${userId}'`;
  return request.salesforce(baseUrl, PATH_FOR_QUERY, fullQuery, 'GET', { Authorization: `Bearer ${accessToken}` }, null, true);
};

exports.getAllUsers = (baseUrl, accessToken, dataType, removeUserId) => {
  const fullQuery = removeUserId ? `${query[dataType]}+where+Id!='${removeUserId}'` : query[dataType];
  return request.salesforce(baseUrl, PATH_FOR_QUERY, fullQuery, 'GET', { Authorization: `Bearer ${accessToken}` }, null, true);
};

exports.getData = (baseUrl, accessToken, dataType) => {
  return request.salesforce(baseUrl, PATH_FOR_QUERY, query[dataType], 'GET', { Authorization: `Bearer ${accessToken}` }, null, true);
};

exports.getApexClass = (baseUrl, accessToken) => {
  return request.salesforce(baseUrl, PATH_FOR_QUERY, query.apexClass, 'GET', { Authorization: `Bearer ${accessToken}` }, null, true);
};

exports.getApexTrigger = (baseUrl, accessToken) => {
  return request.salesforce(baseUrl, PATH_FOR_QUERY, query.apexTrigger, 'GET', { Authorization: `Bearer ${accessToken}` }, null, true);
};

exports.postApexClass = (baseUrl, accessToken, data) => {
  return request.salesforce(baseUrl, '/services/data/v43.0/sobjects/ApexClass', query.apexClass, 'POST', {
    Authorization: `Bearer ${accessToken}`,
  }, data, true);
};

exports.postApexTrigger = (baseUrl, accessToken, data) => {
  return request.salesforce(baseUrl, '/services/data/v43.0/sobjects/ApexTrigger', query.apexTrigger, 'POST', {
    Authorization: `Bearer ${accessToken}`,
  }, data, true);
};

exports.postRemoteProxy = (baseUrl, accessToken, data) => {
  return request.salesforce(baseUrl, '/services/data/v43.0/tooling/sobjects/RemoteProxy/', query.apexTrigger, 'POST', {
    Authorization: `Bearer ${accessToken}`,
  }, data, true);
};
