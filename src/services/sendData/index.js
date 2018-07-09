const config = require('config');
const request = require('../request');

const H7_URL = config.get('h7Url');
const { fixedToken } = process.env;

module.exports = (data) => {
  return request.salesforce(H7_URL, 'crm/echoes', null, 'POST', { Authorization: fixedToken }, data);
};

