const { fixedToken } = process.env

const pickToken = headers => headers.authorization || null;

const compareToken = token => token === fixedToken;

exports.verifyToken = (req, res, next) => {
  console.log('req.headers :', req.headers);
  if (compareToken(pickToken(req.headers))) {
    next();
  } else {
    res.status(401).send({ error: true, message: 'Error Token' });
  }
}