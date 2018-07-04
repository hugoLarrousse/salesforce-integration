const express = require('express');
const request = require('request-promise');

const router = express.Router();

router.get('/access', async (req, res) => {
  const code = req.query.code;
  if(!code) {
    return res.send('code missing');
  }
  const { urlToken, clientId, clientSecret,  redirectUri} = process.env
  const options = {
    method: 'POST',
    url: `${urlToken}?grant_type=${grantType}&code=${code}&client_secret=${clientSecret}&client_id=${clientId}&redirect_uri=${redirectUri}`,
    json: true,
  };
  try {
    const result = await request(options);
    res.status(200).json(result);
  } catch (e) {
    console.log('e.message :', e.message);
    res.status(200).json(e.message);
  }
});

// router.post('/pair', verifyToken, verifyParams, async (req, res) => {

// });

module.exports = router;
