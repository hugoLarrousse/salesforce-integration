const express = require('express');

const middleware = require('../utils/middleware');
const authenticationController = require('./authentication');
const usersController = require('./users');
const syncController = require('./sync');

const router = express.Router();

router.all('*', middleware.verifyToken);

router.use('/authentication', authenticationController);
router.use('/users', usersController);
router.use('/sync', syncController);

module.exports = router;
