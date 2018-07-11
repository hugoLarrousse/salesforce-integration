const api = require('../api');
const saveData = require('../saveData');
const formatData = require('../formatData');
const sendData = require('../sendData');

const dataTypeFOrEchoes = ['opportunity', 'task', 'event'];


const syncByType = async (integrationInfo, dataType, user, allIntegrations) => {
  const results = await api.getData(integrationInfo.instanceUrl, integrationInfo.token, dataType);
  const dataForEchoes = await saveData(dataType, results.records);
  if (dataTypeFOrEchoes.includes(dataType)) {
    const formattedData = await formatData.echoesInfo(dataForEchoes, dataType, user, allIntegrations);
    if (formattedData.toInsert.length > 0 || formattedData.toUpdate.length > 0 || (formatData.toUpsert && formatData.toUpsert.length > 0)) {
      await sendData.echoes(formattedData);
    }
  }
  return 1;
};

exports.everything = async (integrationInfo, user, allIntegrations) => {
  await syncByType(integrationInfo, 'account');
  await Promise.all(['opportunity', 'task', 'event'].map(type => syncByType(integrationInfo, type, user, allIntegrations)));
  sendData.integration({ integration: { _id: integrationInfo._id, tokenExpiresAt: Date.now() + 86400000 } });
};
