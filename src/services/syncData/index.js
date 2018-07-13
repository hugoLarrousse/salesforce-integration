const api = require('../api');
const saveData = require('../saveData');
const formatData = require('../formatData');
const sendData = require('../sendData');

const dataTypeFOrEchoes = ['opportunity', 'task', 'event'];


const syncByType = async (integrationInfo, dataType, user, allIntegrations, special) => {
  console.log('IIII 2:');
  const results = await api.getData(integrationInfo.instanceUrl, integrationInfo.token, special || dataType);
  console.log('IIII 3:');
  if (results && results.records) {
    console.log('IIII 4:');
    const dataForEchoes = await saveData(dataType, results.records);
    if (dataTypeFOrEchoes.includes(dataType)) {
      console.log('IIII 5:');
      const formattedData = await formatData.echoesInfo(dataForEchoes, dataType, user, allIntegrations);
      if (formattedData.toInsert.length > 0 || formattedData.toUpdate.length > 0 || (formatData.toUpsert && formatData.toUpsert.length > 0)) {
        console.log('IIII 6:');
        await sendData.echoes(formattedData);
      }
    }
  }
};

exports.everything = async (integrationInfo, user, allIntegrations) => {
  console.log('IIII 2:');
  await syncByType(integrationInfo, 'account');
  await Promise.all(['opportunity', 'task', 'event'].map(type => syncByType(integrationInfo, type, user, allIntegrations)));
  sendData.integration({ integration: { _id: integrationInfo._id, tokenExpiresAt: Date.now() + 86400000 } });
};

exports.syncByType = syncByType;
