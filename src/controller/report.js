const express = require('express');

const logger = require('../utils/logger');
const api = require('../services/api');
const middleware = require('../utils/middleware');

const Report = require('../services/reports');

const router = express.Router();

router.post('/', middleware.refreshToken, async (req, res) => {
  try {
    const { integrationInfo, reportId } = req.body;
    if (!integrationInfo) throw Error('no integrationInfo');

    if (reportId) {
      const report = await api.getReport(integrationInfo.instanceUrl, integrationInfo.token, reportId);
      res.status(200).send(report);
    } else {
      const reports = await api.getReports(integrationInfo.instanceUrl, integrationInfo.token);
      res.status(200).send(reports && reports.map(report => {
        return {
          id: report.id,
          name: report.name,
        };
      }));
    }
  } catch (e) {
    logger.error(__filename, 'post /report', `email: ${req.body.integrationInfo && req.body.integrationInfo.email}, ${e.message}`);
    res.status(400).send({ error: 'error post /report' });
  }
});

router.post('/value', async (req, res) => {
  try {
    const {
      integrationInfo,
      reportId,
      columnIndex,
      columnName,
      flatMapKey,
    } = req.body;

    if (!integrationInfo) throw Error('no integrationInfo');
    if (!reportId || !columnIndex || !columnName || !flatMapKey) throw Error('body is incomplete');

    const report = await api.getReport(integrationInfo.instanceUrl, integrationInfo.token, reportId);
    const value = Report.findValueInReport(report, columnIndex, columnName, flatMapKey);
    res.status(200).send({ value });
  } catch (e) {
    logger.error(__filename, 'post /report/value', `email: ${req.body.integrationInfo && req.body.integrationInfo.email}, ${e.message}`);
    res.status(400).send({ error: 'error post /report/value' });
  }
});

module.exports = router;
