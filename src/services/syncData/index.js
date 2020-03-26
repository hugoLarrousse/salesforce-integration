const api = require('../api');
const saveData = require('../saveData');
const formatData = require('../formatData');
const heptawardApi = require('../heptawardApi');

const dataTypeForEchoes = ['opportunity', 'task', 'event'];

const syncByType = async (integrationInfo, dataType, user, allIntegrations, special, lastModifiedDateTZ, pathQuery) => {
  try {
    let hasMore = false;
    let urlPath = '';
    let results = null;
    do {
      if (!hasMore) {
        results = await api.getData(
          integrationInfo.instanceUrl, integrationInfo.token, special || dataType,
          lastModifiedDateTZ, pathQuery, integrationInfo.restrictions, dataType === 'opportunity' && integrationInfo.addFields
        );
      } else {
        results = await api.getMoreData(integrationInfo.instanceUrl, integrationInfo.token, urlPath);
      }
      if (results && results.records && results.records.length > 0) {
        urlPath = results.nextRecordsUrl;
        const dataForEchoes = await saveData(dataType, results.records.map(record => {
          return {
            ...record,
            teamId: integrationInfo.integrationTeam,
          };
        }));
        if (dataTypeForEchoes.includes(dataType)) {
          const formattedData = await formatData.echoesInfo(dataForEchoes, dataType, user, allIntegrations, dataType === 'opportunity'
            && integrationInfo.addFields);
          if (formattedData.toInsert.length > 0
            || formattedData.toUpdate.length > 0
            || (formattedData.toUpsert && formattedData.toUpsert.length > 0)
            || (formattedData.toDelete && formattedData.toDelete.length > 0)) {
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
  await syncByType(integrationInfo, 'account', user, undefined, isAuto && 'accountAuto', dateTZ);
  await syncByType(integrationInfo, 'opportunity', user, allIntegrations, isAuto && 'opportunityAuto', dateTZ);
  await syncByType(integrationInfo, 'task', user, allIntegrations, isAuto && 'taskAuto', dateTZ);
  await syncByType(integrationInfo, 'event', user, allIntegrations, isAuto && 'eventAuto', dateTZ);
  await heptawardApi.integration({ integration: { _id: integrationInfo._id, tokenExpiresAt: Date.now() + 7200000 } });
};

exports.syncByType = syncByType;
