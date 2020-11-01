const api = require('../api');
const formatData = require('../formatData');


// TO DO: removed or refactor how we get users
const { dctlbEmails } = process.env;
const dctlbEmailsFormatted = dctlbEmails && dctlbEmails.split(',');

exports.getCoworkers = async (integrationInfo) => {
  const users = await api.getAllUsers(integrationInfo.instanceUrl, integrationInfo.token, 'users', integrationInfo.integrationId);
  if (users && users.records) {
    console.log('getCoworkers => integrationInfo.email', integrationInfo.email);
    if (integrationInfo.email === process.env.dctlbEmail) {
      const usersFormatted = users.records.map(coworker => formatData.coworkerInfo(coworker, integrationInfo.integrationTeam));
      return usersFormatted.filter(user => dctlbEmailsFormatted.includes(user.email));
    }
    return users.records.map(coworker => formatData.coworkerInfo(coworker, integrationInfo.integrationTeam));
  }
  throw new Error('Error getCoworkers');
};

