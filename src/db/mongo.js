const { MongoClient } = require('mongodb');
const {
  addUpdatedAtToModel,
  addCreatedAtToModel,
  softDeleteRetrieveCondition,
} = require('./utils/mongoHelper');
const logger = require('../utils/logger');

let mongodbConnect = null;

const createConnection = async () => {
  try {
    mongodbConnect = await MongoClient.connect(process.env.dbServer, { poolSize: 20, useNewUrlParser: true, useUnifiedTopology: true });
    return 1;
  } catch (e) {
    logger.error(__filename, 'createConnection', e.message);
    return 0;
  }
};

const closeConnection = async () => mongodbConnect && mongodbConnect.close();

const insertMany = async (databaseName, collectionName, docs) => {
  const docsToSave = docs.map(doc => addCreatedAtToModel(doc));
  const response = await mongodbConnect.db(databaseName).collection(collectionName).insertMany(docsToSave);
  if (response.ops.length > 0) {
    return response.ops;
  }
  logger.errorDb(__filename, insertMany.name, databaseName, collectionName, 'Unable to insert many', null, docsToSave);
  return null;
};

const updateOne = async (databaseName, collectionName, query = {}, doc, options = {}) => {
  const docToUpdate = { $set: addUpdatedAtToModel(doc) };
  const docUpdated = await mongodbConnect.db(databaseName).collection(collectionName)
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


const update = async (databaseName, collectionName, query = {}, doc, options = {}) => {
  const docToUpdate = { $set: addUpdatedAtToModel(doc) };
  const updated = await mongodbConnect.db(databaseName).collection(collectionName)
    .updateMany(
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
  if (!options.multi) {
    logger.errorDb(__filename, update.name, databaseName, collectionName, `Unable to update, query: ${JSON.stringify(query)}`);
  }
  return updated.result;
};

const softDelete = async (databaseName, collectionName, query = {}) =>
  updateOne(databaseName, collectionName, query, { deletedAt: Date.now() });

const findOne = async (databaseName, collectionName, query = {}) => {
  const docFound = await mongodbConnect.db(databaseName).collection(collectionName).findOne({ ...query, ...softDeleteRetrieveCondition });
  return docFound;
};

const find = async (databaseName, collectionName, query = {}, sort = {}, limit = 0, offset = 0) => {
  const docs = await mongodbConnect.db(databaseName).collection(collectionName)
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
  return mongodbConnect.db(databaseName).collection(collectionName)
    .countDocuments({
      ...query,
      ...softDeleteRetrieveCondition,
    });
};

// const deleteMany = async (databaseName, collection, query, options) => {
//   const resultDelete = await mongodbConnect.db(databaseName).collection(collection).deleteMany(query, options);
//   return resultDelete.result;
// };

exports.createConnection = createConnection;
exports.closeConnection = closeConnection;
exports.updateOne = updateOne;
exports.update = update;
exports.softDelete = softDelete;
exports.findOne = findOne;
exports.find = find;
exports.count = count;
exports.insertMany = insertMany;
