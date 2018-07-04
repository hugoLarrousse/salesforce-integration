const express = require('express');
const bodyParser = require('body-parser');
const request = require('request-promise');
require('dotenv').load({ path: '.env' });

const Utils = require('./utils');
const controller = require('./src/controller');

const app = express();

const TEMP_BEARER = process.env.tempBearer
const TEMP_INSTANCE_URL = 'https://eu10.salesforce.com/';
const TEMP_ROUTE = 'services/data/v43.0/query/';
const port = 8079;

const grantType = 'authorization_code';
const responseType = 'code'

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use('/', controller);

app.get('/url', (req, res) => {
  const { clientId, redirectUri, urlAuthorization} = process.env
  const url = `${urlAuthorization}?response_type=${responseType}&client_id=${clientId}&redirect_uri=${redirectUri}`
  res.status(200).send(url);
});

console.log(Utils.prepareSOQLQuery([1,2,3]));

app.all('*', (req, res) => {
  res.status(200).json('Wrong way my friend');
});

app.listen(port, function (res) {
  console.log(`Server is running on port ${port}`);
});
