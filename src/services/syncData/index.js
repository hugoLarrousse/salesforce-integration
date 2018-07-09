const api = require('../api');
const saveData = require('../saveData');

const syncByType = async (integrationInfo, dataType) => {
  const results = await api.getData(integrationInfo.instanceUrl, integrationInfo.token, dataType);
  return saveData(dataType, results.record);
};

exports.everything = async (integrationInfo) => {
  return Promise.all(
    syncByType(integrationInfo, 'opportunity'),
    syncByType(integrationInfo, 'task'),
    syncByType(integrationInfo, 'event'),
    syncByType(integrationInfo, 'account')
  );
};
