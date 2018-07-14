const express = require('express');

const middleware = require('../utils/middleware');
const authenticationController = require('./authentication');
const usersController = require('./users');
const syncController = require('./sync');
const webhooksController = require('./webhooks');

const router = express.Router();


router.use('/webhooks', webhooksController);

router.all('*', middleware.verifyToken);

router.use('/credentials', authenticationController);
router.use('/users', usersController);
router.use('/sync', syncController);

module.exports = router;
