const express = require('express');

const check = require('../utils/check');
const middleware = require('../utils/middleware');
const mongo = require('../db/mongo');
const logger = require('../utils/logger');
const api = require('../services/api');

const router = express.Router();

router.all('*', middleware.refreshToken);

router.post('/', async (req, res) => {
  try {
    const { integrationInfo } = req.body;
    check.integrationInfo(integrationInfo);
    const opportunityH7 = await mongo.find('salesforce', 'opportunities', { teamId: integrationInfo.integrationTeam }, { _id: -1 }, 1);
    if (opportunityH7 && opportunityH7[0]) {
      const opportunity = await api.getOneOpportunity(integrationInfo.instanceUrl, integrationInfo.token, opportunityH7[0].Id);

      const opportunityFields = Object.keys(opportunity).filter(fields => fields.includes('__c') || fields === 'Amount');
      res.status(200).send({ opportunityFields });
    } else {
      throw Error('no opportunity found');
    }
  } catch (e) {
    logger.error(__filename, 'post /opportunityFields', `email: ${req.body.integrationInfo && req.body.integrationInfo.email}, ${e.message}`);
    res.status(400).send({ error: 'error post /opportunityFields' });
  }
});

module.exports = router;
