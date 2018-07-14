// const config = require('config');

const api = require('../api');
const create = require('./create');

// const triggerName = config.get('triggerName');

const checkWebhooks = async (organisationInfo) => {
  const apexClass = await api.getApexClass(organisationInfo.instance_url, organisationInfo.access_token);

  if (apexClass.totalSize === 0) {
    return false;
  }
  return true;

  // const apexTrigger = await api.getApexTrigger(organisationInfo.instance_url, organisationInfo.access_token);
  // const { records } = apexTrigger;

  // if (records.filter(record => triggerName.includes(record.Name)).length < 5) {
  //   return false;
  // }
  // return true;
};

exports.set = async (organisationInfo) => {
  const isAlreadySet = await checkWebhooks(organisationInfo);
  if (isAlreadySet) {
    return;
  }

  await create.apexClass(organisationInfo);
  await create.remoteProxy(organisationInfo);
  await create.apexTrigger(organisationInfo);
};
