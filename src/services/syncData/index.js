const api = require('../api');
const saveData = require('../saveData');
const formatData = require('../formatData');
const sendData = require('../sendData');

const dataTypeFOrEchoes = ['opportunity', 'task', 'event'];


const syncByType = async (integrationInfo, dataType, user, allIntegrations, special) => {
  console.log('AAAA3');
  
  const results = await api.getData(integrationInfo.instanceUrl, integrationInfo.token, special || dataType);
  console.log('AAAA4');
  if (results && results.records) {
    console.log('AAAA5');
    const dataForEchoes = await saveData(dataType, results.records);
    console.log('AAAA6');
    if (dataTypeFOrEchoes.includes(dataType)) {
      console.log('AAAA7');
      const formattedData = await formatData.echoesInfo(dataForEchoes, dataType, user, allIntegrations);
      console.log('AAAA8');
      if (formattedData.toInsert.length > 0 || formattedData.toUpdate.length > 0 || (formatData.toUpsert && formatData.toUpsert.length > 0)) {
        console.log('AAAA9');
        await sendData.echoes(formattedData);
      }
    }
  }
};

exports.everything = async (integrationInfo, user, allIntegrations) => {
  console.log('AAA 2 :');
  await syncByType(integrationInfo, 'account');
  await Promise.all(['opportunity', 'task', 'event'].map(type => syncByType(integrationInfo, type, user, allIntegrations)));
  sendData.integration({ integration: { _id: integrationInfo._id, tokenExpiresAt: Date.now() + 7200000 } });
};

exports.syncByType = syncByType;
