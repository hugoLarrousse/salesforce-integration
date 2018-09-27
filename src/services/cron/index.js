const cron = require('node-cron');
const heptawardApi = require('../heptawardApi');
const api = require('../api');
const syncData = require('../syncData');
const logger = require('../../utils/logger');

const MS_PER_MINUTE = 60000;

const isTokenValid = (expirationDate) => Date.now() - 300000 < Number(expirationDate);

const refreshToken = async (integrationInfo) => {
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
};


const cronTask = async () => {
  try {
    const allInfoForCron = await heptawardApi.integrations();
    if (!allInfoForCron || !allInfoForCron.integrations || !allInfoForCron.others) {
      throw new Error('No integrations');
    }
    for (const integration of allInfoForCron.integrations) {
      console.log('1 :');
      const { user } = integration;
      console.log('2 :');
      const integrationRefreshed = await refreshToken(integration);
      console.log('3 :');
      const otherIntegrations = allInfoForCron.others.filter(other => String(other.orgaId) === String(integrationRefreshed.orgaId));
      console.log('4 :');
      const date = new Date(Date.now() - (10 * MS_PER_MINUTE));
      await syncData.syncByType(
        integrationRefreshed, 'account', user, otherIntegrations,
        'accountCron', `${date.toISOString().split('.')[0]}Z`, '/services/data/v43.0/queryAll/'
      );
      console.log('5 :');

      await syncData.syncByType(
        integrationRefreshed, 'opportunity', user, otherIntegrations,
        'opportunityCron', `${date.toISOString().split('.')[0]}Z`, '/services/data/v43.0/queryAll/'
      );
      console.log('6 :');

      await syncData.syncByType(
        integrationRefreshed, 'task', user, otherIntegrations,
        'taskCron', `${date.toISOString().split('.')[0]}Z`, '/services/data/v43.0/queryAll/'
      );
      console.log('7 :');
      await syncData.syncByType(
        integrationRefreshed, 'event', user, otherIntegrations,
        'eventCron', `${date.toISOString().split('.')[0]}Z`, '/services/data/v43.0/queryAll/'
      );
      console.log('8 :');
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

