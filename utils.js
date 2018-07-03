const join = require('lodash/join');

exports.prepareSOQLQuery = (array) => join(array, '+');