const api = require('../api');
const template = require('./template');
const config = require('config');

const triggersName = config.get('triggerName');

exports.apexClass = async ({ instanceUrl, token }) => {
  const result = await api.postApexClass(instanceUrl, token, template.h7WebhookClass);
  if (!result.success) {
    throw new Error(result.errorCode);
  }
};

exports.apexTrigger = async ({ instanceUrl, token }) => {
  for (const trigger of triggersName) {
    const result = await api.postApexClass(instanceUrl, token, template[trigger]);
    if (!result.success) {
      throw new Error(result.errorCode);
    }
  }
};
