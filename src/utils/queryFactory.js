const listOfTypes = {
  opportunity: 'opportunity',
  event: 'event',
  task: 'task',
  account: 'account',
  users: 'user',
  user: 'user',
  opportunityCron: 'opportunity',
  eventCron: 'event',
  taskCron: 'task',
  accountCron: 'account',
  opportunityAuto: 'opportunity',
  eventAuto: 'event',
  taskAuto: 'task',
  accountAuto: 'account',
  opportunityRecent: 'opportunity',
  eventRecent: 'event',
  taskRecent: 'task',
  accountRecent: 'account',
};

const formatKeys = (keys, keysToRemove, keysToAdd) => {
  let k = typeof keys === 'string' ? keys : keys.length && keys.join(',');
  if (keysToRemove) {
    for (const keyToRemove of keysToRemove) {
      k = k.replace(`,${keyToRemove}`, '');
    }
  }
  if (keysToAdd) {
    for (const keyToAdd of keysToAdd) {
      k += `,${keyToAdd}`;
    }
  }
  return k;
};

const formatFilters = (filters) => filters && filters.length && filters.join('+AND+');

module.exports = (keys, filters, type, keysToRemove, keysToAdd, operator = 'SELECT') => {
  if (!keys) throw Error('no keys provided');
  // if (!filter) throw Error('no filter provided');
  if (!type) throw Error('no type provided');

  const keysFormatted = formatKeys(keys, keysToRemove, keysToAdd);
  if (!keysFormatted) throw Error(`keys malformed, must be a string or an array, ${keys}`);

  const filterFormatted = (filters && typeof filters === 'string') ? filters : formatFilters(filters);

  const realType = listOfTypes[type];
  if (!realType) throw Error(`this type: ${type} does not match the list`);

  return `q=${operator}+${keysFormatted}+from+${realType}${filters && filterFormatted ? `+WHERE+${filterFormatted}` : ''}`;
};
