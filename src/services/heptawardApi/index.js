const config = require('config');
const request = require('../request');

const H7_URL = config.get('h7Url');
const { fixedToken } = process.env;

exports.echoes = async (data) => {
  return request.salesforce(H7_URL, 'crm/echoes', null, 'POST', { Authorization: fixedToken }, data);
};

exports.integration = (data) => {
  return request.salesforce(H7_URL, 'crm/integration', null, 'PUT', { Authorization: fixedToken }, data);
};

exports.user = (data) => {
  return request.salesforce(H7_URL, 'crm/user', null, 'POST', { Authorization: fixedToken }, data);
};

exports.restrictions = (data) => {
  return request.salesforce(H7_URL, 'crm/restrictions', null, 'POST', { Authorization: fixedToken }, data);
};

exports.integrations = () => request.salesforce(H7_URL, 'crm/integration', null, 'GET', { Authorization: fixedToken });
