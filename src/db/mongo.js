const { MongoClient } = require('mongodb');
const {
  addUpdatedAtToModel,
  addCreatedAtToModel,
  softDeleteRetrieveCondition,
} = require('./utils/mongoHelper');
const logger = require('../utils/logger');

const {
  databaseSalesforce,
  mongoOptions,
  dbServer,
} = process.env;

const mongodbSalesforce = MongoClient
  .connect(`${dbServer}/${databaseSalesforce}${mongoOptions || ''}`, { poolSize: 20 })
  .catch(err => logger.errorDb(__filename, 'mongo', null, null, `MongoClient.connect() : ${err.message}`, null, err));

const mongodbName = {
  salesforce: mongodbSalesforce,
};


const insert = async (databaseName, collectionName, doc) => {
  const docToSave = addCreatedAtToModel(doc);
  const db = await mongodbName[databaseName];
  console.log('db :', `${dbServer}/${databaseSalesforce}${mongoOptions || ''}`);
  const response = await db.collection(collectionName).insertOne(docToSave);
  let insertedDoc;
  if (response.ops.length > 0) {
    [insertedDoc] = response.ops;
  } else {
    logger.errorDb(__filename, insert.name, databaseName, collectionName, 'Unable to insert', null, doc);
  }
  return insertedDoc;
};

const updateOne = async (databaseName, collectionName, query = {}, doc, options = {}) => {
  const docToUpdate = { $set: addUpdatedAtToModel(doc) };
  const db = await mongodbName[databaseName];
  console.log('db :', `${dbServer}/${databaseSalesforce}${mongoOptions || ''}`);
  const docUpdated = await db.collection(collectionName)
    .findOneAndUpdate(
      {
        ...query,
        ...softDeleteRetrieveCondition,
      },
      docToUpdate,
      {
        ...options,
        returnOriginal: false,
      }
    );
  if (docUpdated.ok === 1 && docUpdated.value) {
    // logger.infoDb(__filename, updateOne.name, databaseName, collectionName, `${docUpdated.value._id} updated`, docUpdated.value._id);
  } else {
    logger.warnDb(__filename, updateOne.name, databaseName, collectionName, 'Unable to update', null, doc);
  }
  return docUpdated.value;
};

const updateOneSalesforce = async (databaseName, collectionName, query = {}, doc, options = {}) => {
  const docToUpdate = { $set: doc };
  const db = await mongodbName[databaseName];
  console.log('db :', `${dbServer}/${databaseSalesforce}${mongoOptions || ''}`);
  const docUpdated = await db.collection(collectionName)
    .updateOne(
      {
        ...query,
      },
      docToUpdate,
      {
        returnOriginal: false,
        ...options,
      }
    );

  if (docUpdated.result.ok === 1) {
    return docUpdated.result;
  }
  logger.warnDb(__filename, updateOneSalesforce.name, databaseName, collectionName, 'Unable to update', null, doc);

  return null;
};


const update = async (databaseName, collectionName, query = {}, doc, options = {}) => {
  const docToUpdate = { $set: addUpdatedAtToModel(doc) };
  const db = await mongodbName[databaseName];
  console.log('db :', `${dbServer}/${databaseSalesforce}${mongoOptions || ''}`);
  const updated = await db.collection(collectionName)
    .update(
      {
        ...query,
        ...softDeleteRetrieveCondition,
      },
      docToUpdate,
      {
        ...options,
        returnOriginal: false,
      }
    );
  if (updated.result.n > 0 && updated.result.ok === 1) {
    // logger.infoDb(__filename, update.name, databaseName, collectionName, `${updated.result.nModified} updated`, null, doc);
  } else if (!options.multi) {
    logger.errorDb(__filename, update.name, databaseName, collectionName, 'Unable to update', null, doc);
  }
  return updated.result;
};

const softDelete = async (databaseName, collectionName, query = {}) =>
  updateOne(databaseName, collectionName, query, { deletedAt: Date.now() });

const softDeleteMany = async (databaseName, collectionName, query = {}) =>
  update(databaseName, collectionName, query, { deletedAt: Date.now() }, { multi: true });

const deleteDoc = async (databaseName, collectionName, query) => {
  const db = await mongodbName[databaseName];
  console.log('db :', `${dbServer}/${databaseSalesforce}${mongoOptions || ''}`);
  const deleted = await db.collection(collectionName).remove(query);
  if (deleted.result.ok === 1 && deleted.result.n >= 1) {
    // logger.infoDb(__filename, deleteDoc.name, databaseName, collectionName, `${query._id} was removed`, query._id);
    return true;
  }
  logger.errorDb(__filename, deleteDoc.name, databaseName, collectionName, 'Unable to delete', null, query);
  return false;
};

