const api = require('../api');
const saveData = require('../saveData');
const formatData = require('../formatData');
const sendData = require('../sendData');

const dataTypeFOrEchoes = ['opportunity', 'task', 'event'];


const syncByType = async (integrationInfo, dataType, user, allIntegrations) => {
  const results = await api.getData(integrationInfo.instanceUrl, integrationInfo.token, dataType);
  const dataForEchoes = await saveData(dataType, results.record);
  if (dataTypeFOrEchoes.includes(dataType)) {
    const formattedData = await formatData.echoesInfo(dataForEchoes, dataType, user, allIntegrations);
    if (formattedData.toInsert.length > 0 || formattedData.toUpdate.length > 0 || formatData.toUpsert.length > 0) {
      await sendData.echoes(formattedData);
    }
  }
};

exports.everything = async (integrationInfo, user, allIntegrations) => {
  await syncByType(integrationInfo, 'account');
  await Promise.all(
    syncByType(integrationInfo, 'opportunity', user, allIntegrations),
    syncByType(integrationInfo, 'task', user, allIntegrations),
    syncByType(integrationInfo, 'event', user, allIntegrations),
  );
};
