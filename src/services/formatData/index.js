const mongo = require('../../db/mongo');
const model = require('./model');

const credentials = (infoLogin) => {
  return {
    token: infoLogin.access_token,
    refreshToken: infoLogin.refresh_token,
    tokenExpiresAt: Number(infoLogin.issued_at) + 86400000,
    instanceUrl: infoLogin.instance_url,
  };
};

const currency = {
  EURO: 'EUR',
};

exports.userInfo = (infoUser) => {
  return {
    email: infoUser.email,
    teamId: infoUser.organization_id,
    userId: infoUser.user_id,
    lang: infoUser.language.split('_')[0],
    // admin
    phone: infoUser.mobile_phone,
    // teamName
    iconUrl: infoUser.photos.picture.split('profilephoto/')[1].length > 8 ? infoUser.photos.picture : null,
    default_currency: currency[infoUser.locale.split('_')[2]] || 'USD',
    credentials: credentials(infoUser.credentials),
  };
};

exports.coworkerInfo = (coworker, teamId) => {
  return {
    email: coworker.Email,
    teamId,
    userId: coworker.Id,
    firstname: coworker.FirstName,
    lastname: coworker.LastName,
    phone: coworker.Phone,
    lang: coworker.LanguageLocaleKey ? coworker.LanguageLocaleKey.split('_')[0] : null,
    default_currency: coworker.LocaleSidKey ? (currency[coworker.LocaleSidKey.split('_')[2]] || 'USD') : null,
    admin: coworker.ReceivesAdminInfoEmails,
    iconUrl: coworker.FullPhotoUrl.split('profilephoto/')[1].length > 8 ? coworker.FullPhotoUrl : null,
  };
};

const formatWonLostOpportunity = async (docs, isInsert, user, allIntegrations) => {
  return Promise.all(docs.map(async (doc) => {
    const account = await mongo.findOne('salesforce', 'accounts', { Id: doc.AccountId });
    const status = doc.IsWon ? 'won' : 'lost';
    const timestampDate = new Date(doc.LastModifiedDate).getTime();
    return {
      ...model.h7Info(doc.OwnerId, allIntegrations, user.team_id),
      ...model.type(`deal-${status}`),
      ...model.source(doc.Id, allIntegrations[0].integrationTeam, doc.OwnerId, doc.Id),
      ...model.description(doc.Name, doc.Description, `deal-${status}`),
      ...model.finalClient(account.Name),
      ...model.parametres(doc.Amount, user.default_currency, doc.Id, status),
      ...model.timestamp(timestampDate, timestampDate, null, timestampDate, timestampDate),
      ...model.notify_users(isInsert),
    };
  }));
};

const formatOpenedOpportunity = async (docs, isInsert, user, allIntegrations) => {
  return Promise.all(docs.map(async (doc) => {
    const account = await mongo.findOne('salesforce', 'accounts', { Id: doc.AccountId });
    const status = doc.IsClosed ? (doc.IsWon && 'won') || 'lost' : 'opened';
    const timestampDate = new Date(doc.CreatedDate).getTime();
    const timestampExpectedDate = new Date(doc.CloseDate).getTime();
    return {
      ...model.h7Info(doc.OwnerId, allIntegrations, user.team_id),
      ...model.type('deal-opened'),
      ...model.source(doc.Id, allIntegrations[0].integrationTeam, doc.OwnerId, doc.Id),
      ...model.description(doc.Name, doc.Description, 'deal-opened'),
      ...model.finalClient(account.Name),
      ...model.parametres(doc.Amount, user.default_currency, doc.Id, status),
      ...model.timestamp(timestampDate, timestampDate, null, timestampDate, timestampExpectedDate),
      ...model.notify_users(isInsert),
    };
  }));
};

const formatTask = (docs, isInsert, user, allIntegrations) => {
  return Promise.all(docs.map(async (doc) => {
    const account = await mongo.findOne('salesforce', 'accounts', { Id: doc.AccountId });
    const timestampDate = new Date(doc.CreatedDate).getTime();
    return {
      ...model.h7Info(doc.OwnerId, allIntegrations, user.team_id),
      ...model.type('call'),
      ...model.source(doc.Id, allIntegrations[0].integrationTeam, doc.OwnerId, doc.WhatId),
      ...model.description(doc.Subject, doc.Description, 'call'),
      ...model.finalClient(account.Name),
      ...model.parametres(),
      ...model.timestamp(timestampDate, timestampDate, timestampDate, timestampDate),
      ...model.notify_users(isInsert),
    };
  }));
};

const formatEvent = (docs, isInsert, user, allIntegrations) => {
  return Promise.all(docs.map(async (doc) => {
    const account = await mongo.findOne('salesforce', 'accounts', { Id: doc.AccountId });
    return {
      ...model.h7Info(doc.OwnerId, allIntegrations, user.team_id),
      ...model.type('meeting'),
      ...model.source(doc.Id, allIntegrations[0].integrationTeam, doc.OwnerId, doc.WhatId),
      ...model.description(doc.Subject, doc.Description, 'meeting'),
      ...model.finalClient(account.Name),
      ...model.parametres(),
      ...model.timestamp(
        new Date(doc.CreatedDate).getTime(),
        new Date(doc.StartDateTime).getTime(),
        new Date(doc.EndDateTime).getTime(),
        new Date(doc.EndDateTime).getTime()
      ),
      ...model.notify_users(isInsert),
    };
  }));
};

exports.echoesInfo = async ({ arrayInsert, arrayUpdate }, dataType, user, allIntegrations) => {
  if (dataType === 'opportunity') {
    return {
      toInsert: await formatOpenedOpportunity(arrayInsert, true, user, allIntegrations),
      toUpdate: await formatOpenedOpportunity(arrayUpdate, false, user, allIntegrations),
      toUpsert: await formatWonLostOpportunity([...arrayInsert, ...arrayUpdate].filter(data => data.IsClosed), false, user, allIntegrations),
    };
  } else if (dataType === 'task') {
    return {
      toInsert: await formatTask(arrayInsert, true, user, allIntegrations),
      toUpdate: await formatTask(arrayUpdate, false, user, allIntegrations),
    };
  } else if (dataType === 'event') {
    return {
      toInsert: await formatEvent(arrayInsert, true, user, allIntegrations),
      toUpdate: await formatEvent(arrayUpdate, false, user, allIntegrations),
    };
  }
  return null;
};

