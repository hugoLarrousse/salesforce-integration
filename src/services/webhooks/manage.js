const mongo = require('../../db/mongo');
const sendData = require('../sendData');
const syncData = require('../syncData');
const api = require('../api');
const formatData = require('../formatData');

const collectionName = {
  opportunity: 'opportunities',
  event: 'events',
  task: 'tasks',
  account: 'accounts',
};


const deleteData = async (Id, dataType) => {
  const deleted = await mongo.softDelete('salesforce', collectionName[dataType], { Id });
  console.log('deleted :', deleted);
  if (!deleted) {
    throw new Error('nothing deleted');
  }
  await sendData.echoes({ toDelete: deleted });
};

exports.opportunity = (body) => {
  const {
    old,
    integrationInfo,
    user,
    allIntegrations,
  } = body;
  const newDoc = body.new;
  if (!newDoc && old && old.length > 0) {
    deleteData(old[0].Id, 'opportunity');
  } else if (newDoc && newDoc.length > 0) {
    syncData.syncByType(integrationInfo, 'opportunity', user, allIntegrations, 'opportunityRecent');
  } else {
    throw new Error(`case missing: ${body}`);
  }
};

exports.task = (body) => {
  const {
    old,
    integrationInfo,
    user,
    allIntegrations,
  } = body;
  const newDoc = body.new;
  if (!newDoc && old && old.length > 0) {
    if (old[0].TaskSubtype === 'Call') {
      console.log('old[0].Id :', old[0].Id);
      deleteData(old[0].Id, 'task');
    }
  } else if (newDoc && newDoc.length > 0) {
    if (newDoc[0].TaskSubtype === 'Call') {
      syncData.syncByType(integrationInfo, 'task', user, allIntegrations, 'taskRecent');
    }
  } else {
    throw new Error(`case missing: ${body}`);
  }
};

exports.event = (body) => {
  const {
    old,
    integrationInfo,
    user,
    allIntegrations,
  } = body;
  const newDoc = body.new;
  if (!newDoc && old && old.length > 0) {
    deleteData(old[0].Id, 'event');
  } else if (newDoc && newDoc.length > 0) {
    syncData.syncByType(integrationInfo, 'event', user, allIntegrations, 'eventRecent');
  } else {
    throw new Error(`case missing: ${body}`);
  }
};

exports.account = (body) => {
  const { integrationInfo, user, allIntegrations } = body;
  const newDoc = body.new;
  if (newDoc && newDoc.length > 0) {
    syncData.syncByType(integrationInfo, 'account', user, allIntegrations, 'accountRecent');
  } else {
    throw new Error(`case missing: ${body}`);
  }
};

exports.user = async (body) => {
  const { integrationInfo, user } = body;
  const newDoc = body.new;
  if (newDoc && newDoc.length > 0 && newDoc[0].Id) {
    const userFound = await api.getOneUser(integrationInfo.instanceUrl, integrationInfo.token, 'users', newDoc[0].Id);
    if (userFound && userFound.records && userFound.length === 1) {
      const formattedUser = await formatData.coworkerInfo(userFound.records[0], integrationInfo.integrationTeam);
      await sendData.user({
        coworker: formattedUser,
        name: 'Salesforce',
        user,
        integrationInfo,
      });
    }
  }
};
