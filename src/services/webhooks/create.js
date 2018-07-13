const api = require('../api');
const template = require('./template');
const config = require('config');

const triggersName = config.get('triggerName');

exports.apexClass = async (organisationInfo) => {
  const result = await api.postApexClass(organisationInfo.instance_url, organisationInfo.access_token, template.h7WebhookClass);
  if (!result.success) {
    throw new Error(result.errorCode);
  }
};

exports.apexTrigger = async (organisationInfo) => {
  for (const trigger of triggersName) {
    console.log('trigger :', trigger);
    console.log('template[trigger] :', template[trigger]);
    const result = await api.postApexClass(organisationInfo.instance_url, organisationInfo.access_token, template[trigger]);
    console.log('result :', result);
    if (!result.success) {
      throw new Error(result.errorCode);
    }
  }
};
