const requestRetry = require('requestretry');
const config = require('config');

const MAX_ATTEMPTS = config.get('requestRetry.maxAttempts');
const RETRY_DELAY = config.get('requestRetry.retryDelay');

const defaultRetryStrategy = (err, response) =>
  (response && response.body && (response.statusCode < 200 || response.statusCode > 299));

const requestSalesforce = async (baseUrl, path, method, data) => {
  const options = {
    method,
    url: `${baseUrl}${path}`,
    headers: {
      'Content-Type': 'application/json',
    },
    body: data,
    json: true,
    maxAttempts: MAX_ATTEMPTS,
    retryDelay: RETRY_DELAY,
    retryStrategy: defaultRetryStrategy,
  };

  const { error, response, body } = await requestRetry(options);
  if (error) {
    console.log('error:', error);
    return null;
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
    return body;
  }
  return null;
};

exports.requestSalesforce = requestSalesforce;