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
  const arrayInsert = [];
  const arrayUpdate = [];
  for (const doc of documents) {
    const filter = {
      id: doc.Id,
    };
    try {
      const resultUpdate = await mongo.updateOneSalesforce(databaseSalesforce, collection, filter, doc, { upsert: true });
      if (resultUpdate.upserted) {
        arrayInsert.push(doc);
      }
      if (resultUpdate.nModified) {
        arrayUpdate.push(doc);
      }
    } catch (e) {
      logger.errorDb(__filename, 'saveData', databaseSalesforce, collection, e.message, null, doc);
      return {
        arrayInsert,
        arrayUpdate,
      };
    }
  }
  return {
    arrayInsert,
    arrayUpdate,
  };
};
