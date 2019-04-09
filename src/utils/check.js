const Joi = require('joi');

const schemaIntegrationInfo = Joi.object().keys({
  _id: Joi.string().optional(),
  userId: Joi.string().required(),
  orgaId: Joi.string().required(),
  name: Joi.string().required(),
  lastSync: Joi.number().required(),
  integrationId: Joi.string().required(),
  integrationTeam: Joi.string().required(),
  token: Joi.string().required(),
  email: Joi.string().email().required(),
  refreshToken: Joi.string().required(),
  tokenExpiresAt: Joi.any().required(),
  instanceUrl: Joi.string().required(),
  restrictions: Joi.any().optional(),
  addFields: Joi.any().optional(),
  createdAt: Joi.any().optional(),
  updatedAt: Joi.any().optional(),
});

exports.integrationInfo = info => {
  const { error } = Joi.validate({ ...info }, schemaIntegrationInfo);
  if (error) {
    throw new Error(error.details[0].message);
  }
};
