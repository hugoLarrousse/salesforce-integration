const api = require('../api');
const query = require('../api/query');
const saveData = require('../saveData');
const formatData = require('../formatData');
const heptawardApi = require('../heptawardApi');
const sockets = require('../sockets');
const logger = require('../../utils/logger');

const dataTypeForEchoes = ['opportunity', 'task', 'event'];

const extractCustomFilter = (customFilters, type) => (customFilters && customFilters[type]) || [];

const checkRecords = (records, allIntegrationsUserIds, integrationTeam, dataType) => {
  if (!allIntegrationsUserIds) return records;
  const recordFiltered = records.filter(record => allIntegrationsUserIds.includes(record.OwnerId)).map(record => {
    return {
      ...record,
      teamId: integrationTeam,
    };
  });
  // TO DO: temp, only for dctlb
  if (integrationTeam !== process.env.dctlbTeamId) return recordFiltered;
  if (dataType === 'call') {
    const regex = new RegExp(process.env.dctlbTaskFilter);
    return recordFiltered.filter(record => regex.test(record.Subject.toLowerCase()) && record.Subject.toLowerCase().includes('sms'));
  }
  return recordFiltered;
};

const checkFieldsFirstTime = async (dataType, integrationInfo) => {
  try {
    const id = await api.getOneByTypeToTest(dataType, integrationInfo.instanceUrl, integrationInfo.token);
    if (!id) return null;

    const doc = await api.getOneByTypeAndId(dataType, integrationInfo.instanceUrl, integrationInfo.token, id);
    if (!doc) return null;

    const fields = Object.keys(doc);

    const restrictions = query.keys[dataType].split(',').filter(field => !Object.keys(fields).includes(field));

    if (!restrictions || restrictions.length === 0) {
      return null;
    }
    const oldRestrictions = integrationInfo.restrictions || [];

    const newRestrictions = [...new Set([...restrictions, ...oldRestrictions])];

    await heptawardApi.restrictions({ restrictions: newRestrictions, orgaId: integrationInfo.orgaId });
    return newRestrictions;
  } catch (e) {
    logger.error(__filename, 'checkFieldsFirstTime', `integrationInfo: ${integrationInfo}, error: ${e.message}`);
    return null;
  }
};


const syncByType = async (integrationInfo, dataType, user, allIntegrations, special, lastModifiedDateTZ, pathQuery) => {
  try {
    let hasMore = false;
    let urlPath = '';
    let results = null;
    const allIntegrationsUserIds = allIntegrations && allIntegrations.map(i => i.integrationId || 'NoUserIntegrationId');

    if (user.firstTime) {
      const newRestrictions = await checkFieldsFirstTime(dataType, integrationInfo);
      if (newRestrictions) {
        integrationInfo.restrictions = newRestrictions; //eslint-disable-line
      }
    }

    do {
      if (!hasMore) {
        results = await api.getData(
          integrationInfo.instanceUrl, integrationInfo.token, special || dataType,
          lastModifiedDateTZ, pathQuery, integrationInfo.restrictions, integrationInfo.customFields[dataType],
          extractCustomFilter(integrationInfo.customFilters, dataType),
        );
      } else {
        results = await api.getMoreData(integrationInfo.instanceUrl, integrationInfo.token, urlPath);
      }
      if (results && results.records && results.records.length > 0) {
        urlPath = results.nextRecordsUrl;
        const dataForEchoes = await saveData(
          dataType,
          checkRecords(results.records, allIntegrationsUserIds, integrationInfo.integrationTeam, dataType)
        );
        console.log('dataForEchoes', dataForEchoes);

        if (dataTypeForEchoes.includes(dataType)) {
          console.log('dataType', dataType);
          const formattedData = await formatData.echoesInfo(dataForEchoes, dataType, user, allIntegrations, dataType === 'opportunity'
            && integrationInfo.addFields, special && special.includes('Cron') && integrationInfo.stageNames, integrationInfo.customFields[dataType]);
          if (formattedData.toInsert.length > 0
            || formattedData.toUpdate.length > 0
            || (formattedData.toUpsert && formattedData.toUpsert.length > 0)
            || (formattedData.toDelete && formattedData.toDelete.length > 0)) {
              console.log('FORMATTEDDATA', !!formattedData);
            await heptawardApi.echoes(formattedData);
          }
        }
      }
      hasMore = (results && results.done === false) || false;
    } while (hasMore);
  } catch (e) {
    throw Error(`${__filename}, syncByType (${dataType}, user: ${user && user._id}), ${e.message}`);
  }
};

exports.everything = async (integrationInfo, user, allIntegrations, dateTZ, isAuto) => {
  console.log('ACCOUNT');
  sockets.sendInfoSync({ message: 'sse-salesforce-account', step: 1, teamId: user.team_id });
  await syncByType(integrationInfo, 'account', user, undefined, isAuto && 'accountAuto', dateTZ);
  console.log('OPPORTUNITY');
  sockets.sendInfoSync({ message: 'sse-salesforce-opportunity', step: 2, teamId: user.team_id });
  await syncByType(integrationInfo, 'opportunity', user, allIntegrations, isAuto && 'opportunityAuto', dateTZ);
  console.log('TASK');
  sockets.sendInfoSync({ message: 'sse-salesforce-task', step: 3, teamId: user.team_id });
  await syncByType(integrationInfo, 'task', user, allIntegrations, isAuto && 'taskAuto', dateTZ);
  console.log('EVENT');
  sockets.sendInfoSync({ message: 'sse-salesforce-event', step: 4, teamId: user.team_id });
  await syncByType(integrationInfo, 'event', user, allIntegrations, isAuto && 'eventAuto', dateTZ);
  await heptawardApi.integration({ integration: { _id: integrationInfo._id, tokenExpiresAt: Date.now() + 7200000 } });
  sockets.sendInfoSync({ message: 'sse-salesforce-done', step: 5, end: true, teamId: user.team_id }); // eslint-disable-line
};

exports.syncByType = syncByType;
