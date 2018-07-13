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
    const result = await api.postApexTrigger(organisationInfo.instance_url, organisationInfo.access_token, template[trigger]);
    if (!result.success) {
      throw new Error(result.errorCode);
    }
  }
};
