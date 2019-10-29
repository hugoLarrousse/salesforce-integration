const cron = require('node-cron');
const heptawardApi = require('../heptawardApi');
const api = require('../api');
const syncData = require('../syncData');
const logger = require('../../utils/logger');

const MS_PER_MINUTE = 60000;

const isTokenValid = (expirationDate) => Date.now() - 300000 < Number(expirationDate);

const refreshToken = async (integrationInfo) => {
  try {
    if (integrationInfo && isTokenValid(integrationInfo.tokenExpiresAt)) {
      return integrationInfo;
    }
    const result = await api.refreshToken(integrationInfo.refreshToken);
    if (result && result.access_token) {
      Object.assign(integrationInfo, { token: result.access_token, tokenExpiresAt: Date.now() + 7200000 });
      heptawardApi.integration({ integration: { _id: integrationInfo._id, token: result.access_token, tokenExpiresAt: Date.now() + 7200000 } });
      return integrationInfo;
    }
    throw new Error('Error refresh Token');
  } catch (e) {
    throw new Error(`${__filename}, refreshtoken, ${e.message}`);
  }
};


const cronTask = async () => {
  try {
    const duration = new Date();
    console.log('start cron Task', duration);
    const allInfoForCron = await heptawardApi.integrations();
    if (!allInfoForCron || !allInfoForCron.integrations || !allInfoForCron.others) {
      throw new Error('No integrations');
    }
    for (const integration of allInfoForCron.integrations) {
      try {
        const { user } = integration;
        const integrationRefreshed = await refreshToken(integration);
        const otherIntegrations = allInfoForCron.others.filter(other => String(other.orgaId) === String(integrationRefreshed.orgaId));
        const date = new Date(Date.now() - (10 * MS_PER_MINUTE));

        await syncData.syncByType(
          integrationRefreshed, 'account', user, otherIntegrations,
          'accountCron', `${date.toISOString().split('.')[0]}Z`, '/services/data/v43.0/queryAll/'
        );

        await syncData.syncByType(
          integrationRefreshed, 'opportunity', user, otherIntegrations,
          'opportunityCron', `${date.toISOString().split('.')[0]}Z`, '/services/data/v43.0/queryAll/'
        );

        await syncData.syncByType(
          integrationRefreshed, 'task', user, otherIntegrations,
          'taskCron', `${date.toISOString().split('.')[0]}Z`, '/services/data/v43.0/queryAll/'
        );

        await syncData.syncByType(
          integrationRefreshed, 'event', user, otherIntegrations,
          'eventCron', `${date.toISOString().split('.')[0]}Z`, '/services/data/v43.0/queryAll/'
        );
      } catch (e) {
        logger.error(__filename, 'for cronTask', e.message);
        continue; // eslint-disable-line
      }
      console.log('end cron Task', new Date());
      console.log('duration :', new Date() - duration);
    }
  } catch (e) {
    logger.error(__filename, 'cronTask', e.message);
  }
};


exports.cron = async () => {
  cron.schedule('*/3 * * * *', async () => {
    await cronTask();
  });
};

