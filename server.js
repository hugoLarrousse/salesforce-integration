const express = require('express');
const bodyParser = require('body-parser');

require('dotenv').load({ path: '.env' });

const Utils = require('./utils');
const controller = require('./src/controller');

const app = express();

const port = 8079;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', controller);

console.log(Utils.prepareSOQLQuery([1, 2, 3]));

app.all('*', (req, res) => {
  res.status(200).json('Wrong way my friend');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
