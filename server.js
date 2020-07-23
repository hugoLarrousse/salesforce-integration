const express = require('express');
const bodyParser = require('body-parser');

const mongo = require('./src/db/mongo');

const allCrons = require('./src/services/cron');

// setTimeout(() => {
//   require('./src/services/cron').cron(); // eslint-disable-line
// }, 8000);

require('dotenv').load({ path: '.env' });


const app = express();
const server = require('http').createServer(app);

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

mongo.createConnection().then((code) => {
  if (code) {
    server.listen(port, () => {
      const date = new Date();
      console.log(`H7 Salesforce service is running on port ${port} at ${date}`);
      allCrons.cron();
    });
  } else {
    console.log('Error with MongoDb connection');
  }
});

const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
signals.forEach(sig => {
  process.on(sig, () => {
    if (process.env.NODE_ENV !== 'production') {
      console.info(`${sig} signal received: ', ${new Date()}`);
    }

    // Stops the server from accepting new connections and finishes existing connections.
    server.close((err) => {
      // if error, log and exit with error (1 code)
      if (err) {
        console.error(err);
        process.exit(1);
      } else {
        mongo.closeConnection();
        process.exit(0);
      }
    });
  });
});
