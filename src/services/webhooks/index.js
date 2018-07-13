const config = require('config');

const api = require('../api');
const create = require('./create');

const triggerName = config.get('triggerName');

const checkWebhooks = async ({ instanceUrl, token }) => {
  const apexClass = await api.getApexClass(instanceUrl, token);
  if (apexClass.totalSize === 0) {
    return false;
  }
  const apexTrigger = await api.getApexTrigger(instanceUrl, token);
  const { records } = apexTrigger;
  if (records.filter(record => triggerName.includes(record.Name)).length < 5) {
    return false;
  }
  return true;
};

exports.set = async (organisationInfo) => {
  const isAlreadySet = await checkWebhooks(organisationInfo);
  if (isAlreadySet) {
    return;
  }
  await create.apexClass(organisationInfo);
  await create.apexTrigger(organisationInfo);
};
