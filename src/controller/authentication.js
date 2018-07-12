const express = require('express');
const api = require('../services/api');
const formatData = require('../services/formatData');

const router = express.Router();

router.get('/', async (req, res) => {
  console.log('AAAAAA 1 :');
  const { code } = req.query;
  try {
    if (!code) {
      throw new Error('code is missing');
    }
    const credentials = await api.getCredentials(code);
    console.log('AAAAAA 5 :');
    if (!credentials && !credentials.id) {
      throw new Error('no credentials');
    }
    console.log('AAAAAA 6 :');
    const userInfo = await api.getInfoUser(credentials.id, credentials.access_token);
    console.log('AAAAAA 10 :');
    console.log('userInfo :', userInfo);
    res.status(200).send(formatData.userInfo({ ...userInfo, credentials }));
  } catch (e) {
    res.status(400).json(e.message);
  }
});

module.exports = router;
