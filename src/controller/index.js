const express = require('express');

const middleware = require('../utils/middleware');
const authenticationController = require('./authentication');
const usersController = require('./users');
const syncController = require('./sync');
const webhooksController = require('./webhooks');

const router = express.Router();

router.all('/webhooks',  async (req, res) => {
  console.log('aaaa :');
});

router.all('*', middleware.verifyToken);

router.use('/credentials', authenticationController);
router.use('/users', usersController);
router.use('/sync', syncController);

module.exports = router;