const findOne = async (databaseName, collectionName, query = {}) => {
  const db = await mongodbName[databaseName];
  const docFound = await db.collection(collectionName).findOne({ ...query, ...softDeleteRetrieveCondition });
  return docFound;
};

const find = async (databaseName, collectionName, query = {}, sort = {}, limit = 0, offset = 0) => {
  const db = await mongodbName[databaseName];
  console.log('db :', `${dbServer}/${databaseSalesforce}${mongoOptions || ''}`);
  const docs = await db.collection(collectionName)
    .find({
      ...query,
      ...softDeleteRetrieveCondition,
    })
    .sort(sort)
    .limit(Number(limit))
    .skip(Number(offset))
    .toArray();
  return docs;
};

const count = async (databaseName, collectionName, query) => {
  const db = await mongodbName[databaseName];
  console.log('db :', `${dbServer}/${databaseSalesforce}${mongoOptions || ''}`);
  return db.collection(collectionName)
    .count({
      ...query,
      ...softDeleteRetrieveCondition,
    });
};

const deleteMany = async (databaseName, collection, query, options) => {
  const db = await mongodbName[databaseName];
  console.log('db :', `${dbServer}/${databaseSalesforce}${mongoOptions || ''}`);
  const resultDelete = await db.collection(collection).deleteMany(query, options);
  return resultDelete.result;
};

const updateOwnRules = async (databaseName, collection, query = {}, docToUpdate, options = {}) => {
  const db = await mongodbName[databaseName];
  console.log('db :', `${dbServer}/${databaseSalesforce}${mongoOptions || ''}`);
  const updated = await db.collection(collection)
    .update(
      query,
      docToUpdate,
      {
        ...options,
      }
    );
  if (updated.result.n > 0 && updated.result.ok === 1) {
    // logger.infoDb(__filename, pipedriveUpdate.name, database, collection, `${updated.result.nModified} updated`, null, docToUpdate);
  } else {
    logger.errorDb(__filename, updateOwnRules.name, databaseName, collection, 'Unable to update', null, docToUpdate);
  }
  return updated.result;
};

const updateOneOwnRules = async (databaseName, collection, query, docToUpdate, options = {}) => {
  const db = await mongodbName[databaseName];
  console.log('db :', `${dbServer}/${databaseSalesforce}${mongoOptions || ''}`);
  const docUpdated = await db.collection(collection).findOneAndUpdate(query, docToUpdate, { returnOriginal: false, ...options });
  if (docUpdated.ok === 1 && docUpdated.value) {
    // logger.infoDb(__filename, pipedriveUpdateOne.name, database, collection, `${docUpdated.value._id} updated`, docUpdated.value._id);
  } else if (docUpdated.lastErrorObject.upserted !== null) {
    // logger.infoDb(__filename, pipedriveUpdateOne.name, database, collection, `${docUpdated.lastErrorObject.upserted} created`);
  } else {
    logger.warnDb(__filename, updateOneOwnRules.name, databaseName, collection, 'Unable to update', null, { docToUpdate });
  }
  return docUpdated;
};

const findOneAndReplace = async (databaseName, collection, query, toUpdate, options) => {
  const db = await mongodbName[databaseName];
  console.log('db :', `${dbServer}/${databaseSalesforce}${mongoOptions || ''}`);
  const docFoundAndModified = await db.collection(collection).findOneAndReplace(query, toUpdate, options);
  if (docFoundAndModified.ok === 1) {
    return docFoundAndModified.value;
  }
  logger.error(__filename, findOneAndReplace.name, `error: query: ${query}, toUpdate: ${toUpdate}; options: ${options}`);
  return null;
};


// exports.getConnection = getConnection;
exports.insert = insert;
exports.updateOne = updateOne;
exports.update = update;
exports.softDelete = softDelete;
exports.softDeleteMany = softDeleteMany;
exports.deleteDoc = deleteDoc;
exports.findOne = findOne;
exports.find = find;
exports.count = count;
exports.deleteMany = deleteMany;
exports.updateOneOwnRules = updateOneOwnRules;
exports.updateOwnRules = updateOwnRules;
exports.mongodbName = mongodbName;
exports.findOneAndReplace = findOneAndReplace;
exports.updateOneSalesforce = updateOneSalesforce;
