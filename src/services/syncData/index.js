const api = require('../api');
const saveData = require('../saveData');
const formatData = require('../formatData');
const sendData = require('../sendData');

const dataTypeFOrEchoes = ['opportunity', 'task', 'event'];


const syncByType = async (integrationInfo, dataType, user, allIntegrations, special) => {
  let hasMore = false;
  let urlPath = '';
  let results = null;
  do {
    console.log('IN LOOP 1 8', dataType);
    if (!hasMore) {
      console.log('IN LOOP 2');
      results = await api.getData(integrationInfo.instanceUrl, integrationInfo.token, special || dataType);
    } else {
      console.log('MORE 9');
      console.log(urlPath);
      results = await api.getMoreData(integrationInfo.instanceUrl, integrationInfo.token, urlPath);
    }
    if (results && results.records) {
      console.log('IN LOOP 3');
      urlPath = results.nextRecordsUrl;
      console.log('urlPath :', urlPath);
      const dataForEchoes = await saveData(dataType, results.records);
      console.log('IN LOOP 4');
      if (dataTypeFOrEchoes.includes(dataType)) {
        console.log('IN LOOP 5');
        const formattedData = await formatData.echoesInfo(dataForEchoes, dataType, user, allIntegrations);
        if (formattedData.toInsert.length > 0 || formattedData.toUpdate.length > 0 || (formatData.toUpsert && formatData.toUpsert.length > 0)) {
          console.log('IN LOOP 6');
          await sendData.echoes(formattedData);
          console.log('IN LOOP 7');
        }
      }
    }
    console.log('results.done :', results.done);
    console.log('results.totalSize :', results.totalSize);
    hasMore = (results && results.done === false) || false;
  } while (hasMore);
};

exports.everything = async (integrationInfo, user, allIntegrations) => {
  await syncByType(integrationInfo, 'account');
  await Promise.all(['opportunity', 'task', 'event'].map(type => syncByType(integrationInfo, type, user, allIntegrations)));
  sendData.integration({ integration: { _id: integrationInfo._id, tokenExpiresAt: Date.now() + 7200000 } });
};

exports.syncByType = syncByType;
