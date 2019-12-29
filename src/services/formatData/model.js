const icon = {
  call: 'icon icon-phone phone',
  meeting: 'icon icon-meeting meeting',
  'deal-opened': 'icon icon-deal opened',
  'deal-won': 'icon icon-deal won',
  'deal-lost': 'icon icon-deal lost',
};


exports.h7Info = (integrationId, allIntegrations, teamH7Id) => {
  const [integration] = allIntegrations.filter(i => integrationId === i.integrationId);
  return {
    orga_h7_id: (integration && integration.orgaId) || null,
    team_h7_id: teamH7Id,
    user_h7_id: (integration && integration.userId) || null,
  };
};

exports.type = (type) => {
  return { type };
};

exports.source = (id, teamId, userId, opportunityId) => {
  return {
    source: {
      name: 'salesforce',
      id: id || null,
      team_id: teamId || null,
      user_id: userId || null,
      deal_id: opportunityId || null,
    },
  };
};

exports.description = (titre, subject, type) => {
  return {
    description: {
      titre: titre || '',
      sujet: subject || '',
      icon: icon[type] || null,
    },
  };
};

exports.finalClient = (accountName) => {
  return {
    final_client: {
      name: accountName,
    },
  };
};

exports.parametres = (value, currency, dealId, status) => {
  return {
    parametres: {
      valeur: value || null,
      devise: currency || null,
      deal_id: dealId || null,
      status: status || null,
      show: status !== 'lost',
    },
  };
};

exports.timestamp = (dateAdd, dateDone, dateEnd, dateMarkedDone, dateExpected) => {
  return {
    date_add_timestamp: dateAdd || null,
    date_done_timestamp: dateDone || null,
    date_end_timestamp: dateEnd || null,
    date_marked_done_timestamp: dateMarkedDone || null,
    date_expected_timestamp: dateExpected || null,
  };
};

exports.notify_users = (isInsert) => {
  return isInsert ? { notify_users: [] } : {};
};

exports.otherUsers = ({ OwnerId, CreatedById, LastModifiedById }, allIntegrations) => {
  if (!OwnerId && !CreatedById && !LastModifiedById) return null;
  const salesforceIds = [...new Set([OwnerId, CreatedById, LastModifiedById])];
  const h7Ids = salesforceIds.map(id => {
    const integration = allIntegrations.find(a => a.integrationId === id);
    return integration && String(integration.userId);
  });
  return { otherUserIds: h7Ids.filter(id => id) };
};

