const logger = require('../../utils/logger');


exports.findValueInReport = (report, columnIndex, columnName, flatMapKey) => {
  try {
    if (!report || !report.factMap) {
      throw Error(`no report or no report.factMap, reportId: ${report && report.attributes.reportId}`);
    }
    const data = report.factMap[flatMapKey];
    if (!data || !data.aggregates) {
      throw Error(`no factMap found, reportId: ${report && report.attributes.reportId}`);
    }
    const aggregate = data.aggregates[columnIndex];


    const columnInfo = Object.values(report.reportExtendedMetadata.detailColumnInfo)[columnIndex];
    if (columnInfo.label !== columnName) {
      logger.error(__filename, 'findValueInReport', `ERROR Name:
        columnInfo.label (${columnInfo.label}) !== columnName ${columnName}`);
    }
    return Math.round(aggregate.value);
  } catch (e) {
    logger.error(__filename, 'findValueInReport', e.message);
    return null;
  }
};
