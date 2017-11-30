const express = require('express');
const bodyParser = require('body-parser');

const checkWork = require('./checkWork').check;

const app = express();
app.use(bodyParser.json());

const fixedSecret = 'token';

const tokens = {};

app.post('/recaptcha/api/siteverify', (req, res) => {
  const secret = req.body.secret;
  const responseToken = req.body.response;

  const answer = {
    success: false,
    challenge_ts: new Date().toISOString(),
    hostname: 'https://',
    'error-codes': [],
  };

  if (!secret) {
    answer['error-codes'].push('missing-input-secret');
  }
  if (secret !== fixedSecret) {
    answer['error-codes'].push('invalid-input-secret');
  }
  if (!responseToken) {
    answer['error-codes'].push('missing-input-response');
  }

  if (answer['error-codes'].length > 0) {
    return res.json(answer);
  }

  if (!tokens[responseToken]) {
    answer.success = tokens[responseToken].success;
  }

  return res.json(answer);
});

function makeid(length) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

app.post('/captcha/attempt', (req, res) => {
  const tokenAttempt = {
    id: `${makeid(10)}-${makeid(10)}`,
    success: checkWork(),
    hostname: 'https://', // grab from cookies?
  };

  tokens[tokenAttempt.id] = tokenAttempt;

  res.json(tokenAttempt.id);
});

const server = app.listen(process.env.PORT || 3001, (err) => {
  if (err) throw err;
  console.log(`listening on ${server.address().port}`);
});
