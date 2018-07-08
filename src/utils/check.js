const Joi = require('joi');

const schemaIntegrationInfo = Joi.object().keys({
  userId: Joi.string().required(),
  orgaId: Joi.string().required(),
  name: Joi.string().required(),
  lastSync: Joi.number().required(),
  integrationId: Joi.string().required(),
  integrationTeam: Joi.string().required(),
  token: Joi.string().required(),
  email: Joi.string().email().required(),
  refreshToken: Joi.string().required(),
  tokenExpiresAt: Joi.string().required(),
  instanceUrl: Joi.string().required(),
  createdAt: Joi.string().optional(),
  updatedAt: Joi.string().optional(),
});

exports.integrationInfo = info => {
  const { error } = Joi.validate({ ...info }, schemaIntegrationInfo);
  if (error) {
    throw new Error(error.details[0].message);
  }
};
