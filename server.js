const express = require('express');
const bodyParser = require('body-parser');

setTimeout(() => {
  require('./src/services/cron').cron();
});


require('dotenv').load({ path: '.env' });

const controller = require('./src/controller');

const app = express();

const port = 8079;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', controller);

app.all('*', (req, res) => {
  res.status(200).json('Wrong way my friend');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
