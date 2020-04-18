const express = require('express');
const bodyParser = require('body-parser');

setTimeout(() => {
  require('./src/services/cron').cron(); // eslint-disable-line
}, 8000);

require('dotenv').load({ path: '.env' });


const app = express();

const port = 8079;

app.use(bodyParser.json({ limit: '4mb' }));
app.use(bodyParser.urlencoded({
  limit: '4mb',
  extended: true,
}));

app.use('/', require('./src/controller'));

app.all('*', (req, res) => {
  res.status(500).json('Wrong way my friend');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
