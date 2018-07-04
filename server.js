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

app.get('/authCodeCallback', async (req, res) => {
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

app.get('/getOpportunities', async (req, res) => {
  const query = 'SELECT+id,Name+from+Opportunity';
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
      console.log('e.message :', e.message);
      res.status(200).json(e.message);
    }
});

console.log(Utils.prepareSOQLQuery([1,2,3]));

app.all('*', (req, res) => {
  res.status(200).json('OK all');
});


app.listen(port, function (res) {
  console.log(`Server is running on port ${port}`);
});
