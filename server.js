const express = require('express');
const bodyParser = require('body-parser');
const request = require('request-promise');
require('dotenv').load({ path: '.env' });

const app = express();

const port = 8079;

const grantType = 'authorization_code';
const responseType = 'code'

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

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

app.all('*', (req, res) => {
  res.status(200).json('OK all');
});


app.listen(port, function (res) {
  console.log(`Server is running on port ${port}`);
});
