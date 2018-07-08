const credentials = (infoLogin) => {
  return {
    token: infoLogin.access_token,
    refreshToken: infoLogin.refresh_token,
    tokenExpiresAt: Number(infoLogin.issued_at) + 86400000,
    instanceUrl: infoLogin.instance_url,
  };
};

const currency = {
  EURO: 'EUR',
};

exports.userInfo = (infoUser) => {
  return {
    email: infoUser.email,
    teamId: infoUser.organization_id,
    userId: infoUser.user_id,
    lang: infoUser.language.split('_')[0],
    // admin
    phone: infoUser.mobile_phone,
    // teamName
    iconUrl: infoUser.photos.picture.split('profilephoto/')[1].length > 8 ? infoUser.photos.picture : null,
    default_currency: currency[infoUser.locale.split('_')[2]] || 'USD',
    credentials: credentials(infoUser.credentials),
  };
};

