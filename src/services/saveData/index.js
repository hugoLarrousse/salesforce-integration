const mongo = require('../../db/mongo');
const logger = require('../../utils/logger');

const { databaseSalesforce } = process.env;

const collectionName = {
  opportunities: 'opportunities',
  events: 'events',
};

const saveData = async (dataType, documents) => {
  const collection = collectionName[dataType] || null;
  for (const doc of documents) {
    const filter = {};
    //   id: Number(doc.id),
    //   team: Number(doc.team),
    // };
    try {
      const result = await mongo.updateOne(databaseSalesforce, collection, filter, doc, { upsert: true });
      console.log('result :', result);
    } catch (e) {
      logger.error(__filename, saveData.name, e.message);
    }
  }
};

exports.saveData = saveData;
