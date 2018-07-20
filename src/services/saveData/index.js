const mongo = require('../../db/mongo');
const logger = require('../../utils/logger');

const { databaseSalesforce } = process.env;

const collectionName = {
  opportunity: 'opportunities',
  event: 'events',
  task: 'tasks',
  account: 'accounts',
};

module.exports = async (dataType, documents) => {
  const collection = collectionName[dataType] || null;

  const Ids = documents.map(doc => doc.Id);
  const docsFound = await mongo.find(databaseSalesforce, collection, { id: { $in: Ids } });
  const IdsFound = docsFound.map(docFound => docFound.Id);
  const toInsert = documents.filter(doc => !IdsFound.includes(doc.Id));
  const toUpdate = documents.filter(doc => IdsFound.includes(doc.Id));
  for (const doc of toUpdate) {
    const filter = {
      id: doc.Id,
    };
    try {
      await mongo.updateOne(databaseSalesforce, collection, filter, doc);
    } catch (e) {
      logger.errorDb(__filename, 'saveData', databaseSalesforce.name, collection, e.message, null, doc);
      return {
        arrayInsert: [],
        arrayUpdate: [],
      };
    }
  }
  await mongo.insertMany(databaseSalesforce, collection, toInsert);
  return {
    arrayInsert: toInsert,
    arrayUpdate: toUpdate,
  };
};
