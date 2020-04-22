const requestRetry = require('requestretry');
const config = require('config');
const logger = require('../../utils/logger');

const MAX_ATTEMPTS = config.get('requestRetry.maxAttempts');
const RETRY_DELAY = config.get('requestRetry.retryDelay');

const regexGetInvalidField = new RegExp("'(.*?)'", '');


const checkBody = (body, options) => {
  if (!body) {
    logger.error(__filename, 'checkBody', `error no body : url${options.url},
      headers Authorization ${options.headers && options.headers.Authorization}`);
  } else if (body.error) {
    logger.error(__filename, 'checkBody', `get body.error : url${options.url},
    headers Authorization ${options.headers && options.headers.Authorization},
    body error: ${body.error} : description: ${body.error_description || ''}`);
  } else if (body[0] && body[0].errorCode) {
    let match = null;
    if (body[0].errorCode === 'INVALID_FIELD') {
      match = body[0].message.match(regexGetInvalidField);
    }
    logger.error(__filename, 'checkBody', `get body errorCode : url${options.url},
    headers Authorization ${options.headers && options.headers.Authorization},
    body errorCode: ${body[0].errorCode}
    ${match && match[1] && `invalid field: ${match[1]}`}`);
  }
};

const defaultRetryStrategy = (err, response) =>
  (response && response.body && (response.statusCode < 200 || response.statusCode > 299));

const salesforce = async (baseUrl, path, query, method, headers, data, retry) => {
  const options = {
    method,
    url: `${baseUrl}${path ? `/${path}` : ''}${query ? `?${query}` : ''}`,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: data || {},
    json: true,
  };

  if (retry) {
    Object.assign(options, { maxAttempts: MAX_ATTEMPTS, retryDelay: RETRY_DELAY, retryStrategy: defaultRetryStrategy });
  }

  const { error, response, body } = await requestRetry(options);

  if (error) {
    throw new Error(error);
  }
  if (response && response.statusCode && response.statusCode === 400) {
    console.log('statusCode:', response && response.statusCode);
    console.log(body);
    return response.statusCode;
  }
  if (response && response.statusCode && response.statusCode !== 200) {
    console.log('statusCode:', response && response.statusCode);
    console.log(body);
    return null;
  }
  if (body) {
    checkBody(body, options);
    return body;
  }
  return null;
};

exports.salesforce = salesforce;
