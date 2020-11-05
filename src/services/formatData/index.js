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

// const hasCheckErrorCloseDate = (customField, closeDate, lastModifiedDate) => {
//   let [year, month] = customField.split('-');
//   const [closeYear, closeMonth] = closeDate.split('-');
//   month -= 1;
//   if (month === 0) {
//     month = 12;
//     year -= 1;
//   }

//   if (month === Number(closeMonth) && Number(year) === Number(closeYear)) return closeDate;
//   if (month < 10) month = `0${month}`;

//   const [lastModifiedYear, lastModifiedMonth, lastModifiedDay] = lastModifiedDate.split('T')[0].split('-');

//   if (lastModifiedYear === year && lastModifiedMonth === month) {
//     return `${year}-${month}-${lastModifiedDay}`;
//   }

//   const dayOfTheMonth = new Date().getUTCDate();

//   return `${year}-${month}-${dayOfTheMonth < 10 ? `0${dayOfTheMonth}` : dayOfTheMonth}`;
// };

const formatWonLostDate = (close, lastModified, integrationTeam, /* doc */) => {
  try {
    // let closeDate = null;
    // if (process.env.dctlbTeamId === integrationTeam && doc.First_Billing_Month_YYYY_MM__c) {
    //   closeDate = new Date(hasCheckErrorCloseDate(doc.First_Billing_Month_YYYY_MM__c, close, lastModified));
    // } else {
    //   closeDate = new Date(close);
    // }
    const closeDate = new Date(close);

    const lastModifiedDate = new Date(lastModified);
    if (isToday(closeDate, lastModifiedDate)) {
      return lastModifiedDate.getTime();
    }
    return closeDate.setHours(12);
  } catch (e) {
    logger.error(__filename, 'formatWonLostDate', `integrationTeam: ${integrationTeam}, ${e.message}`);
    return new Date(lastModified).getTime();
  }
};

const manageSpecificAmount = (integrationTeam, doc, addFields) => {
  if (integrationTeam === process.env.sdbTeamId) {
    return doc.MRR__c || doc.Amount || 0;
  }

  if (addFields && addFields[0] && doc[addFields[0]]) {
    return Number(doc[addFields[0]]) || doc.Amount;
  }
  return doc.Amount;
};

const manageSpecificOwner = (integrationTeam, doc) => {
  if (integrationTeam === process.env.jbTeamId) {
    return doc.CreatedById || doc.OwnerId;
  }
  return doc.OwnerId;
};

// to be changed (amount)
const formatWonLostOpportunity = async (docs, isInsert, user, allIntegrations, addFields, stageNames) => {
  return Promise.all(docs.map(async (doc) => {
    const account = doc.AccountId && await mongo.findOne('salesforce', 'accounts', { Id: doc.AccountId });
    let status = doc.IsWon ? 'won' : 'lost';
    const { integrationTeam } = allIntegrations[0];
    // TO DO: temp for dctlb
    status = (integrationTeam === process.env.dctlbTeamId && doc.StageName === 'Training') ? 'won' : status;
    // const timestampDate = new Date(doc.LastModifiedDate).getTime();
    const timestampDate = formatWonLostDate(doc.CloseDate, doc.LastModifiedDate, integrationTeam, doc);
    return {
      ...model.h7Info(manageSpecificOwner(integrationTeam, doc), allIntegrations, user.team_id),
      ...model.type(`deal-${status}`),
      ...model.source(doc.Id, integrationTeam, manageSpecificOwner(integrationTeam, doc), doc.Id),
      ...model.description(doc.Name, doc.Description, `deal-${status}`),
      ...model.finalClient((account && account.Name) || null),
      ...model.parametres(manageSpecificAmount(integrationTeam, doc, addFields), user.default_currency, doc.Id, status),
      ...model.timestamp(timestampDate, timestampDate, null, timestampDate, timestampDate),
      ...model.notify_users(isInsert),
      // TO DO: temp for dctlb
      ...stageNames && model.stageCelebration(stageNames, doc.StageName),
    };
  }));
};

// to be changed (amount)
const formatOpenedOpportunity = async (docs, isInsert, user, allIntegrations, addFields, stageNames) => {
  return Promise.all(docs.map(async (doc) => {
    const account = doc.AccountId && await mongo.findOne('salesforce', 'accounts', { Id: doc.AccountId });
    const status = doc.IsClosed ? (doc.IsWon && 'won') || 'lost' : 'opened';
    const { integrationTeam } = allIntegrations[0];
    const timestampDate = new Date(doc.CreatedDate).getTime();
    const timestampExpectedDate = new Date(doc.CloseDate).getTime();
    return {
      ...model.h7Info(manageSpecificOwner(integrationTeam, doc), allIntegrations, user.team_id),
      ...model.type('deal-opened'),
      ...model.source(doc.Id, integrationTeam, manageSpecificOwner(integrationTeam, doc), doc.Id, doc),
      ...model.description(doc.Name, doc.Description, 'deal-opened'),
      ...model.finalClient((account && account.Name) || null),
      ...model.parametres(manageSpecificAmount(integrationTeam, doc, addFields), user.default_currency, doc.Id, status),
      ...model.timestamp(timestampDate, timestampDate, null, timestampDate, timestampExpectedDate),
      ...model.notify_users(isInsert),
      ...model.otherUsers(doc, allIntegrations),
      ...stageNames && model.stageCelebration(stageNames, doc.StageName),
    };
  }));
};

const formatTask = (docs, isInsert, user, allIntegrations) => {
  return Promise.all(docs.map(async (doc) => {
    const account = doc.AccountId && await mongo.findOne('salesforce', 'accounts', { Id: doc.AccountId });
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
  const { integrationTeam } = allIntegrations[0];
  return Promise.all(docs.map(async (doc) => {
    const eventNotDone = integrationTeam === process.env.mvoneTeam && doc.EventStatus__c !== 'DONE';
    const account = doc.AccountId && await mongo.findOne('salesforce', 'accounts', { Id: doc.AccountId });
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
        !eventNotDone && new Date(doc.EndDateTime).getTime(),
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
      teamId: doc.teamId,
      id: doc.Id,
      type: typeForDeletion[dataType],
    };
  });
};

exports.echoesInfo = async ({ arrayInsert, arrayUpdate, arrayDelete }, dataType, user, allIntegrations, addFields, stageNames, customFields) => {
  if (dataType === 'opportunity') {
    const wonLostFiltered = allIntegrations[0].integrationTeam === process.env.dctlbTeamId
      ? [...arrayInsert, ...arrayUpdate].filter(data => data.StageName === 'Training' || data.IsClosed)
      : [...arrayInsert, ...arrayUpdate].filter(data => data.IsClosed);
    return {
      toInsert: await formatOpenedOpportunity(arrayInsert, true, user, allIntegrations, addFields, stageNames),
      toUpdate: await formatOpenedOpportunity(arrayUpdate, false, user, allIntegrations, addFields, stageNames),
      toUpsert: await formatWonLostOpportunity(wonLostFiltered, false, user, allIntegrations, addFields, stageNames),
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
      toInsert: await formatEvent(arrayInsert, true, user, allIntegrations, customFields),
      toUpdate: await formatEvent(arrayUpdate, false, user, allIntegrations, customFields),
      toDelete: formatForDeletion(arrayDelete, dataType),
    };
  }
  return null;
};

