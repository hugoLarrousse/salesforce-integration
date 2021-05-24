const { CronJob } = require('cron');
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
    throw new Error(`${__filename}, refreshToken, ${e.message}, integrationId: ${integrationInfo._id}`);
  }
};


const job = new CronJob('*/2 * * * *', async () => {
  try {
    const duration = Date.now();
    console.log('-----------------------');
    console.log('START CRON', new Date(duration));
    const allInfoForCron = await heptawardApi.integrations();
    console.log('allInfoForCron', allInfoForCron);
    if (!allInfoForCron || !allInfoForCron.integrations || !allInfoForCron.others) {
      throw new Error('No integrations');
    }
    const testMinuteStartHour = [0, 3, 6, 9].includes(new Date().getMinutes());
    const date = new Date(Date.now() - (testMinuteStartHour ? 8 * MS_PER_MINUTE : 11 * MS_PER_MINUTE));
    console.log('RANGE', `${date.getHours()}h${date.getMinutes()} - ${new Date(duration).getHours()}h${new Date(duration).getMinutes()}`);
    for (const integration of allInfoForCron.integrations) {
      if (String(integration._id) === '5c7e9f62be563b155cc18b5b' || String(integration._id) === '5e9b800c63237f3440fb1062') { // TODO to be removed
        continue; //eslint-disable-line
      }
      try {
        const { user } = integration;
        console.log('user.email :', user.email);

        const integrationRefreshed = await refreshToken(integration);
        const otherIntegrations = allInfoForCron.others.filter(other => String(other.orgaId) === String(integrationRefreshed.orgaId));

        await syncData.syncByType(
          integrationRefreshed, 'account', user, otherIntegrations,
          'accountCron', `${date.toISOString().split('.')[0]}Z`, '/services/data/v43.0/queryAll/'
        );

        if (user.email !== 'clemencecanovas@hotmail.fr') { // TO DO removed
          await syncData.syncByType(
            integrationRefreshed, 'opportunity', user, otherIntegrations,
            'opportunityCron', `${date.toISOString().split('.')[0]}Z`, '/services/data/v43.0/queryAll/'
          );
        }

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
    }
    console.log('END CRON', new Date());
    console.log('DURATION :', (Date.now() - duration) / 1000, 's');
  } catch (e) {
    logger.error(__filename, 'cronTask', e.message);
  }
});


exports.start = async () => job.start();
exports.stop = async () => job.stop();

