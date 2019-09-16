const mongo = require('../../db/mongo');
const model = require('./model');
const logger = require('../../utils/logger');

const credentials = (infoLogin) => {
  return {
    token: infoLogin.access_token,
    refreshToken: infoLogin.refresh_token,
    tokenExpiresAt: Number(infoLogin.issued_at) + 7200000,
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
    // iconUrl: infoUser.photos.picture.split('profilephoto/')[1].length > 8 ? infoUser.photos.picture : null,
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
    // iconUrl: coworker.FullPhotoUrl.split('profilephoto/')[1].length > 8 ? coworker.FullPhotoUrl : null,
  };
};

const isToday = (date1, date2) => {
  const year = date1.getFullYear() === date2.getFullYear();
  const month = date1.getMonth() === date2.getMonth();
  const day = date1.getDate() === date2.getDate();
  return (year && month && day) || false;
};

const formatWonLostDate = (close, lastModified) => {
  try {
    const closeDate = new Date(close);
    const lastModifiedDate = new Date(lastModified);
    if (isToday(closeDate, lastModifiedDate)) {
      return lastModifiedDate.getTime();
    }
    return closeDate.setHours(12);
  } catch (e) {
    logger.error(__filename, formatWonLostDate, e.message);
    return new Date(lastModified).getTime();
  }
};

const manageSpecificAmount = (integrationTeam, doc) => {
  if (integrationTeam === process.env.sdbTeamId) {
    if (doc.IsWon === true) {
      console.log('------------');
      console.log('doc.Id :', doc.Id);
      console.log('doc.Amount :', doc.Amount);
      console.log('doc.MRR__c :', doc.MRR__c);
      console.log('------------');
    }
    return doc.MRR__c || doc.Amount || 0;
  }
  return doc.Amount;
};

const manageSpecificOwner = (integrationTeam, doc) => {
  console.log('IN');
  if (integrationTeam === process.env.jbTeamId) {
    console.log('it\'s specific', doc.CreatedById || doc);
    return doc.CreatedById || doc.OwnerId;
  }
  return doc.OwnerId;
};

// to be changed (amount)
const formatWonLostOpportunity = async (docs, isInsert, user, allIntegrations) => {
  return Promise.all(docs.map(async (doc) => {
    const account = await mongo.findOne('salesforce', 'accounts', { Id: doc.AccountId });
    const status = doc.IsWon ? 'won' : 'lost';
    // const timestampDate = new Date(doc.LastModifiedDate).getTime();
    const timestampDate = formatWonLostDate(doc.CloseDate, doc.LastModifiedDate);
    return {
      ...model.h7Info(doc.OwnerId, allIntegrations, user.team_id),
      ...model.type(`deal-${status}`),
      ...model.source(doc.Id, allIntegrations[0].integrationTeam, doc.OwnerId, doc.Id),
      ...model.description(doc.Name, doc.Description, `deal-${status}`),
      ...model.finalClient((account && account.Name) || null),
      ...model.parametres(manageSpecificAmount(allIntegrations[0].integrationTeam, doc), user.default_currency, doc.Id, status),
      ...model.timestamp(timestampDate, timestampDate, null, timestampDate, timestampDate),
      ...model.notify_users(isInsert),
    };
  }));
};

// to be changed (amount)
const formatOpenedOpportunity = async (docs, isInsert, user, allIntegrations) => {
  return Promise.all(docs.map(async (doc) => {
    const account = await mongo.findOne('salesforce', 'accounts', { Id: doc.AccountId });
    const status = doc.IsClosed ? (doc.IsWon && 'won') || 'lost' : 'opened';
    const timestampDate = new Date(doc.CreatedDate).getTime();
    const timestampExpectedDate = new Date(doc.CloseDate).getTime();
    return {
      ...model.h7Info(doc.OwnerId, allIntegrations, user.team_id),
      ...model.type('deal-opened'),
      ...model.source(doc.Id, allIntegrations[0].integrationTeam, manageSpecificOwner(allIntegrations[0].integrationTeam, doc)),
      ...model.description(doc.Name, doc.Description, 'deal-opened'),
      ...model.finalClient((account && account.Name) || null),
      ...model.parametres(manageSpecificAmount(allIntegrations[0].integrationTeam, doc), user.default_currency, doc.Id, status),
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
      ...model.finalClient((account && account.Name) || null),
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
      ...model.finalClient((account && account.Name) || null),
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

const typeForDeletion = {
  opportunity: ['deal-opened', 'deal-won', 'deal-lost'],
  task: 'call',
  event: 'meeting',
};

const formatForDeletion = (docs, dataType) => {
  return docs.map((doc) => {
    return {
      id: doc.Id,
      type: typeForDeletion[dataType],
    };
  });
};

exports.echoesInfo = async ({ arrayInsert, arrayUpdate, arrayDelete }, dataType, user, allIntegrations) => {
  if (dataType === 'opportunity') {
    return {
      toInsert: await formatOpenedOpportunity(arrayInsert, true, user, allIntegrations),
      toUpdate: await formatOpenedOpportunity(arrayUpdate, false, user, allIntegrations),
      toUpsert: await formatWonLostOpportunity([...arrayInsert, ...arrayUpdate].filter(data => data.IsClosed), false, user, allIntegrations),
      toDelete: formatForDeletion(arrayDelete, dataType),
    };
  } else if (dataType === 'task') {
    return {
      toInsert: await formatTask(arrayInsert, true, user, allIntegrations),
      toUpdate: await formatTask(arrayUpdate, false, user, allIntegrations),
      toDelete: formatForDeletion(arrayDelete, dataType),
    };
  } else if (dataType === 'event') {
    return {
      toInsert: await formatEvent(arrayInsert, true, user, allIntegrations),
      toUpdate: await formatEvent(arrayUpdate, false, user, allIntegrations),
      toDelete: formatForDeletion(arrayDelete, dataType),
    };
  }
  return null;
};

exports.formatQuery = (query, date, restrictions, addFields) => {
  let queryToFormat = query;
  for (const restriction of restrictions) {
    queryToFormat = queryToFormat.replace(`,${restriction}`, '');
  }
  for (const addField of addFields) {
    queryToFormat = queryToFormat.replace('q=SELECT+', `q=SELECT+${addField},`);
  }
  return `${queryToFormat}${date}`;
};

