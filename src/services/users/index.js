const api = require('../api');
const formatData = require('../formatData');

exports.getCoworkers = async (integrationInfo) => {
  const users = await api.getAllUsers(integrationInfo.instanceUrl, integrationInfo.token, 'users', integrationInfo.integrationId);
  if (users && users.records) {
    console.log('users.records :', users.records);
    return users.records.map(coworker => formatData.coworkerInfo(coworker, integrationInfo.integrationTeam));
  }
  throw new Error('Error getCoworkers');
};

