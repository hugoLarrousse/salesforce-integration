const api = require('../api');
const formatData = require('../formatData');

exports.getCoworkers = async (integrationInfo) => {
  const users = await api.getAllUsers(integrationInfo.instanceUrl, integrationInfo.token, 'users', integrationInfo.integrationId);
  return users.map(coworker => formatData(coworker, integrationInfo.integrationTeam));
};

