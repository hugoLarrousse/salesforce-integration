const api = require('../api');
const template = require('./template');
const config = require('config');

const triggersName = config.get('triggerName');

exports.remoteProxy = async (organisationInfo) => {
  // Remote Site Settings
  const result = await api.postRemoteProxy(organisationInfo.instance_url, organisationInfo.access_token, template.h7RemoteSiteSettings);
  console.log('resultREMOTEPROXY :', result);
  if (!result.success && result.errorCode !== 'DUPLICATE_DEVELOPER_NAME') {
    throw new Error(result.errorCode);
  }
};


exports.apexClass = async (organisationInfo) => {
  const result = await api.postApexClass(organisationInfo.instance_url, organisationInfo.access_token, template.h7WebhookClass);
  console.log('resultapexClass :', result);
  if (!result.success) {
    throw new Error(result.errorCode);
  }
};

exports.apexTrigger = async (organisationInfo) => {
  for (const trigger of triggersName) {
    const result = await api.postApexTrigger(organisationInfo.instance_url, organisationInfo.access_token, template[trigger]);
    console.log('resultapexTrigger :', result);
    if (!result.success) {
      throw new Error(result.errorCode);
    }
  }
};
