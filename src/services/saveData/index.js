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

  // manage toDelete doc
  const IdsToDelete = documents.map(doc => doc.IsDeleted && doc.Id);

  const docsFoundToDelete = await mongo.find(databaseSalesforce, collection, { Id: { $in: IdsToDelete } });
  const IdsFoundToDelete = docsFoundToDelete.map(docFoundToDelete => docFoundToDelete.Id);
  const toDelete = documents.filter(doc => doc.IsDeleted && IdsFoundToDelete.includes(doc.Id));

  const Ids = documents.map(doc => !doc.IsDeleted && doc.Id);
  const docsFound = await mongo.find(databaseSalesforce, collection, { Id: { $in: Ids } });

  const IdsFound = docsFound.map(docFound => docFound.Id);
  const toInsert = documents.filter(doc => !doc.IsDeleted && !IdsFound.includes(doc.Id));
  const toUpdate = documents.filter(doc => !doc.IsDeleted && IdsFound.includes(doc.Id));
  for (const doc of toUpdate) {
    const filter = {
      Id: doc.Id,
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
  if (toInsert.length > 0) {
    await mongo.insertMany(databaseSalesforce, collection, toInsert);
  }

  for (const doc of toDelete) {
    const filter = {
      Id: doc.Id,
    };
    try {
      await mongo.softDelete(databaseSalesforce, collection, filter);
    } catch (e) {
      logger.errorDb(__filename, 'saveData', databaseSalesforce.name, collection, e.message, null, doc);
      return {
        arrayInsert: [],
        arrayUpdate: [],
      };
    }
  }
  return {
    arrayInsert: toInsert,
    arrayUpdate: toUpdate,
    arrayDelete: toDelete,
  };
};
