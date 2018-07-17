const api = require('../api');
const saveData = require('../saveData');
const formatData = require('../formatData');
const sendData = require('../sendData');

const dataTypeFOrEchoes = ['opportunity', 'task', 'event'];


const syncByType = async (integrationInfo, dataType, user, allIntegrations, special) => {
  const results = await api.getData(integrationInfo.instanceUrl, integrationInfo.token, special || dataType);
  if (results && results.records) {
    const dataForEchoes = await saveData(dataType, results.records);
    if (dataTypeFOrEchoes.includes(dataType)) {
      const formattedData = await formatData.echoesInfo(dataForEchoes, dataType, user, allIntegrations);
      if (formattedData.toInsert.length > 0 || formattedData.toUpdate.length > 0 || (formatData.toUpsert && formatData.toUpsert.length > 0)) {
        await sendData.echoes(formattedData);
      }
    }
  }
};

exports.everything = async (integrationInfo, user, allIntegrations) => {
  console.log('AAA 2 :');
  await syncByType(integrationInfo, 'account');
  console.log('AAA 3 :');
  await Promise.all(['opportunity', 'task', 'event'].map(type => syncByType(integrationInfo, type, user, allIntegrations)));
  console.log('AAA 4 :');
  sendData.integration({ integration: { _id: integrationInfo._id, tokenExpiresAt: Date.now() + 7200000 } });
  console.log('AAA 5 :');
};

exports.syncByType = syncByType;
